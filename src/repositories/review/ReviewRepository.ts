import mongoose, { QueryFilter } from "mongoose";
import { Review } from "../../domain/entities/Review";
import { ReviewModel } from "../../infrastructure/services/mongodb/models/review/ReviewModel";
import { IReviewRepository } from "./IReviewRepository";

export class ReviewRepository implements IReviewRepository {
  private toEntity(doc: { toObject?: () => Record<string, any> } & Record<string, any>): Review {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      userId: obj.userId.toString(),
      userName: obj.userName,
      auditoriumId: obj.auditoriumId.toString(),
      rating: obj.rating,
      comment: obj.comment,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async create(data: Partial<Review>): Promise<Review> {
    const doc = new ReviewModel(data);
    await doc.save();
    return this.toEntity(doc);
  }

  async findByAuditorium(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }> {
    const audObjectId = new mongoose.Types.ObjectId(auditoriumId);
    const query: QueryFilter<Review> = { auditoriumId: audObjectId as any };

    const total = await ReviewModel.countDocuments(query);
    let dbQuery = ReviewModel.find(query).sort({ createdAt: -1 });

    if (page && limit) {
      dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);
    }

    const docs = await dbQuery.exec();
    const reviews = docs.map((doc) => this.toEntity(doc));

    return {
      reviews,
      total,
    };
  }

  async findByUserAndAuditorium(userId: string, auditoriumId: string): Promise<Review | null> {
    const doc = await ReviewModel.findOne({
      userId,
      auditoriumId,
    });
    return doc ? this.toEntity(doc) : null;
  }

  async findById(id: string): Promise<Review | null> {
    const doc = await ReviewModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await ReviewModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    return result.deletedCount > 0;
  }
}
