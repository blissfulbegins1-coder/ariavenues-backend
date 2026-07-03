import mongoose from "mongoose";
import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import { NotificationModel } from "../../infrastructure/services/mongodb/models/notification/NotificationModel";
import { INotificationRepository } from "./INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  private toEntity(doc: any): Notification {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      receiverId: obj.receiverId.toString(),
      senderId: obj.senderId ? obj.senderId.toString() : null,
      role: obj.role,
      type: obj.type,
      title: obj.title,
      message: obj.message,
      referenceId: obj.referenceId ? obj.referenceId.toString() : "",
      referenceType: obj.referenceType,
      isRead: obj.isRead,
      readAt: obj.readAt,
      delivered: obj.delivered,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const doc = new NotificationModel(data);
    await doc.save();
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    const doc = await NotificationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    if (!doc) return null;
    return this.toEntity(doc);
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
    const notifications = docs.map((doc) => this.toEntity(doc));

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
