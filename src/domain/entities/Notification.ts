import UserRoles from "../enums/UserRole";

export interface Notification {
  id: string;
  receiverId: string;
  senderId: string | null;
  role: UserRoles;
  type: string;
  title: string;
  message: string;
  referenceId: string;
  referenceType: string;
  isRead: boolean;
  readAt: Date | null;
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}
