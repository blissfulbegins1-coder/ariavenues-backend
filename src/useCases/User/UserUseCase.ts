import { CreateUserDTO } from "../../domain/dtos/user/CreateUserDTO";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { IJwtManagementEngine } from "../../engines/jwt/IJwtManagementEngine";
import { IUserUseCase } from "./IUserUseCase";
import { OtpService } from "../../infrastructure/services/otp/OtpService";
import { REDIRECT_PATHS } from "../../domain/constants/constants";
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidUserDataError,
} from "../../domain/errors/UserErrors";

type UserUseCaseConstructorParams = {
  userEngine: IUserEngine;
  otpService: OtpService;
  jwtManagementEngine: IJwtManagementEngine;
};

export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;
  private otpService: OtpService;
  private jwtManagementEngine: IJwtManagementEngine;

  constructor({
    userEngine,
    otpService,
    jwtManagementEngine,
  }: UserUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.otpService = otpService;
    this.jwtManagementEngine = jwtManagementEngine;
  }

  async signUp(
    input: CreateUserDTO,
  ): Promise<{ success: boolean; message: string }> {
    const existingUser = await this.userEngine.getUserByMobile(input.mobile);
    if (existingUser) {
      if (existingUser.mobileVerified) {
        throw new UserAlreadyExistsError(input.mobile);
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
    mobile: string,
    otp: string,
  ): Promise<{
    user: { id: string; name: string };
    token: string;
    redirectUrl: string;
  }> {
    // 1. Find the pending/existing user
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    // 2. Verify OTP via service
    await this.otpService.verifyOtp(mobile, otp);

    // 3. Mark user as verified (if not already verified)
    let updatedUser = user;
    if (!user.mobileVerified) {
      const result = await this.userEngine.updateUser(user.id, {
        mobileVerified: true,
      });
      if (!result) {
        throw new Error("Failed to update user verification status");
      }
      updatedUser = result;
    }

    // 4. Calculate redirectUrl based on role from constants
    const redirectUrl = REDIRECT_PATHS[updatedUser.role];

    // 5. Generate JWT
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
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP resent successfully",
    };
  }

  async signIn(mobile: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    if (!user.mobileVerified) {
      throw new InvalidUserDataError(
        "User mobile is not verified. Please complete verification via signup",
      );
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }
}
