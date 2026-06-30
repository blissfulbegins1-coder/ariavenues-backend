import { Server as SocketIOServer } from "socket.io";
import { ISocketService } from "./ISocketService";
import { IJwtManagementEngine } from "../../../engines/jwt/IJwtManagementEngine";

type SocketServiceConstructorParams = {
  jwtManagementEngine: IJwtManagementEngine;
};

export class SocketService implements ISocketService {
  private io: SocketIOServer | null = null;
  private jwtManagementEngine: IJwtManagementEngine;
  private userSockets: Map<string, string[]> = new Map();

  constructor({ jwtManagementEngine }: SocketServiceConstructorParams) {
    this.jwtManagementEngine = jwtManagementEngine;
  }

  initialize(io: SocketIOServer): void {
    this.io = io;

    // Authentication middleware
    io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        if (!token) {
          return next(new Error("Authentication token is missing."));
        }

        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        const decoded = this.jwtManagementEngine.verifyToken(cleanToken) as any;
        if (!decoded || !decoded.id) {
          return next(new Error("Invalid authentication token."));
        }

        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Authentication failed."));
      }
    });

    io.on("connection", (socket: any) => {
      const userId = socket.userId;
      console.log(`User connected via socket: ${userId} (Socket ID: ${socket.id})`);

      // Add socket ID to mapping
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(socket.id);
      this.userSockets.set(userId, sockets);

      socket.on("disconnect", () => {
        console.log(`User disconnected from socket: ${userId} (Socket ID: ${socket.id})`);
        const currentSockets = this.userSockets.get(userId) || [];
        const updatedSockets = currentSockets.filter((id) => id !== socket.id);
        if (updatedSockets.length > 0) {
          this.userSockets.set(userId, updatedSockets);
        } else {
          this.userSockets.delete(userId);
        }
      });
    });
  }

  sendNotificationToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      console.warn("Socket.io server is not initialized yet.");
      return;
    }

    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      console.log(`Pushing real-time socket event "${event}" to user ${userId}`);
      socketIds.forEach((id) => {
        this.io!.to(id).emit(event, data);
      });
    } else {
      console.log(`User ${userId} is not connected via socket. Event queued in DB.`);
    }
  }
}
