import { Booking } from "../../domain/entities/Booking";
import { CreateBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IBookingUseCase } from "./IBookingUseCase";
import { AppError } from "../../domain/errors/AppError";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";

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
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // CONFIRMED bookings where endDate is before today are COMPLETED
      await BookingModel.updateMany(
        {
          bookingStatus: "CONFIRMED",
          endDate: { $lt: now },
        },
        {
          $set: { bookingStatus: "COMPLETED" },
        },
      );
    } catch (error) {
      console.error("Failed to autocomplete past bookings:", error);
    }
  }

  async createBooking(
    data: CreateBookingDTO,
    user: UserTokenDto,
  ): Promise<Booking> {
    const auditorium = await this.auditoriumEngine.getAuditoriumById(
      data.auditoriumId,
    );
    if (!auditorium) {
      throw new AppError("Auditorium not found", 404);
    }

    if (data.guestCount > auditorium.capacity) {
      throw new AppError(
        `Guest count exceeds auditorium maximum capacity of ${auditorium.capacity}`,
        400,
      );
    }

    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(data.endDate);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError("Invalid dates provided", 400);
    }

    if (start.getTime() < today.getTime()) {
      throw new AppError("Cannot book a date in the past", 400);
    }

    if (start.getTime() > end.getTime()) {
      throw new AppError("Start date cannot be after end date", 400);
    }

    // Check overlaps
    const isAvailable = await this.bookingEngine.checkAvailability(
      data.auditoriumId,
      start,
      end,
    );
    if (!isAvailable) {
      throw new AppError(
        "Auditorium is already reserved or booked for these dates",
        409,
      );
    }

    const totalDays =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayRate = auditorium.dayRate;
    const totalAmount = dayRate * totalDays;

    // Generate Booking Number: BOOK[random-4-digits][YYYYMMDD]
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
      startDate: start,
      endDate: end,
      totalDays,
      dayRate,
      totalAmount,
      bookingStatus: "PENDING_PAYMENT",
      guestCount: data.guestCount,
    });

    return newBooking;
  }

  async getCustomerBookings(user: UserTokenDto): Promise<Booking[]> {
    await this.autoCompletePastBookings();
    return await this.bookingEngine.listBookingsByCustomer(user.id);
  }

  async getOwnerBookings(user: UserTokenDto): Promise<Booking[]> {
    await this.autoCompletePastBookings();
    return await this.bookingEngine.listBookingsByOwner(user.id);
  }

  async getBookingDetails(id: string, user: UserTokenDto): Promise<Booking> {
    await this.autoCompletePastBookings();

    const booking = await this.bookingEngine.getBookingById(id);
    if (!booking) {
      throw new AppError("Booking details not found", 404);
    }

    // Verify access hierarchy
    if (user.role === "customer" && booking.userId !== user.id) {
      throw new AppError("Unauthorized access to this booking details", 403);
    }
    if (user.role === "owner" && booking.ownerId !== user.id) {
      throw new AppError("Unauthorized access to this booking details", 403);
    }

    return booking;
  }

  async cancelPendingBooking(id: string, user: UserTokenDto): Promise<void> {
    const booking = await this.bookingEngine.getBookingById(id);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.userId !== user.id) {
      throw new AppError(
        "Unauthorized: you cannot cancel this booking",
        403,
      );
    }

    if (booking.bookingStatus !== "PENDING_PAYMENT") {
      throw new AppError(
        "Only PENDING_PAYMENT bookings can be cancelled this way",
        400,
      );
    }

    await this.bookingEngine.deleteBooking(id);
  }
}

