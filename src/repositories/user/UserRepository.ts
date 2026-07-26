import { User } from "../../domain/entities/User";
import { UserDTO, UserDbQuery, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
import { UserModel } from "../../infrastructure/services/mongodb/models/user/UserModel";
import { IUserRepository } from "./IUserRepository";
import UserStatus from "../../domain/enums/UserStatus";
import { QueryFilter } from "mongoose";

export class UserRepository implements IUserRepository {
  private toEntity(doc: { toObject?: () => Record<string, any> } & Record<string, any>): User {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      name: obj.name,
      email: obj.email,
      mobile: obj.mobile,
      mobileVerified: obj.mobileVerified,
      role: obj.role,
      status: obj.status,
      isActive: obj.isActive ?? true,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async create(data: UserDTO): Promise<boolean> {
    const user = new UserModel({
      ...data,
      mobileVerified: true,
      status: UserStatus.ACTIVE,
    });
    await user.save();
    return true;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await UserModel.findOne({ mobile, isActive: true });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { returnDocument: "after" },
    );
    return user ? this.toEntity(user) : null;
  }

  async findAll(filter?: QueryFilter<User>): Promise<User[]> {
    const users = await UserModel.find({ ...filter, isActive: true }).sort({ createdAt: -1 });
    return users.map((u) => this.toEntity(u));
  }

  async getUsers(dbQuery: UserDbQuery): Promise<PaginatedUsersResponse> {
    const { query, sort, skip, limit } = dbQuery;

    const userQuery = UserModel.find(query)
      .sort(sort);

    if (skip != null && limit != null) {
      userQuery.skip(skip).limit(limit);
    }

    const statsQuery: QueryFilter<User> = { isActive: true };
    if (query && query.role) {
      statsQuery.role = query.role;
    }

    const [usersDocs, total, totalCount, activeCount, blockedCount] = await Promise.all([
      userQuery.exec(),
      UserModel.countDocuments(query).exec(),
      UserModel.countDocuments(statsQuery).exec(),
      UserModel.countDocuments({ ...statsQuery, status: "active" }).exec(),
      UserModel.countDocuments({ ...statsQuery, status: "blocked" }).exec(),
    ]);

    const users = usersDocs.map((u) => this.toEntity(u));

    return {
      users,
      total,
      totalCount,
      activeCount,
      blockedCount,
    };
  }
}
