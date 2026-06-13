import "dotenv/config";
import { setupContainer } from "./infrastructure/ioc/registry";
import { Server } from "./infrastructure/webServer/server";
import { DatabaseService } from "./infrastructure/services/mongodb/DatabaseService";

const main = async (): Promise<void> => {
  try {
    // Setup Awilix DI Container
    const container = setupContainer();

    // Database Connection
    const databaseService =
      container.resolve<DatabaseService>("databaseService");
    await databaseService.connect();

    // Get port from environment
    const port = parseInt(process.env.PORT || "3001", 10);

    // Create and start server
    const server = new Server(container);
    await server.start(port);
  } catch (error) {
    console.error("Application failed to start:", error);
    process.exit(1);
  }
};

main();
