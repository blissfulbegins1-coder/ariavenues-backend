import { Activity } from "../../domain/entities/Activity";
import { ActivityModel } from "../../infrastructure/services/mongodb/models/activity/ActivityModel";
import { IActivityRepository } from "./IActivityRepository";
import { ClientSession } from "mongoose";

export class ActivityRepository implements IActivityRepository {
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
    return saved as unknown as Activity;
  }

  async findRecent(limit: number): Promise<Activity[]> {
    const docs = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs as unknown as Activity[];
  }

  async findPaginated(page: number, limit: number): Promise<Activity[]> {
    const skip = (page - 1) * limit;
    const docs = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs as unknown as Activity[];
  }
}
