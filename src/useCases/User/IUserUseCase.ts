import {
  VerifyOtpDTO,
  UserDTO,
  UserSuccessResponse,
  UserVerificationResponse,
} from "../../domain/dtos/user/UserDto";

export interface IUserUseCase {
  signUp(input: UserDTO): Promise<UserSuccessResponse>;
  verifyOtp(input: VerifyOtpDTO): Promise<UserVerificationResponse>;
  resendOtp(mobile: string): Promise<UserSuccessResponse>;
  signIn(mobile: string): Promise<UserSuccessResponse>;
}
