import { UserDTO, UserSuccessResponse, UserVerificationResponse, VerifyOtpDTO } from "../../domain/dtos/user/UserDto";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { IJwtManagementEngine } from "../../engines/jwt/IJwtManagementEngine";
import { User } from "../../domain/entities/User";
import { IUserUseCase } from "./IUserUseCase";
import { OtpService } from "../../infrastructure/services/otp/OtpService";
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
  otpService: OtpService;
  jwtManagementEngine: IJwtManagementEngine;
  activityEngine: IActivityEngine;
  producer: IProducer;
};

export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;
  private otpService: OtpService;
  private jwtManagementEngine: IJwtManagementEngine;
  private activityEngine: IActivityEngine;
  private producer: IProducer;

  constructor({
    userEngine,
    otpService,
    jwtManagementEngine,
    activityEngine,
    producer,
  }: UserUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.otpService = otpService;
    this.jwtManagementEngine = jwtManagementEngine;
    this.activityEngine = activityEngine;
    this.producer = producer;
  }

  async signUp(input: UserDTO): Promise<UserSuccessResponse> {
    const existingUser = await this.userEngine.getUserByMobile(input.mobile);
    if (existingUser) {
      if (existingUser.status === UserStatus.BLOCKED) {
        throw new ApiError("Your account is blocked. Please contact support.", HttpStatus.FORBIDDEN);
      }
      if (existingUser.mobileVerified) {
        throw new ApiError("User with this mobile number already exists", HttpStatus.CONFLICT);
      }

      await this.userEngine.updateUser(existingUser.id, {
        name: input.name,
        email: input.email,
        role: input.role,
      });
    } else {
      await this.userEngine.createUser(input);
    }

    await this.otpService.sendOtp(input.mobile);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOtp(
    input: VerifyOtpDTO,
  ): Promise<UserVerificationResponse> {
    const user = await this.userEngine.getUserByMobile(input.mobile);
    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(
        "Your account is blocked. Please contact support.",
        HttpStatus.FORBIDDEN
      );
    }

    await this.otpService.verifyOtp(input.mobile, input.otp);

    let updatedUser = user;
    if (!user.mobileVerified) {
      const result = await this.userEngine.updateUser(user.id, {
        mobileVerified: true,
      });
      if (!result) {
        throw new ApiError("Failed to update user verification status", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      updatedUser = result;

      // Log registration activity
      await this.activityEngine.createActivity({
        type: updatedUser.role === "owner" ? "OWNER_REGISTERED" : "USER_REGISTERED",
        title: updatedUser.role === "owner" ? "New Owner Registration" : "New User Registration",
        description: `${updatedUser.name} Registered`,
        referenceId: updatedUser.id,
        referenceType: updatedUser.role === "owner" ? "OWNER" : "USER",
        performedBy: updatedUser.id,
      }).catch((err) => logger.error("Failed to log registration activity:", err));

      // Notify Admin(s) of new registration
      try {
        const admins = await this.userEngine.getAllUsers({ role: UserRoles.ADMIN });
        for (const admin of admins) {
          await this.producer.publish(BrokerConfig.routingKeys.ADMIN_NOTIFICATION, {
            receiverId: admin.id,
            senderId: updatedUser.id,
            role: UserRoles.ADMIN,
            type: "user_registered",
            title: "New User Registration",
            message: `${updatedUser.name} has registered as a ${updatedUser.role}.`,
            referenceId: updatedUser.id,
            referenceType: "user",
            isRead: false,
            readAt: null,
            delivered: false,
          });
        }
      } catch (error) {
        logger.error("Failed to notify admins of user registration:", error);
      }
    }

    const redirectUrl = updatedUser.role === UserRoles.OWNER ? "/owner/dashboard" : "/dashboard";

    const token = this.jwtManagementEngine.generateToken({
      id: updatedUser.id,
      role: updatedUser.role,
      mobile: updatedUser.mobile,
    });

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
      },
      token,
      redirectUrl,
    };
  }

  async resendOtp(
    mobile: string,
  ): Promise<UserSuccessResponse> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new ApiError("User not found", HttpStatus.NOT_FOUND);
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(
        "Your account is blocked. Please contact support.",
        HttpStatus.FORBIDDEN
      );
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP resent successfully",
    };
  }

  async signIn(mobile: string): Promise<UserSuccessResponse> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new ApiError("User not found", HttpStatus.NOT_FOUND);
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(
        "Your account is blocked. Please contact support.",
        HttpStatus.FORBIDDEN
      );
    }

    if (!user.mobileVerified) {
      throw new ApiError(
        "User mobile is not verified",
        HttpStatus.FORBIDDEN
      );
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async getUserByMobile(mobile: string): Promise<User | null> {
    return await this.userEngine.getUserByMobile(mobile);
  }
}
