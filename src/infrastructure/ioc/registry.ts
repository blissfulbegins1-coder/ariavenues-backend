import {
  AwilixContainer,
  createContainer,
  InjectionMode,
  asClass,
} from "awilix";
import { DatabaseService } from "../services/mongodb/DatabaseService";
import { UserRepository } from "../../repositories/UserRepository";
import { UserEngine } from "../../engines/UserEngine";
import { UserUseCase } from "../../useCases/User/UserUseCase";
import { UserController } from "../../controllers/UserController";

// Type-safe container registry
export interface IContainer {
  databaseService: DatabaseService;
  userRepository: UserRepository;
  userEngine: UserEngine;
  userUseCase: UserUseCase;
  userController: UserController;
}

// Setup Awilix DI Container
export const setupContainer = (): AwilixContainer<IContainer> => {
  const container = createContainer<IContainer>({
    injectionMode: InjectionMode.PROXY,
  });

  // Register all dependencies in one place
  container.register({
    // Services
    databaseService: asClass(DatabaseService).singleton(),

    // Repositories
    userRepository: asClass(UserRepository).singleton(),

    // Engines
    userEngine: asClass(UserEngine).singleton(),

    // Use Cases
    userUseCase: asClass(UserUseCase).singleton(),

    // Controllers
    userController: asClass(UserController).singleton(),

    // Ready for future services:
    // LogsRepository: asClass(LogsRepository).singleton(),
    // LogsEngine: asClass(LogsEngine).singleton(),
    // LogsUseCase: asClass(LogsUseCase).singleton(),
    // LogsController: asClass(LogsController).singleton(),
  });

  return container;
};

// Type for accessing container in Express
declare global {
  namespace Express {
    interface Request {
      container: AwilixContainer<IContainer>;
    }
  }
}
