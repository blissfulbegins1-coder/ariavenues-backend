import { QueryFilter } from "mongoose";
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

export type UserAuthResponse = {
  user: { id: string; name: string };
  token: string;
  redirectUrl: string;
};

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
  query: QueryFilter<User>;
  sort: Record<string, 1 | -1>;
  skip?: number | null;
  limit?: number | null;
}