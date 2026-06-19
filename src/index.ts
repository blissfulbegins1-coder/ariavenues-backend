import "dotenv/config";
import { setupContainer } from "./infrastructure/ioc/registry";
import { Server } from "./infrastructure/webServer/server";
import { DatabaseService } from "./infrastructure/services/mongodb/DatabaseService";

const main = async (): Promise<void> => {
  try {
    const container = setupContainer();
    
    const databaseService =
      container.resolve<DatabaseService>("databaseService");
    await databaseService.connect();

    const port = parseInt(process.env.PORT!);

    const server = new Server(container);
    await server.start(port);
  } catch (error) {
    process.exit(1);
  }
};

main();
