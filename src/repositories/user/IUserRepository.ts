import { User } from "../../domain/entities/User";
import { CreateUserDTO } from "../../domain/dtos/user/CreateUserDTO";

// Repository Interface - contract for data access
export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findByMobile(mobile: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  findAll(role?: string): Promise<User[]>;
}
