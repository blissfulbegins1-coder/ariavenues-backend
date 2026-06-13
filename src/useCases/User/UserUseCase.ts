import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';
import { IUserEngine } from '../../engines/user/IUserEngine';
import { IJwtManagementEngine } from '../../engines/jwt/IJwtManagementEngine';
import { IUserUseCase } from './IUserUseCase';
import { OtpService } from '../../infrastructure/services/otp/OtpService';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidUserDataError,
} from '../../domain/errors/UserErrors';

type UserUseCaseConstructorParams = {
  userEngine: IUserEngine;
  otpService: OtpService;
  jwtManagementEngine: IJwtManagementEngine;
};

// User Use Case - handles validation and orchestration only
export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;
  private otpService: OtpService;
  private jwtManagementEngine: IJwtManagementEngine;

  constructor({ userEngine, otpService, jwtManagementEngine }: UserUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.otpService = otpService;
    this.jwtManagementEngine = jwtManagementEngine;
  }

  /**
   * SignUp - checks if user exists, creates pending user, and sends OTP
   */
  async signUp(input: CreateUserDTO): Promise<{ success: boolean; message: string }> {
    // 1. Basic validation
    if (input.email && !input.email.includes('@')) {
      throw new InvalidUserDataError('Invalid email format');
    }

    if (input.mobile.length < 10) {
      throw new InvalidUserDataError('Mobile number must be at least 10 digits');
    }

    if (input.name.trim().length === 0) {
      throw new InvalidUserDataError('Name cannot be empty');
    }

    // 2. Check if user already exists
    const existingUser = await this.userEngine.getUserByMobile(input.mobile);
    if (existingUser) {
      if (existingUser.mobileVerified) {
        throw new UserAlreadyExistsError(input.mobile);
      }

      // If they exist but are not verified, update their information and resend OTP
      await this.userEngine.updateUser(existingUser.id, {
        name: input.name,
        email: input.email,
        role: input.role,
      });
    } else {
      // Create new pending user
      await this.userEngine.createUser(input);
    }

    // 3. Send OTP
    await this.otpService.sendOtp(input.mobile);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  /**
   * Verify OTP - verifies code with MSG91 and activates the user
   */
  async verifyOtp(mobile: string, otp: string): Promise<{ user: User; token: string }> {
    // 1. Find the pending/existing user
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    // 2. Verify OTP via service
    await this.otpService.verifyOtp(mobile, otp);

    // 3. Mark user as verified
    const updatedUser = await this.userEngine.updateUser(user.id, {
      mobileVerified: true,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user verification status');
    }

    // 4. Generate JWT
    const token = this.jwtManagementEngine.generateToken({
      id: updatedUser.id,
      role: updatedUser.role,
      mobile: updatedUser.mobile,
    });

    return {
      user: updatedUser,
      token,
    };
  }

  /**
   * Resend OTP - triggers OTP resend for an existing pending user
   */
  async resendOtp(mobile: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: 'OTP resent successfully',
    };
  }

  /**
   * Initiate sign in - checks user exists and sends OTP
   */
  async signIn(mobile: string): Promise<{ success: boolean; message: string }> {
    if (mobile.length < 10) {
      throw new InvalidUserDataError('Mobile number must be at least 10 digits');
    }

    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    if (!user.mobileVerified) {
      throw new InvalidUserDataError('User mobile is not verified. Please complete verification via signup');
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  /**
   * Verify sign in OTP and return navigation route
   */
  async verifySignInOtp(mobile: string, otp: string): Promise<{ user: User; token: string; redirectUrl: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new UserNotFoundError(mobile);
    }

    await this.otpService.verifyOtp(mobile, otp);

    let redirectUrl = '/';
    if (user.role === 'customer') {
      redirectUrl = '/';
    } else if (user.role === 'owner') {
      redirectUrl = '/owner/dashboard';
    } else if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    }

    // Generate JWT
    const token = this.jwtManagementEngine.generateToken({
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    });

    return {
      user,
      token,
      redirectUrl,
    };
  }
}



