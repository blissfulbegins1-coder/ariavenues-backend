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
import { RazorpayService } from "../services/razorpay/RazorpayService";
import { IRazorpayService } from "../services/razorpay/IRazorpayService";
import { BookingRepository } from "../../repositories/booking/BookingRepository";
import { PaymentRepository } from "../../repositories/payment/PaymentRepository";
import { BookingEngine } from "../../engines/booking/BookingEngine";
import { PaymentEngine } from "../../engines/payment/PaymentEngine";
import { BookingUseCase } from "../../useCases/booking/BookingUseCase";
import { PaymentUseCase } from "../../useCases/payment/PaymentUseCase";
import { BookingController } from "../../controllers/BookingController";
import { PaymentController } from "../../controllers/PaymentController";
import { AdminUseCase } from "../../useCases/admin/AdminUseCase";
import { AdminController } from "../../controllers/AdminController";
import { LocationRepository } from "../../repositories/location/LocationRepository";
import { LocationEngine } from "../../engines/location/LocationEngine";
import { LocationUseCase } from "../../useCases/location/LocationUseCase";
import { LocationController } from "../../controllers/LocationController";
import { ActivityRepository } from "../../repositories/activity/ActivityRepository";
import { ActivityEngine } from "../../engines/activity/ActivityEngine";
import { BrokerConnection } from "../config/brocker/BrokerConnection";
import { Producer } from "../amqp/producer/Producer";
import { Consumer } from "../amqp/consumer/Consumer";
import { NotificationRepository } from "../../repositories/notification/NotificationRepository";
import { NotificationEngine } from "../../engines/notification/NotificationEngine";
import { NotificationUseCase } from "../../useCases/notification/NotificationUseCase";
import { NotificationController } from "../../controllers/NotificationController";
import { SocketService } from "../services/socket/SocketService";
import { ReviewRepository } from "../../repositories/review/ReviewRepository";
import { ReviewEngine } from "../../engines/review/ReviewEngine";
import { ReviewUseCase } from "../../useCases/review/ReviewUseCase";
import { ReviewController } from "../../controllers/ReviewController";

export interface IContainer {
  databaseService: DatabaseService;
  otpService: OtpService;
  cloudinaryService: CloudinaryService;
  razorpayService: IRazorpayService;
  userRepository: UserRepository;
  userEngine: UserEngine;
  jwtManagementEngine: JwtManagementEngine;
  userUseCase: UserUseCase;
  userController: UserController;
  auditoriumRepository: AuditoriumRepository;
  auditoriumEngine: AuditoriumEngine;
  auditoriumUseCase: AuditoriumUseCase;
  auditoriumController: AuditoriumController;
  bookingRepository: BookingRepository;
  paymentRepository: PaymentRepository;
  bookingEngine: BookingEngine;
  paymentEngine: PaymentEngine;
  bookingUseCase: BookingUseCase;
  paymentUseCase: PaymentUseCase;
  bookingController: BookingController;
  paymentController: PaymentController;
  adminUseCase: AdminUseCase;
  adminController: AdminController;
  locationRepository: LocationRepository;
  locationEngine: LocationEngine;
  locationUseCase: LocationUseCase;
  locationController: LocationController;
  activityRepository: ActivityRepository;
  activityEngine: ActivityEngine;
  brokerConnection: BrokerConnection;
  producer: Producer;
  consumer: Consumer;
  notificationRepository: NotificationRepository;
  notificationEngine: NotificationEngine;
  notificationUseCase: NotificationUseCase;
  notificationController: NotificationController;
  socketService: SocketService;
}

export const setupContainer = (): AwilixContainer<IContainer> => {
  const container = createContainer<IContainer>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    // Services
    databaseService: asClass(DatabaseService).singleton(),
    otpService: asClass(OtpService).singleton(),
    cloudinaryService: asClass(CloudinaryService).singleton(),
    razorpayService: asClass(RazorpayService).singleton(),
    brokerConnection: asClass(BrokerConnection).singleton(),
    socketService: asClass(SocketService).singleton(),

    // Repositories
    userRepository: asClass(UserRepository).singleton(),
    auditoriumRepository: asClass(AuditoriumRepository).singleton(),
    bookingRepository: asClass(BookingRepository).singleton(),
    paymentRepository: asClass(PaymentRepository).singleton(),
    activityRepository: asClass(ActivityRepository).singleton(),
    notificationRepository: asClass(NotificationRepository).singleton(),

    // Engines
    userEngine: asClass(UserEngine).singleton(),
    auditoriumEngine: asClass(AuditoriumEngine).singleton(),
    bookingEngine: asClass(BookingEngine).singleton(),
    paymentEngine: asClass(PaymentEngine).singleton(),
    jwtManagementEngine: asClass(JwtManagementEngine).singleton(),
    activityEngine: asClass(ActivityEngine).singleton(),
    notificationEngine: asClass(NotificationEngine).singleton(),
    producer: asClass(Producer).singleton(),
    consumer: asClass(Consumer).singleton(),

    // Use Cases
    userUseCase: asClass(UserUseCase).singleton(),
    auditoriumUseCase: asClass(AuditoriumUseCase).singleton(),
    bookingUseCase: asClass(BookingUseCase).singleton(),
    paymentUseCase: asClass(PaymentUseCase).singleton(),
    adminUseCase: asClass(AdminUseCase).singleton(),
    notificationUseCase: asClass(NotificationUseCase).singleton(),

    // Controllers
    userController: asClass(UserController).singleton(),
    auditoriumController: asClass(AuditoriumController).singleton(),
    bookingController: asClass(BookingController).singleton(),
    paymentController: asClass(PaymentController).singleton(),
    adminController: asClass(AdminController).singleton(),
    notificationController: asClass(NotificationController).singleton(),

    locationRepository: asClass(LocationRepository).singleton(),
    locationEngine: asClass(LocationEngine).singleton(),
    locationUseCase: asClass(LocationUseCase).singleton(),
    locationController: asClass(LocationController).singleton(),

    // Review System
    reviewRepository: asClass(ReviewRepository).singleton(),
    reviewEngine: asClass(ReviewEngine).singleton(),
    reviewUseCase: asClass(ReviewUseCase).singleton(),
    reviewController: asClass(ReviewController).singleton(),
  });

  return container;
};

declare global {
  namespace Express {
    interface Request {
      container: AwilixContainer<IContainer>;
    }
  }
}
