import { User } from "../../domain/entities/User";
import { UserDTO } from "../../domain/dtos/user/UserDto";
import { UserModel } from "../../infrastructure/services/mongodb/models/user/UserModel";
import { IUserRepository } from "./IUserRepository";
import UserStatus from "../../domain/enums/UserStatus";
import { QueryFilter } from "mongoose";

export class UserRepository implements IUserRepository {
  async create(data: UserDTO): Promise<boolean> {
    const user = new UserModel({
      ...data,
      mobileVerified: false,
      status: UserStatus.ACTIVE,
    });
    await user.save();
    return true;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await UserModel.findOne({ mobile, isActive: true });
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { returnDocument: "after" },
    );
    return user;
  }

  async findAll(filter?: QueryFilter<User>): Promise<User[]> {
    return await UserModel.find({ ...filter, isActive: true }).sort({ createdAt: -1 });
  }
}
