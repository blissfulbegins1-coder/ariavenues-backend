import {
  VerifyOtpDTO,
  UserDTO,
  UserSuccessResponse,
  UserVerificationResponse,
} from "../../domain/dtos/user/UserDto";
import { User } from "../../domain/entities/User";

export interface IUserUseCase {
  signUp(input: UserDTO): Promise<UserSuccessResponse>;
  verifyOtp(input: VerifyOtpDTO): Promise<UserVerificationResponse>;
  resendOtp(mobile: string): Promise<UserSuccessResponse>;
  signIn(mobile: string): Promise<UserSuccessResponse>;
  getUserByMobile(mobile: string): Promise<User | null>;
}
