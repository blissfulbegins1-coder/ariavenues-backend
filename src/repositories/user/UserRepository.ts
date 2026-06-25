import { User } from "../../domain/entities/User";
import { UserDTO, UserDbQuery, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
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

  async getUsers(dbQuery: UserDbQuery): Promise<PaginatedUsersResponse> {
    const { query, sort, skip, limit } = dbQuery;

    const userQuery = UserModel.find(query)
      .sort(sort);

    if (skip != null && limit != null) {
      userQuery.skip(skip).limit(limit);
    }

    const statsQuery: any = { isActive: true };
    if (query && query.role) {
      statsQuery.role = query.role;
    }

    const [users, total, totalCount, activeCount, blockedCount] = await Promise.all([
      userQuery.exec(),
      UserModel.countDocuments(query).exec(),
      UserModel.countDocuments(statsQuery).exec(),
      UserModel.countDocuments({ ...statsQuery, status: "active" }).exec(),
      UserModel.countDocuments({ ...statsQuery, status: "blocked" }).exec(),
    ]);

    return {
      users,
      total,
      totalCount,
      activeCount,
      blockedCount,
    };
  }
}
