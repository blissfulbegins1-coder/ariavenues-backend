import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { AuditoriumModel } from "../../infrastructure/services/mongodb/models/auditorium/AuditoriumModel";
import { IAuditoriumRepository } from "./IAuditoriumRepository";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { ApiError } from "../../domain/errors/ApiError";
import { AuditoriumStatus } from "../../domain/enums/AuditoriumStatus";
import { HttpStatus } from "../../domain/enums/HttpStatus";
import { QueryFilter } from "mongoose";
import { AuditoriumDbQuery, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";

export class AuditoriumRepository implements IAuditoriumRepository {
  private toEntity(doc: any): Auditorium {
    const obj = doc.toObject();
    const ownerIdStr = typeof obj.ownerId === "object" && obj.ownerId !== null && "_id" in obj.ownerId
      ? obj.ownerId._id.toString()
      : obj.ownerId?.toString() || "";
    const ownerNameStr = typeof obj.ownerId === "object" && obj.ownerId !== null && "name" in obj.ownerId
      ? obj.ownerId.name
      : undefined;

    return {
      id: obj._id.toString(),
      ownerId: ownerIdStr,
      name: obj.name,
      description: obj.description,
      address: obj.address,
      state: obj.state,
      city: obj.city,
      district: obj.district,
      capacity: obj.capacity,
      dayRate: obj.dayRate,
      amenities: obj.amenities,
      images: obj.images,
      averageRating: obj.averageRating,
      totalReviews: obj.totalReviews,
      totalBookings: obj.totalBookings,
      status: obj.status,
      approved: obj.approved,
      adminAdvance: obj.adminAdvance,
      auditoriumAdvance: obj.auditoriumAdvance,
      createdAt: obj.createdAt,
      ownerName: ownerNameStr,
    } as Auditorium;
  }

  async create(data: CreateAuditoriumDTO): Promise<Auditorium> {
    const { user, ...rest } = data;
    const auditorium = new AuditoriumModel({
      ...rest,
      ownerId: user.id,
      averageRating: 0,
      totalReviews: 0,
      totalBookings: 0,
      approved: false,
      adminAdvance: 0,
      auditoriumAdvance: 0,
      isActive: true,
    });
    const saved = await auditorium.save();
    return this.toEntity(saved);
  }

  async listByOwner(user: UserTokenDto): Promise<Auditorium[]> {
    const items = await AuditoriumModel.find({ ownerId: user.id, isActive: true });
    return items.map((item) => this.toEntity(item));
  }

  async listPublic(
    filter?: QueryFilter<Auditorium>,
    skip?: number | null,
    limit?: number | null,
  ): Promise<{ auditoriums: Auditorium[]; total: number }> {
    const query: QueryFilter<Auditorium> = {
      status: AuditoriumStatus.ACTIVE,
      isActive: true,
      approved: true,
      ...filter,
    };

    const total = await AuditoriumModel.countDocuments(query);

    let queryBuilder = AuditoriumModel.find(query);
    if (skip !== undefined && skip !== null) {
      queryBuilder = queryBuilder.skip(skip);
    }
    if (limit !== undefined && limit !== null) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const items = await queryBuilder;
    return {
      auditoriums: items.map((item) => this.toEntity(item)),
      total,
    };
  }

  async findById(id: string): Promise<Auditorium | null> {
    const item = await AuditoriumModel.findOne({ _id: id, isActive: true });
    if (!item) return null;
    return this.toEntity(item);
  }

  async update(id: string, data: Partial<Auditorium>): Promise<Auditorium> {
    const item = await AuditoriumModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: data },
      { returnDocument: "after" },
    );
    if (!item) {
      throw new ApiError("Auditorium not found", HttpStatus.NOT_FOUND);
    }
    return this.toEntity(item);
  }

  async listAll(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]> {
    const query: QueryFilter<Auditorium> = {
      isActive: true,
      ...filter,
    };
    const items = await AuditoriumModel.find(query).sort({ createdAt: -1 });
    return items.map((item) => this.toEntity(item));
  }

  async getAuditoriums(dbQuery: AuditoriumDbQuery): Promise<PaginatedAuditoriumsResponse> {
    const { query, sort, skip, limit } = dbQuery;

    const auditoriumQuery = AuditoriumModel.find(query)
      .populate("ownerId")
      .sort(sort);

    if (skip != null && limit != null) {
      auditoriumQuery.skip(skip).limit(limit);
    }

    const statsQuery = { isActive: true };

    const [items, total, totalCount, pendingCount, activeCount, maintenanceCount] = await Promise.all([
      auditoriumQuery.exec(),
      AuditoriumModel.countDocuments(query).exec(),
      AuditoriumModel.countDocuments(statsQuery).exec(),
      AuditoriumModel.countDocuments({ ...statsQuery, status: "pending" }).exec(),
      AuditoriumModel.countDocuments({ ...statsQuery, status: "active" }).exec(),
      AuditoriumModel.countDocuments({ ...statsQuery, status: "maintenance" }).exec(),
    ]);

    const auditoriums = items.map((item) => this.toEntity(item));

    return {
      auditoriums,
      total,
      totalCount,
      pendingCount,
      activeCount,
      maintenanceCount,
    };
  }
}
