import { User } from "../../domain/entities/User";
import { UserDTO, UserDbQuery, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IUserEngine } from "./IUserEngine";
import { QueryFilter } from "mongoose";

type UserEngineConstructorParams = {
  userRepository: IUserRepository;
};

export class UserEngine implements IUserEngine {
  private userRepository: IUserRepository;
  constructor({ userRepository }: UserEngineConstructorParams) {
    this.userRepository = userRepository;
  }

  async createUser(data: UserDTO): Promise<boolean> {
    return await this.userRepository.create(data);
  }

  async getUserByMobile(mobile: string): Promise<User | null> {
    return await this.userRepository.findByMobile(mobile);
  }
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return await this.userRepository.update(id, data);
  }

  async getAllUsers(filter?: QueryFilter<User>): Promise<User[]> {
    return await this.userRepository.findAll(filter);
  }

  async getUsers(dbQuery: UserDbQuery): Promise<PaginatedUsersResponse> {
    return await this.userRepository.getUsers(dbQuery);
  }
}
