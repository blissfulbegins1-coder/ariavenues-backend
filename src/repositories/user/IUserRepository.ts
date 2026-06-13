import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';

// Repository Interface - contract for data access
export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
}
