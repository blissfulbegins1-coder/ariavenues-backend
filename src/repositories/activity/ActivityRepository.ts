import { Activity } from "../../domain/entities/Activity";
import { ActivityModel } from "../../infrastructure/services/mongodb/models/activity/ActivityModel";
import { IActivityRepository } from "./IActivityRepository";
import { ClientSession } from "mongoose";

export class ActivityRepository implements IActivityRepository {
  private toEntity(doc: any): Activity {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      type: obj.type,
      title: obj.title,
      description: obj.description,
      referenceId: obj.referenceId ? obj.referenceId.toString() : "",
      referenceType: obj.referenceType,
      performedBy: obj.performedBy ? obj.performedBy.toString() : "",
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async create(data: Partial<Activity>, session?: ClientSession): Promise<Activity> {
    const activity = new ActivityModel({
      type: data.type,
      title: data.title,
      description: data.description,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      performedBy: data.performedBy,
    });
    const saved = await activity.save({ session });
    return this.toEntity(saved);
  }

  async findRecent(limit: number): Promise<Activity[]> {
    const docs = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }

  async findPaginated(page: number, limit: number): Promise<Activity[]> {
    const skip = (page - 1) * limit;
    const docs = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc));
  }
}
