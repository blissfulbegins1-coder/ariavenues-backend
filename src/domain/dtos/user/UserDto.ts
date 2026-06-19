import UserRoles from "../../enums/UserRole";

export interface UserDTO {
  name: string;
  email?: string;
  mobile: string;
  role: UserRoles;
}

export interface UserSuccessResponse {
  success: boolean;
  message: string;
}

export interface UserVerificationResponse {
  user: { id: string; name: string; };
  token: string;
  redirectUrl: string;
}

export interface VerifyOtpDTO{
  mobile: string;
  otp: string;
}