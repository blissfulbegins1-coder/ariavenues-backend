import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/CreateUserDTO';
import { UpdateUserDTO } from '../../domain/dtos/UpdateUserDTO';
import { UserEngine } from '../../engines/UserEngine';
import { IUserUseCase } from './IUserUseCase';

// User Use Case - handles validation and orchestration only
export class UserUseCase implements IUserUseCase {
  constructor(private userEngine: UserEngine) {}

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

    // Pass to engine for business logic and repository call
    return await this.userEngine.createUser(input);
  }

  /**
   * Get a user by ID
   */
  async getById(userId: string): Promise<User | null> {
    return await this.userEngine.getUserById(userId);
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return await this.userEngine.getAllUsers();
  }

  /**
   * Update a user - validate then pass to engine
   */
  async update(userId: string, input: UpdateUserDTO): Promise<User> {
    // Validation only
    if (input.email && !input.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (input.phone && input.phone.length < 10) {
      throw new Error('Phone number must be at least 10 digits');
    }

    if (input.name && input.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Pass to engine for business logic and repository call
    return await this.userEngine.updateUser(userId, input);
  }

  /**
   * Delete a user
   */
  async delete(userId: string): Promise<void> {
    return await this.userEngine.deleteUser(userId);
  }
}

