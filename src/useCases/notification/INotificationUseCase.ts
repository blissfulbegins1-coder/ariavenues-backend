import { Notification } from "../../domain/entities/Notification";
import { PaginatedNotificationsResponse } from "../../domain/dtos/notification/NotificationDto";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

export interface INotificationUseCase {
  listMyNotifications(
    user: UserTokenDto,
    page?: number | null,
    limit?: number | null,
  ): Promise<PaginatedNotificationsResponse>;
  markAsRead(id: string, user: UserTokenDto): Promise<Notification>;
  markAllAsRead(user: UserTokenDto): Promise<void>;
}
