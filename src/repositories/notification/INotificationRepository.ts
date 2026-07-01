import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";

export type INotificationRepository = {
  create(data: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  update(id: string, data: Partial<Notification>): Promise<Notification | null>;
  listByUser(
    userId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse>;
  markAllAsRead(userId: string): Promise<void>;
}
