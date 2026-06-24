import { UserDTO, UserSuccessResponse, UserVerificationResponse, VerifyOtpDTO } from "../../domain/dtos/user/UserDto";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { IJwtManagementEngine } from "../../engines/jwt/IJwtManagementEngine";
import { User } from "../../domain/entities/User";
import { IUserUseCase } from "./IUserUseCase";
import { OtpService } from "../../infrastructure/services/otp/OtpService";
import { REDIRECT_PATHS } from "../../domain/constants/constants";
import { ApiError } from "../../domain/errors/ApiError";
import { IActivityEngine } from "../../engines/activity/IActivityEngine";

type UserUseCaseConstructorParams = {
  userEngine: IUserEngine;
  otpService: OtpService;
  jwtManagementEngine: IJwtManagementEngine;
  activityEngine: IActivityEngine;
};

export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;
  private otpService: OtpService;
  private jwtManagementEngine: IJwtManagementEngine;
  private activityEngine: IActivityEngine;

  constructor({
    userEngine,
    otpService,
    jwtManagementEngine,
    activityEngine,
  }: UserUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.otpService = otpService;
    this.jwtManagementEngine = jwtManagementEngine;
    this.activityEngine = activityEngine;
  }

  async signUp(input: UserDTO): Promise<UserSuccessResponse> {
    const existingUser = await this.userEngine.getUserByMobile(input.mobile);
    if (existingUser) {
      if (existingUser.mobileVerified) {
        throw new ApiError("User with this mobile number already exists");
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
        "User not found"
      );
    }

    await this.otpService.verifyOtp(input.mobile, input.otp);

    let updatedUser = user;
    if (!user.mobileVerified) {
      const result = await this.userEngine.updateUser(user.id, {
        mobileVerified: true,
      });
      if (!result) {
        throw new ApiError("Failed to update user verification status");
      }
      updatedUser = result;

      // Log registration activity
      await this.activityEngine.createActivity({
        type: updatedUser.role === "owner" ? "OWNER_REGISTERED" : "USER_REGISTERED",
        title: updatedUser.role === "owner" ? "New Owner Registration" : "New User Registration",
        description: `${updatedUser.name} Registered`,
        referenceId: updatedUser.id,
        referenceType: updatedUser.role === "owner" ? "ONWER" : "USER",
        performedBy: updatedUser.id,
      }).catch((err) => console.error("Failed to log registration activity:", err));
    }

    const redirectUrl = REDIRECT_PATHS[updatedUser.role];

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
      throw new ApiError("User not found");
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
      throw new ApiError("User not found");
    }

    if (!user.mobileVerified) {
      throw new ApiError(
        "User mobile is not verified",
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
