import { Activity } from "../../domain/entities/Activity";
import { ClientSession } from "mongoose";

export type IActivityEngine = {
  createActivity(data: Partial<Activity>, session?: ClientSession): Promise<Activity>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  getPaginatedActivities(page: number, limit: number): Promise<Activity[]>;
}
