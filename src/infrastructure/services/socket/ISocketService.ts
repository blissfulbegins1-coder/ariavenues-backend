import { Server as SocketIOServer } from "socket.io";

export type ISocketService = {
  initialize(io: SocketIOServer): void;
  sendNotificationToUser(userId: string, event: string, data: any): void;
}
