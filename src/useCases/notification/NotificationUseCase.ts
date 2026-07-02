import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import { INotificationEngine } from "../../engines/notification/INotificationEngine";
import { INotificationUseCase } from "./INotificationUseCase";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { ApiError } from "../../domain/errors/ApiError";
import { HttpStatus } from "../../domain/enums/HttpStatus";

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
      throw new ApiError("Notification not found", HttpStatus.NOT_FOUND);
    }

    if (notification.receiverId.toString() !== user.id.toString()) {
      throw new ApiError("Unauthorized to read this notification", HttpStatus.FORBIDDEN);
    }

    const updated = await this.notificationEngine.updateNotification(id, {
      isRead: true,
      readAt: new Date(),
    });

    if (!updated) {
      throw new ApiError("Failed to update notification", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updated;
  }

  async markAllAsRead(user: UserTokenDto): Promise<void> {
    await this.notificationEngine.markAllNotificationsAsRead(user.id);
  }
}
