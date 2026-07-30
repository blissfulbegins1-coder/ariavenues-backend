import { UserDTO, UserAuthResponse } from "../../domain/dtos/user/UserDto";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { IJwtManagementEngine } from "../../engines/jwt/IJwtManagementEngine";
import { User } from "../../domain/entities/User";
import { IUserUseCase } from "./IUserUseCase";
import { ApiError } from "../../domain/errors/ApiError";
import { IActivityEngine } from "../../engines/activity/IActivityEngine";
import { IProducer } from "../../infrastructure/amqp/producer/IProducer";
import { BrokerConfig } from "../../infrastructure/config/brocker/brokerConfig";
import UserRoles from "../../domain/enums/UserRole";
import UserStatus from "../../domain/enums/UserStatus";
import { HttpStatus } from "../../domain/enums/HttpStatus";
import { logger } from "../../utils/logger";

type UserUseCaseConstructorParams = {
  userEngine: IUserEngine;
  jwtManagementEngine: IJwtManagementEngine;
  activityEngine: IActivityEngine;
  producer: IProducer;
};

export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;
  private jwtManagementEngine: IJwtManagementEngine;
  private activityEngine: IActivityEngine;
  private producer: IProducer;

  constructor({
    userEngine,
    jwtManagementEngine,
    activityEngine,
    producer,
  }: UserUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.jwtManagementEngine = jwtManagementEngine;
    this.activityEngine = activityEngine;
    this.producer = producer;
  }

  async signUp(input: UserDTO): Promise<UserAuthResponse> {
    const existingUser = await this.userEngine.getUserByMobile(input.mobile);
    if (existingUser) {
      if (existingUser.status === UserStatus.BLOCKED) {
        throw new ApiError("Your account is blocked. Please contact support.", HttpStatus.FORBIDDEN);
      }
      throw new ApiError(
        "An account with this mobile number already exists",
        HttpStatus.CONFLICT,
      );
    }

    await this.userEngine.createUser(input);
    const created = await this.userEngine.getUserByMobile(input.mobile);
    if (!created) {
      throw new ApiError("Failed to create user account", HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const userToAuth = created;

    // Log registration activity
    await this.activityEngine.createActivity({
      type: userToAuth.role === "owner" ? "OWNER_REGISTERED" : "USER_REGISTERED",
      title: userToAuth.role === "owner" ? "New Owner Registration" : "New User Registration",
      description: `${userToAuth.name} Registered`,
      referenceId: userToAuth.id,
      referenceType: userToAuth.role === "owner" ? "OWNER" : "USER",
      performedBy: userToAuth.id,
    }).catch((err) => logger.error("Failed to log registration activity:", err));

    // Notify Admin(s) of new registration
    try {
      const admins = await this.userEngine.getAllUsers({ role: UserRoles.ADMIN });
      for (const admin of admins) {
        await this.producer.publish(BrokerConfig.routingKeys.ADMIN_NOTIFICATION, {
          receiverId: admin.id,
          senderId: userToAuth.id,
          role: UserRoles.ADMIN,
          type: "user_registered",
          title: "New User Registration",
          message: `${userToAuth.name} has registered as a ${userToAuth.role}.`,
          referenceId: userToAuth.id,
          referenceType: "user",
          isRead: false,
          readAt: null,
          delivered: false,
        });
      }
    } catch (error) {
      logger.error("Failed to notify admins of user registration:", error);
    }

    const redirectUrl = userToAuth.role === UserRoles.OWNER ? "/owner/dashboard" : "/dashboard";
    const token = this.jwtManagementEngine.generateToken({
      id: userToAuth.id,
      role: userToAuth.role,
      mobile: userToAuth.mobile,
    });

    return {
      user: {
        id: userToAuth.id,
        name: userToAuth.name,
      },
      token,
      redirectUrl,
    };
  }

  async signIn(mobile: string): Promise<UserAuthResponse> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new ApiError("No account found for this mobile number. Please create an account.", HttpStatus.NOT_FOUND);
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(
        "Your account is blocked. Please contact support.",
        HttpStatus.FORBIDDEN,
      );
    }

    const redirectUrl = user.role === UserRoles.OWNER ? "/owner/dashboard" : "/dashboard";
    const token = this.jwtManagementEngine.generateToken({
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
      },
      token,
      redirectUrl,
    };
  }

  async getUserByMobile(mobile: string): Promise<User | null> {
    return await this.userEngine.getUserByMobile(mobile);
  }
}
