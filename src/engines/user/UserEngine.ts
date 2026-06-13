import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { IUserEngine } from './IUserEngine';

type UserEngineConstructorParams = {
  UserRepository: IUserRepository;
};

// User Engine - handles business logic and data preparation
export class UserEngine implements IUserEngine {
  private userRepository: IUserRepository;
  
  constructor({ UserRepository }: UserEngineConstructorParams) {
    this.userRepository = UserRepository;
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const preparedData = {
      ...data,
      role: data.role,
      email: data.email.toLowerCase(),
    };

    return await this.userRepository.create(preparedData);
  }
}
