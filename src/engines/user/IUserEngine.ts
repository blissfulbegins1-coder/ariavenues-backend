import { User } from "../../domain/entities/User";
import { UserDTO, UserDbQuery, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
import { QueryFilter } from "mongoose";

export interface IUserEngine {
  createUser(data: UserDTO): Promise<boolean>;
  getUserByMobile(mobile: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  getAllUsers(filter?: QueryFilter<User>): Promise<User[]>;
  getUsers(dbQuery: UserDbQuery): Promise<PaginatedUsersResponse>;
}
