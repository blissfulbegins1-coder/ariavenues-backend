import { Activity } from "../../domain/entities/Activity";
import { ClientSession } from "mongoose";

export type IActivityRepository = {
  create(data: Partial<Activity>, session?: ClientSession): Promise<Activity>;
  findRecent(limit: number): Promise<Activity[]>;
  findPaginated(page: number, limit: number): Promise<Activity[]>;
}
