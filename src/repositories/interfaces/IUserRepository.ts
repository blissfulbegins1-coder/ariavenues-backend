import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/CreateUserDTO';
import { UpdateUserDTO } from '../../domain/dtos/UpdateUserDTO';

// Repository Interface - contract for data access
export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}
