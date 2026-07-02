import "dotenv/config";
import { setupContainer } from "./infrastructure/ioc/registry";
import { Server } from "./infrastructure/webServer/server";
import { DatabaseService } from "./infrastructure/services/mongodb/DatabaseService";
import { PORT } from "@/config/env";

const main = async (): Promise<void> => {
  try {
    const container = setupContainer();
    
    const databaseService = container.resolve<DatabaseService>("databaseService");
    await databaseService.connect();

    const brokerConnection = container.resolve("brokerConnection");
    const consumer = container.resolve("consumer");
    
    await brokerConnection.connect();
    await consumer.start();

    const server = new Server(container);
    await server.start(PORT);
  } catch (error) {
    process.exit(1);
  }
};

main();
