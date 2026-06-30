import mongoose from "mongoose";
import { Review } from "../../domain/entities/Review";
import { ReviewModel } from "../../infrastructure/services/mongodb/models/review/ReviewModel";
import { IReviewRepository } from "./IReviewRepository";

export class ReviewRepository implements IReviewRepository {
  async create(data: Partial<Review>): Promise<Review> {
    const doc = new ReviewModel(data);
    await doc.save();
    return doc as any;
  }

  async findByAuditorium(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }> {
    const audObjectId = new mongoose.Types.ObjectId(auditoriumId);
    const query: any = { auditoriumId: audObjectId };

    const total = await ReviewModel.countDocuments(query);
    let dbQuery = ReviewModel.find(query).sort({ createdAt: -1 });

    if (page && limit) {
      dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);
    }

    const docs = await dbQuery.exec();
    const reviews = docs as any[];

    return {
      reviews,
      total,
    };
  }
}
