import express, { Express } from "express";
import cors from "cors";
import { AwilixContainer } from "awilix";
import { setupApiRoutes } from "../routes/apiRoutes";
import { IContainer } from "../ioc/registry";
import { DatabaseService } from "../services/mongodb/DatabaseService";
import { errorHandler } from "../middleware/ErrorHandler/ErrorHandlerMiddleware";
import { corsOrigins } from "../../domain/constants/axiosHeader";
import { uploadMiddleware } from "../middleware/Upload/UploadMiddleware";

export class Server {
  private app: Express;
  private databaseService: DatabaseService;

  constructor(private container: AwilixContainer<IContainer>) {
    this.app = express();
    this.databaseService = container.resolve("databaseService");
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: "100mb" }));
    this.app.use(express.urlencoded({ limit: "100mb", extended: false }));

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
      }),
    );

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
      this.app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    } catch (error) {
      process.exit(1);
    }
  }
}
