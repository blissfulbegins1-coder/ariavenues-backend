import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { AwilixContainer } from "awilix";
import { setupApiRoutes } from "../routes/apiRoutes";
import { IContainer } from "../ioc/registry";
import { DatabaseService } from "../services/mongodb/DatabaseService";
import { errorHandler } from "../middleware/ErrorHandler/ErrorHandlerMiddleware";
import { corsOrigins } from "../../domain/constants/axiosHeader";
import { uploadMiddleware } from "../middleware/Upload/UploadMiddleware";
import { logger } from "../../utils/logger";
import { requestLogger } from "../middleware/RequestLogger/RequestLoggerMiddleware";
import { transactionSecurityMiddleware } from "../middleware/Security/TransactionSecurityMiddleware";
import { rateLimitMiddleware } from "../middleware/RateLimit/RateLimitMiddleware";

export class Server {
  private app: Express;
  private httpServer: http.Server;
  private databaseService: DatabaseService;

  constructor(private container: AwilixContainer<IContainer>) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.databaseService = container.resolve("databaseService");
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.set("trust proxy", true);
    this.app.use(express.json({ limit: "100mb" }));
    this.app.use(express.urlencoded({ limit: "100mb", extended: false }));
    this.app.use(requestLogger);
    // this.app.use(rateLimitMiddleware);
    this.app.use(uploadMiddleware);
    this.app.use((req, res, next) => {
      req.container = this.container;
      next();
    });

    this.app.use(
      cors({
        origin: corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "x-transaction-id"],
      }),
    );
    this.app.use(transactionSecurityMiddleware);

    this.app.get("/health", async (req, res) => {
      const isHealthy = await this.databaseService.healthCheck();
      res.json({
        status: isHealthy ? "OK" : "UNHEALTHY",
        message: "Server is running",
        database: isHealthy ? "connected" : "disconnected",
      });
    });
  }

  private setupRoutes(): void {
    this.app.use("/api/", setupApiRoutes(this.container));
    this.app.use(errorHandler);
  }

  async start(port: number = 3001): Promise<void> {
    try {
      const io = new SocketIOServer(this.httpServer, {
        cors: {
          origin: corsOrigins,
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        },
        path: "/socket.io",
      });

      const socketService = this.container.resolve("socketService");
      socketService.initialize(io);

      this.httpServer.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
      });
    } catch (error) {
      process.exit(1);
    }
  }
}
