import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";

export interface INotificationEngine {
  createNotification(data: Partial<Notification>): Promise<Notification>;
  getNotificationById(id: string): Promise<Notification | null>;
  updateNotification(id: string, data: Partial<Notification>): Promise<Notification | null>;
  listNotificationsByUser(
    userId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
}
