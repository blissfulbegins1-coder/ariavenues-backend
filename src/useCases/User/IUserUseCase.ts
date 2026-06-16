import { User } from "../../domain/entities/User";
import { CreateUserDTO } from "../../domain/dtos/user/CreateUserDTO";

export interface IUserUseCase {
  signUp(input: CreateUserDTO): Promise<{ success: boolean; message: string }>;
  verifyOtp(
    mobile: string,
    otp: string,
  ): Promise<{
    user: { id: string; name: string };
    token: string;
    redirectUrl: string;
  }>;
  resendOtp(mobile: string): Promise<{ success: boolean; message: string }>;
  signIn(mobile: string): Promise<{ success: boolean; message: string }>;
}
