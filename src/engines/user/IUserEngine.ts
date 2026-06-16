import { User } from "../../domain/entities/User";
import { CreateUserDTO } from "../../domain/dtos/user/CreateUserDTO";

export interface IUserEngine {
  createUser(data: CreateUserDTO): Promise<User>;
  getUserByMobile(mobile: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
}
