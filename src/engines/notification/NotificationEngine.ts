import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { INotificationEngine } from "./INotificationEngine";

type NotificationEngineConstructorParams = {
  notificationRepository: INotificationRepository;
};

export class NotificationEngine implements INotificationEngine {
  private notificationRepository: INotificationRepository;

  constructor({ notificationRepository }: NotificationEngineConstructorParams) {
    this.notificationRepository = notificationRepository;
  }

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    return await this.notificationRepository.create(data);
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findById(id);
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification | null> {
    return await this.notificationRepository.update(id, data);
  }

  async listNotificationsByUser(
    userId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse> {
    return await this.notificationRepository.listByUser(userId, page, limit);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
