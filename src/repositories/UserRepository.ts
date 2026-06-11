import { User } from '../domain/entities/User';
import { CreateUserDTO } from '../domain/dtos/CreateUserDTO';
import { UpdateUserDTO } from '../domain/dtos/UpdateUserDTO';
import { UserNotFoundError, UserAlreadyExistsError } from '../domain/errors/UserErrors';
import { UserModel } from '../infrastructure/services/mongodb/models/UserModel';
import { IUserRepository } from './interfaces/IUserRepository';

// Repository Implementation - talks to MongoDB through Mongoose
export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    const user = new UserModel(data);
    await user.save();
    return user.toObject() as User;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? (user.toObject() as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? (user.toObject() as User) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((user) => user.toObject() as User);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user.toObject() as User;
  }

  async delete(id: string): Promise<void> {
    const result = await UserModel.findByIdAndDelete(id);
    if (!result) {
      throw new UserNotFoundError(id);
    }
  }
}
