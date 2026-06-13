import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { IUserEngine } from './IUserEngine';

type UserEngineConstructorParams = {
  userRepository: IUserRepository;
};

// User Engine - handles business logic and data preparation
export class UserEngine implements IUserEngine {
  private userRepository: IUserRepository;
  
  constructor({ userRepository }: UserEngineConstructorParams) {
    this.userRepository = userRepository;
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const preparedData = {
      ...data,
      email: data.email ? data.email.toLowerCase() : undefined,
    };

    return await this.userRepository.create(preparedData);
  }

  async getUserByMobile(mobile: string): Promise<User | null> {
    return await this.userRepository.findByMobile(mobile);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return await this.userRepository.update(id, data);
  }
}

