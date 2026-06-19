import { User } from "../../domain/entities/User";
import { UserDTO } from "../../domain/dtos/user/UserDto";
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

  // create user 
  async createUser(data: UserDTO): Promise<boolean> {
    return await this.userRepository.create(data);
  }

  // find user by mobile 
  async getUserByMobile(mobile: string): Promise<User | null> {
    return await this.userRepository.findByMobile(mobile);
  }

  // update user 
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return await this.userRepository.update(id, data);
  }

  // get all users
  async getAllUsers(filter?: QueryFilter<User>): Promise<User[]> {
    return await this.userRepository.findAll(filter);
  }
}
