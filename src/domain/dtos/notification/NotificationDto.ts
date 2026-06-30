import { Notification } from "../../entities/Notification";

export interface NotificationFilters {
  page?: number | null;
  limit?: number | null;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
