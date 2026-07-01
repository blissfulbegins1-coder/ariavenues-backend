import UserRoles from "../../enums/UserRole";
import { User } from "../../entities/User";

export type UserDTO = {
  name: string;
  email?: string;
  mobile: string;
  role: UserRoles;
}

export type UserSuccessResponse = {
  success: boolean;
  message: string;
}

export type UserVerificationResponse = {
  user: { id: string; name: string; };
  token: string;
  redirectUrl: string;
}

export type VerifyOtpDTO = {
  mobile: string;
  otp: string;
}

export type UserFilters = {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: string;
  sortBy?: string;
  role?: string;
}

export type PaginatedUsersResponse = {
  users: User[];
  total: number;
  totalCount: number;
  activeCount: number;
  blockedCount: number;
}

export type UserDbQuery = {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}