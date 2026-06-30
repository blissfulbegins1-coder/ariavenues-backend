import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import { INotificationEngine } from "../../engines/notification/INotificationEngine";
import { INotificationUseCase } from "./INotificationUseCase";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { ApiError } from "../../domain/errors/ApiError";

type NotificationUseCaseConstructorParams = {
  notificationEngine: INotificationEngine;
};

export class NotificationUseCase implements INotificationUseCase {
  private notificationEngine: INotificationEngine;

  constructor({ notificationEngine }: NotificationUseCaseConstructorParams) {
    this.notificationEngine = notificationEngine;
  }

  async listMyNotifications(
    user: UserTokenDto,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse> {
    return await this.notificationEngine.listNotificationsByUser(user.id, page, limit);
  }

  async markAsRead(id: string, user: UserTokenDto): Promise<Notification> {
    const notification = await this.notificationEngine.getNotificationById(id);
    if (!notification) {
      throw new ApiError("Notification not found");
    }

    if (notification.receiverId.toString() !== user.id.toString()) {
      throw new ApiError("Unauthorized to read this notification");
    }

    const updated = await this.notificationEngine.updateNotification(id, {
      isRead: true,
      readAt: new Date(),
    });

    if (!updated) {
      throw new ApiError("Failed to update notification");
    }

    return updated;
  }

  async markAllAsRead(user: UserTokenDto): Promise<void> {
    await this.notificationEngine.markAllNotificationsAsRead(user.id);
  }
}
