import { Notification } from "../../entities/Notification";

export type NotificationFilters = {
  page?: number | null;
  limit?: number | null;
}

export type PaginatedNotificationsResponse = {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
