import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';

// Single interface for all User operations
export interface IUserUseCase {
  signUp(input: CreateUserDTO): Promise<{ success: boolean; message: string }>;
  verifyOtp(mobile: string, otp: string): Promise<{ user: User; token: string }>;
  resendOtp(mobile: string): Promise<{ success: boolean; message: string }>;
  signIn(mobile: string): Promise<{ success: boolean; message: string }>;
  verifySignInOtp(mobile: string, otp: string): Promise<{ user: User; token: string; redirectUrl: string }>;
}


