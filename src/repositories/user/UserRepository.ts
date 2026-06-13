import { User } from '../../domain/entities/User';
import { CreateUserDTO } from '../../domain/dtos/user/CreateUserDTO';
import { UserAlreadyExistsError } from '../../domain/errors/UserErrors';
import { UserModel } from '../../infrastructure/services/mongodb/models/user/UserModel';
import { IUserRepository } from './IUserRepository';

// Repository Implementation - talks to MongoDB through Mongoose
export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    const user = new UserModel(data);
    await user.save();
    return user.toObject() as User;
  }
}
