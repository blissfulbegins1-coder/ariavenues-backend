import { User } from "../../domain/entities/User";
import { CreateUserDTO } from "../../domain/dtos/user/CreateUserDTO";
import { UserAlreadyExistsError } from "../../domain/errors/UserErrors";
import { UserModel } from "../../infrastructure/services/mongodb/models/user/UserModel";
import { IUserRepository } from "./IUserRepository";

// Repository Implementation - talks to MongoDB through Mongoose
export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const existingUser = await UserModel.findOne({ mobile: data.mobile, isActive: true });
    if (existingUser) {
      throw new UserAlreadyExistsError(data.mobile);
    }

    const user = new UserModel({
      ...data,
      mobileVerified: false,
      status: "active",
    });
    await user.save();

    const userObj = user.toObject();
    return {
      id: userObj._id.toString(),
      name: userObj.name,
      mobile: userObj.mobile,
      email: userObj.email,
      mobileVerified: userObj.mobileVerified,
      role: userObj.role,
      status: userObj.status,
      isActive: userObj.isActive ?? true,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    } as User;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await UserModel.findOne({ mobile, isActive: true });
    if (!user) return null;

    const userObj = user.toObject();
    return {
      id: userObj._id.toString(),
      name: userObj.name,
      mobile: userObj.mobile,
      email: userObj.email,
      mobileVerified: userObj.mobileVerified,
      role: userObj.role,
      status: userObj.status,
      isActive: userObj.isActive ?? true,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    } as User;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { returnDocument: "after" },
    );
    if (!user) return null;

    const userObj = user.toObject();
    return {
      id: userObj._id.toString(),
      name: userObj.name,
      mobile: userObj.mobile,
      email: userObj.email,
      mobileVerified: userObj.mobileVerified,
      role: userObj.role,
      status: userObj.status,
      isActive: userObj.isActive ?? true,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    } as User;
  }

  async findAll(role?: string): Promise<User[]> {
    const query: any = role
      ? { role, isActive: true }
      : { isActive: true };
    const users = await UserModel.find(query).sort({ createdAt: -1 });
    return users.map((user: any) => {
      const userObj = user.toObject();
      return {
        id: userObj._id.toString(),
        name: userObj.name,
        mobile: userObj.mobile,
        email: userObj.email,
        mobileVerified: userObj.mobileVerified,
        role: userObj.role,
        status: userObj.status,
        isActive: userObj.isActive ?? true,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
      } as User;
    });
  }
}
