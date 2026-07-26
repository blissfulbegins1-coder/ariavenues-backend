import { ConfirmedBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";
import { CreateOwnerBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IBookingUseCase } from "./IBookingUseCase";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { BookingFilters, PaginatedBookingsResponse, OwnerDashboardStats } from "../../domain/dtos/booking/BookingDto";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { ApiError } from "../../domain/errors/ApiError";
import UserRoles from "../../domain/enums/UserRole";
import { parseDDMMYYYY, timeToMinutes } from "../../domain/functions/dateFunctions";
import mongoose, { QueryFilter } from "mongoose";
import { HttpStatus } from "../../domain/enums/HttpStatus";
import { logger } from "../../utils/logger";
import { Booking } from "../../domain/entities/Booking";
import { UserModel } from "../../infrastructure/services/mongodb/models/user/UserModel";
import UserStatus from "../../domain/enums/UserStatus";
import { FIXED_BOOKING_AMOUNT } from "../../config/env";

type BookingUseCaseConstructorParams = {
  bookingEngine: IBookingEngine;
  auditoriumEngine: IAuditoriumEngine;
};

export class BookingUseCase implements IBookingUseCase {
  private bookingEngine: IBookingEngine;
  private auditoriumEngine: IAuditoriumEngine;

  constructor({
    bookingEngine,
    auditoriumEngine,
  }: BookingUseCaseConstructorParams) {
    this.bookingEngine = bookingEngine;
    this.auditoriumEngine = auditoriumEngine;
  }

  private async autoCompletePastBookings(): Promise<void> {
    try {
      await this.bookingEngine.autoCompletePastBookings();
    } catch (error) {
      logger.error("Failed to autocomplete past bookings:", error);
    }
  }

  async createOwnerBooking(
    data: CreateOwnerBookingDTO,
    user: UserTokenDto,
  ): Promise<ConfirmedBookingDTO> {
    const auditorium = await this.auditoriumEngine.getAuditoriumById(
      data.auditoriumId,
    );
    if (!auditorium) {
      throw new ApiError("Auditorium not found", HttpStatus.NOT_FOUND);
    }

    if (auditorium.ownerId !== user.id) {
      throw new ApiError("Unauthorized access to this auditorium", HttpStatus.FORBIDDEN);
    }

    const bookingDate = parseDDMMYYYY(data.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDate.getTime())) {
      throw new ApiError("Invalid date provided", HttpStatus.BAD_REQUEST);
    }

    if (bookingDate.getTime() < today.getTime()) {
      throw new ApiError("Cannot book a date in the past", HttpStatus.BAD_REQUEST);
    }

    const newStartMinutes = timeToMinutes(data.startTime);
    const newEndMinutes = timeToMinutes(data.endTime);

    if (newStartMinutes >= newEndMinutes) {
      throw new ApiError("End time must be after start time", HttpStatus.BAD_REQUEST);
    }

    const existingBookings = await this.bookingEngine.getAllBookings({
      auditoriumId: new mongoose.Types.ObjectId(data.auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      startDate: data.bookingDate,
    });

    for (const existing of existingBookings) {
      const eStart = timeToMinutes(existing.startTime ?? "");
      const eEnd = timeToMinutes(existing.endTime ?? "");

      if (newStartMinutes < eEnd && newEndMinutes > eStart) {
        throw new ApiError(
          `The time slot ${data.startTime} - ${data.endTime} overlaps with an existing booking (${existing.startTime} - ${existing.endTime}) for this venue.`,
          HttpStatus.CONFLICT,
        );
      }
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const bookingNumber = `BK-${randomSuffix}`;

    const fixedAmount = FIXED_BOOKING_AMOUNT;

    const userMobile = data.userMobile.trim();
    const userName = data.userName.trim();

    let customerUser = await UserModel.findOne({ mobile: userMobile });
    if (!customerUser) {
      customerUser = await UserModel.create({
        name: userName,
        mobile: userMobile,
        role: UserRoles.CUSTOMER,
        status: UserStatus.ACTIVE,
        mobileVerified: true,
        isActive: true,
      });
    }

    const created = await this.bookingEngine.createBooking({
      bookingNumber,
      auditoriumId: data.auditoriumId,
      ownerId: user.id,
      userId: customerUser._id.toString(),
      startDate: data.bookingDate,
      endDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      totalAmount: fixedAmount,
      bookingStatus: BookingStatus.PENDING_PAYMENT,
      isActive: true,
    } as any);

    return created as ConfirmedBookingDTO;
  }

  async getOwnerBookings(user: UserTokenDto, filters: BookingFilters): Promise<PaginatedBookingsResponse> {
    await this.autoCompletePastBookings();

    const query: any = { isActive: true, ownerId: new mongoose.Types.ObjectId(user.id) };

    if (filters.auditoriumId && filters.auditoriumId !== "all") {
      query.auditoriumId = new mongoose.Types.ObjectId(filters.auditoriumId);
    }

    if (filters.startDate && filters.endDate) {
      const start = parseDDMMYYYY(filters.startDate);
      const end = parseDDMMYYYY(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      query.$expr = {
        $and: [
          {
            $gte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              start,
            ],
          },
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              end,
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

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
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

    return booking as ConfirmedBookingDTO;
  }

  async cancelPendingBooking(id: string, user: UserTokenDto): Promise<void> {
    const booking = await this.bookingEngine.getBookingById(id);
    if (!booking) {
      throw new ApiError("Booking not found", HttpStatus.NOT_FOUND);
    }

    if (booking.userId !== user.id && booking.ownerId !== user.id) {
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

    const approvedAuditoriumsCount = auditoriums.filter(
      (a) => a.approved === true || a.status === "active",
    ).length;

    const pendingAuditoriumsCount = auditoriums.filter(
      (a) => a.approved === false || a.status === "pending",
    ).length;

    return {
      totalAuditoriums: approvedAuditoriumsCount,
      pendingAuditoriums: pendingAuditoriumsCount,
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

  async getBookedSlotsForDate(
    auditoriumId: string,
    date: string,
  ): Promise<{ startTime: string; endTime: string; bookingNumber: string }[]> {
    const bookings = await this.bookingEngine.getAllBookings({
      auditoriumId: new mongoose.Types.ObjectId(auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      startDate: date,
    });

    return bookings.map((b) => ({
      startTime: b.startTime ?? "",
      endTime: b.endTime ?? "",
      bookingNumber: b.bookingNumber,
    }));
  }
}
