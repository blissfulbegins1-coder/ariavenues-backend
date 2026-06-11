import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/CreateUserDTO';
import { UpdateUserDTO } from '../../domain/dtos/UpdateUserDTO';

// Single interface for all User operations
export interface IUserUseCase {
  create(input: CreateUserDTO): Promise<User>;
  getById(userId: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  update(userId: string, input: UpdateUserDTO): Promise<User>;
  delete(userId: string): Promise<void>;
}
