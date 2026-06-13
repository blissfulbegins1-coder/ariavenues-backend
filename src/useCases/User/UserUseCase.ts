import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';
import { IUserEngine } from '../../engines/user/IUserEngine';
import { IUserUseCase } from './IUserUseCase';

type UserUseCaseConstructorParams = {
  UserEngine: IUserEngine;
};

// User Use Case - handles validation and orchestration only
export class UserUseCase implements IUserUseCase {
  private userEngine: IUserEngine;

  constructor({ UserEngine }: UserUseCaseConstructorParams) {
    this.userEngine = UserEngine;
  }

  /**
   * Create a new user - validate then pass to engine
   */
  async create(input: CreateUserDTO): Promise<User> {
    // Validation only
    if (!input.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (input.phone.length < 10) {
      throw new Error('Phone number must be at least 10 digits');
    }

    if (input.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    return await this.userEngine.createUser(input);
  }
}

