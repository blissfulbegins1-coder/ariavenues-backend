import { Server as SocketIOServer, Socket } from "socket.io";
import { ISocketService } from "./ISocketService";
import { IJwtManagementEngine } from "../../../engines/jwt/IJwtManagementEngine";
import { logger } from "../../../utils/logger";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

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
    io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        if (!token) {
          return next(new Error("Authentication token is missing."));
        }

        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        const decoded = this.jwtManagementEngine.verifyToken(cleanToken) as { id: string } | null;
        if (!decoded || !decoded.id) {
          return next(new Error("Invalid authentication token."));
        }

        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error("Authentication failed."));
      }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId || "unknown";
      logger.info(`User connected via socket: ${userId} (Socket ID: ${socket.id})`);

      // Add socket ID to mapping
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(socket.id);
      this.userSockets.set(userId, sockets);

      socket.on("disconnect", () => {
        logger.info(`User disconnected from socket: ${userId} (Socket ID: ${socket.id})`);
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

  sendNotificationToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) {
      logger.warn("Socket.io server is not initialized yet.");
      return;
    }

    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      logger.info(`Pushing real-time socket event "${event}" to user ${userId}`);
      socketIds.forEach((id) => {
        this.io!.to(id).emit(event, data);
      });
    } else {
      logger.info(`User ${userId} is not connected via socket. Event queued in DB.`);
    }
  }
}
