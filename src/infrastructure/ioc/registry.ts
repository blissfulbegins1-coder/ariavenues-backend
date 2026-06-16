import {
  AwilixContainer,
  createContainer,
  InjectionMode,
  asClass,
} from "awilix";
import { DatabaseService } from "../services/mongodb/DatabaseService";
import { UserRepository } from "../../repositories/user/UserRepository";
import { UserEngine } from "../../engines/user/UserEngine";
import { JwtManagementEngine } from "../../engines/jwt/JwtManagementEngine";
import { UserUseCase } from "../../useCases/user/UserUseCase";
import { UserController } from "../../controllers/UserController";
import { OtpService } from "../services/otp/OtpService";
import { AuditoriumRepository } from "../../repositories/auditorium/AuditoriumRepository";
import { AuditoriumEngine } from "../../engines/auditorium/AuditoriumEngine";
import { AuditoriumUseCase } from "../../useCases/auditorium/AuditoriumUseCase";
import { AuditoriumController } from "../../controllers/AuditoriumController";
import { CloudinaryService } from "../services/cloudinary/CloudinaryService";

// Type-safe container registry
export interface IContainer {
  databaseService: DatabaseService;
  otpService: OtpService;
  cloudinaryService: CloudinaryService;
  userRepository: UserRepository;
  userEngine: UserEngine;
  jwtManagementEngine: JwtManagementEngine;
  userUseCase: UserUseCase;
  userController: UserController;
  auditoriumRepository: AuditoriumRepository;
  auditoriumEngine: AuditoriumEngine;
  auditoriumUseCase: AuditoriumUseCase;
  auditoriumController: AuditoriumController;
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
    otpService: asClass(OtpService).singleton(),
    cloudinaryService: asClass(CloudinaryService).singleton(),

    // Repositories
    userRepository: asClass(UserRepository).singleton(),
    auditoriumRepository: asClass(AuditoriumRepository).singleton(),

    // Engines
    userEngine: asClass(UserEngine).singleton(),
    auditoriumEngine: asClass(AuditoriumEngine).singleton(),
    jwtManagementEngine: asClass(JwtManagementEngine).singleton(),

    // Use Cases
    userUseCase: asClass(UserUseCase).singleton(),
    auditoriumUseCase: asClass(AuditoriumUseCase).singleton(),

    // Controllers
    userController: asClass(UserController).singleton(),
    auditoriumController: asClass(AuditoriumController).singleton(),

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
