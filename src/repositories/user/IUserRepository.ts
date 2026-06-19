import { User } from "../../domain/entities/User";
import { UserDTO } from "../../domain/dtos/user/UserDto";
import { QueryFilter } from "mongoose";

// Repository Interface - contract for data access
export interface IUserRepository {
  create(data: UserDTO): Promise<boolean>;
  findByMobile(mobile: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  findAll(filter?: QueryFilter<User>): Promise<User[]>;
}
