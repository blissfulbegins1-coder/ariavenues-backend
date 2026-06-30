import { Server as SocketIOServer } from "socket.io";

export interface ISocketService {
  initialize(io: SocketIOServer): void;
  sendNotificationToUser(userId: string, event: string, data: any): void;
}
