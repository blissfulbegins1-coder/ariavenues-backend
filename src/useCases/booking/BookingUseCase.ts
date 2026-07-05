import { ConfirmedBookingDTO, PublicBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";
import { CreateBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IBookingUseCase } from "./IBookingUseCase";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { BookingFilters, PaginatedBookingsResponse, OwnerDashboardStats, CustomerBookingsPaginatedResponse, CustomerBookingsQuery } from "../../domain/dtos/booking/BookingDto";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { ApiError } from "../../domain/errors/ApiError";
import UserRoles from "../../domain/enums/UserRole";
import { parseDDMMYYYY } from "../../domain/functions/dateFunctions";
import mongoose, { QueryFilter } from "mongoose";
import { IProducer } from "../../infrastructure/amqp/producer/IProducer";
import { BrokerConfig } from "../../infrastructure/config/brocker/brokerConfig";
import { HttpStatus } from "../../domain/enums/HttpStatus";
import { logger } from "../../utils/logger";
import { IBookingAdapter } from "../../adapters/booking/IBookingAdapter";
import { Booking } from "../../domain/entities/Booking";

type BookingUseCaseConstructorParams = {
  bookingEngine: IBookingEngine;
  auditoriumEngine: IAuditoriumEngine;
  producer: IProducer;
  bookingAdapter: IBookingAdapter;
};

export class BookingUseCase implements IBookingUseCase {
  private bookingEngine: IBookingEngine;
  private auditoriumEngine: IAuditoriumEngine;
  private producer: IProducer;
  private bookingAdapter: IBookingAdapter;

  constructor({
    bookingEngine,
    auditoriumEngine,
    producer,
    bookingAdapter,
  }: BookingUseCaseConstructorParams) {
    this.bookingEngine = bookingEngine;
    this.auditoriumEngine = auditoriumEngine;
    this.producer = producer;
    this.bookingAdapter = bookingAdapter;
  }

  private async autoCompletePastBookings(): Promise<void> {
    try {
      await this.bookingEngine.autoCompletePastBookings();
    } catch (error) {
      logger.error("Failed to autocomplete past bookings:", error);
    }
  }

  async createBooking(
    data: CreateBookingDTO,
    user: UserTokenDto,
  ): Promise<ConfirmedBookingDTO> {
    const auditorium = await this.auditoriumEngine.getAuditoriumById(
      data.auditoriumId,
    );
    if (!auditorium) {
      throw new ApiError("Auditorium not found", HttpStatus.NOT_FOUND);
    }

    if (auditorium.ownerId === user.id) {
      throw new ApiError("You cannot book your own auditorium", HttpStatus.BAD_REQUEST);
    }

    if (auditorium.adminAdvance === 0 || auditorium.auditoriumAdvance === 0) {
      throw new ApiError("Advance is not available to book this auditorium", HttpStatus.BAD_REQUEST);
    }

    if (!auditorium.approved) {
      throw new ApiError("Auditorium is not verified to book", HttpStatus.BAD_REQUEST);
    }

    if (data.guestCount > auditorium.capacity) {
      throw new ApiError(
        `Guest count exceeds auditorium maximum capacity of ${auditorium.capacity}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const start = parseDDMMYYYY(data.startDate);
    const end = parseDDMMYYYY(data.endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError("Invalid dates provided", HttpStatus.BAD_REQUEST);
    }

    if (start.getTime() < today.getTime()) {
      throw new ApiError("Cannot book a date in the past", HttpStatus.BAD_REQUEST);
    }

    if (start.getTime() > end.getTime()) {
      throw new ApiError("Start date cannot be after end date", HttpStatus.BAD_REQUEST);
    }

    const availabilityFilter: QueryFilter<Booking> = {
      auditoriumId: new mongoose.Types.ObjectId(data.auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      $expr: {
        $and: [
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              end,
            ],
          },
          {
            $gte: [
              { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
              start,
            ],
          },
        ],
      },
    };

    const isAvailable = await this.bookingEngine.checkAvailability(availabilityFilter);
    if (!isAvailable) {
      throw new ApiError(
        "Auditorium is already reserved or booked for these dates",
        HttpStatus.CONFLICT
      );
    }

    const dayRate = auditorium.dayRate;
    const adminAdvance = auditorium.adminAdvance;
    const auditoriumAdvance = auditorium.auditoriumAdvance;

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${day}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BOOK${randomDigits}${dateStr}`;

    const newBooking = await this.bookingEngine.createBooking({
      bookingNumber,
      auditoriumId: data.auditoriumId,
      userId: user.id,
      ownerId: auditorium.ownerId,
      startDate: data.startDate,
      endDate: data.endDate,
      dayRate,
      adminAdvance,
      auditoriumAdvance,
      bookingStatus: BookingStatus.PENDING_PAYMENT,
      guestCount: data.guestCount,
    });

    if (newBooking) {
      await this.producer.publish(BrokerConfig.routingKeys.BOOKING_NOTIFICATION, {
        receiverId: newBooking.ownerId,
        senderId: user.id,
        role: UserRoles.OWNER,
        type: "booking_created",
        title: "New Booking Request",
        message: `You have a new booking request for "${auditorium.name}" (Ref: ${bookingNumber}).`,
        referenceId: newBooking.id,
        referenceType: "booking",
        isRead: false,
        readAt: null,
        delivered: false,
      });
    }

    return this.bookingAdapter.toConfirmedDTO(newBooking);
  }

  async getCustomerBookings(
    user: UserTokenDto,
    query: CustomerBookingsQuery,
  ): Promise<CustomerBookingsPaginatedResponse> {
    await this.autoCompletePastBookings();
    const result = await this.bookingEngine.listBookingsByCustomerPaginated(user.id, query);
    return {
      ...result,
      bookings: this.bookingAdapter.toPublicDTOList(result.bookings) as any,
    };
  }

  async getOwnerBookings(user: UserTokenDto, filters: BookingFilters): Promise<PaginatedBookingsResponse> {
    await this.autoCompletePastBookings();

    const query: any = { isActive: true, ownerId: new mongoose.Types.ObjectId(user.id) };

    if (filters.startDate && filters.endDate) {
      const start = parseDDMMYYYY(filters.startDate);
      const end = parseDDMMYYYY(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      query.$expr = {
        $and: [
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              end,
            ],
          },
          {
            $gte: [
              { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
              start,
            ],
          },
        ],
      };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      const matchingAuditoriums = await this.auditoriumEngine.getAllAuditoriums({
        ownerId: user.id,
        name: searchRegex,
      });
      const auditoriumIds = matchingAuditoriums.map(a => new mongoose.Types.ObjectId(a.id));

      query.$or = [
        { bookingNumber: searchRegex },
        { auditoriumId: { $in: auditoriumIds } },
      ];
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "revenue") {
        query.bookingStatus = { $in: ["confirmed", "completed"] };
      } else {
        query.bookingStatus = filters.status;
      }
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    }

    const skip  = (filters.page && filters.limit) ? (filters.page - 1) * filters.limit : null;
    const limit = (filters.page && filters.limit) ? filters.limit : null;

    return await this.bookingEngine.getBookings({
      query,
      sort: sortObj,
      skip,
      limit,
    });
  }

  async getBookingDetails(id: string, user: UserTokenDto): Promise<ConfirmedBookingDTO> {
    await this.autoCompletePastBookings();

    const booking = await this.bookingEngine.getBookingById(id);
    if (!booking) {
      throw new ApiError("Booking details not found", HttpStatus.NOT_FOUND);
    }

    if (user.role === UserRoles.CUSTOMER && booking.userId !== user.id) {
      throw new ApiError("Unauthorized access to this booking details", HttpStatus.FORBIDDEN);
    }
    if (user.role === UserRoles.OWNER && booking.ownerId !== user.id) {
      throw new ApiError("Unauthorized access to this booking details", HttpStatus.FORBIDDEN);
    }

    return this.bookingAdapter.toConfirmedDTO(booking);
  }

  async cancelPendingBooking(id: string, user: UserTokenDto): Promise<void> {
    const booking = await this.bookingEngine.getBookingById(id);
    if (!booking) {
      throw new ApiError("Booking not found", HttpStatus.NOT_FOUND);
    }

    if (booking.userId !== user.id) {
      throw new ApiError(
        "Unauthorized: you cannot cancel this booking",
        HttpStatus.FORBIDDEN
      );
    }

    if (booking.bookingStatus !== BookingStatus.PENDING_PAYMENT) {
      throw new ApiError(
        "Only PENDING_PAYMENT bookings can be cancelled this way",
        HttpStatus.BAD_REQUEST
      );
    }

    await this.bookingEngine.deleteBooking(id);
  }

  async getOwnerDashboardStats(
    user: UserTokenDto,
    statsStart: Date,
    statsEnd: Date,
    targetYear: number,
  ): Promise<OwnerDashboardStats> {
    await this.autoCompletePastBookings();

    const [statsData, auditoriums] = await Promise.all([
      this.bookingEngine.getOwnerDashboardStatsData({
        ownerId: user.id,
        statsStart,
        statsEnd,
        targetYear,
      }),
      this.auditoriumEngine.getAllAuditoriums({ ownerId: user.id }),
    ]);

    const totalRevenue = statsData.monthlyRevenue.reduce((s, m) => s + m.revenue, 0);

    return {
      totalAuditoriums: auditoriums.length,
      totalBookings: statsData.totalBookings,
      confirmedCount: statsData.confirmedCount,
      completedCount: statsData.completedCount,
      totalRevenue,
      monthlyRevenue: statsData.monthlyRevenue,
      recentActivity: statsData.recentActivity,
    };
  }

  async getPublicBookingsForAuditorium(
    auditoriumId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ startDate: string; endDate: string }[]> {
    const parsedStart = parseDDMMYYYY(startDate);
    const parsedEnd = parseDDMMYYYY(endDate);

    const filter: QueryFilter<Booking> = {
      auditoriumId: new mongoose.Types.ObjectId(auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      $expr: {
        $and: [
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              parsedEnd,
            ],
          },
          {
            $gte: [
              { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
              parsedStart,
            ],
          },
        ],
      },
    };

    const bookings = await this.bookingEngine.getAllBookings(filter);

    return bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));
  }
}
