import { IActivityEngine } from "./IActivityEngine";
import { Activity } from "../../domain/entities/Activity";
import { IActivityRepository } from "../../repositories/activity/IActivityRepository";
import { ClientSession } from "mongoose";

type ActivityEngineConstructorParams = {
  activityRepository: IActivityRepository;
};

export class ActivityEngine implements IActivityEngine {
  private activityRepository: IActivityRepository;

  constructor({ activityRepository }: ActivityEngineConstructorParams) {
    this.activityRepository = activityRepository;
  }

  async createActivity(data: Partial<Activity>, session?: ClientSession): Promise<Activity> {
    return await this.activityRepository.create(data, session);
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await this.activityRepository.findRecent(limit);
  }

  async getPaginatedActivities(page: number, limit: number): Promise<Activity[]> {
    return await this.activityRepository.findPaginated(page, limit);
  }
}

