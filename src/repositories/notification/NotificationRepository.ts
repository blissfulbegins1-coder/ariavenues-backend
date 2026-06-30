import mongoose from "mongoose";
import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import { NotificationModel } from "../../infrastructure/services/mongodb/models/notification/NotificationModel";
import { INotificationRepository } from "./INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  async create(data: Partial<Notification>): Promise<Notification> {
    const doc = new NotificationModel(data);
    await doc.save();
    return doc as any;
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id);
    if (!doc) return null;
    return doc as any;
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    const doc = await NotificationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!doc) return null;
    return doc as any;
  }

  async listByUser(
    userId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: any = { receiverId: userObjectId };

    const total = await NotificationModel.countDocuments(query);
    const unreadCount = await NotificationModel.countDocuments({ ...query, isRead: false });

    let dbQuery = NotificationModel.find(query).sort({ createdAt: -1 });

    if (page && limit) {
      dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);
    }

    const docs = await dbQuery.exec();
    const notifications = docs as any[];

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: any = { receiverId: userObjectId, isRead: false };
    await NotificationModel.updateMany(
      query,
      { $set: { isRead: true, readAt: new Date() } },
    );
  }
}
