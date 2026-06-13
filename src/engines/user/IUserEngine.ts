import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';

export interface IUserEngine {
  createUser(data: CreateUserDTO): Promise<User>; 
}
