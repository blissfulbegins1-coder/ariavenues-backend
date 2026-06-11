import { User } from '../domain/entities/User';
import { CreateUserDTO } from '../domain/dtos/CreateUserDTO';
import { UpdateUserDTO } from '../domain/dtos/UpdateUserDTO';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';

// User Engine - handles business logic and data preparation
export class UserEngine {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Prepare and create user
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    // Prepare data
    const preparedData = {
      ...data,
      role: data.role || 'user',
      email: data.email.toLowerCase(),
    };

    // Call repository
    return await this.userRepository.create(preparedData);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Prepare and update user
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
    // Prepare data
    const preparedData = {
      ...data,
      ...(data.email && { email: data.email.toLowerCase() }),
    };

    // Call repository
    return await this.userRepository.update(userId, preparedData);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    return await this.userRepository.delete(userId);
  }
}
