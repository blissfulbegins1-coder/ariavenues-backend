import UserRoles from "../../enums/UserRole";
import { User } from "../../entities/User";

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

export interface UserFilters {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: "all" | "active" | "blocked" | string;
  sortBy?: "recent" | "name" | string;
  role?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  totalCount: number;
  activeCount: number;
  blockedCount: number;
}

export interface UserDbQuery {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}