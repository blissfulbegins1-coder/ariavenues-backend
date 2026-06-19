import { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";

export interface IBookingEngine {
  createBooking(
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking>;
  getBookingById(id: string, session?: ClientSession): Promise<Booking | null>;
  getBookingByBookingNumber(bookingNumber: string, session?: ClientSession): Promise<Booking | null>;
  updateBooking(
    id: string,
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking | null>;
  listBookingsByCustomer(userId: string): Promise<Booking[]>;
  listBookingsByOwner(ownerId: string): Promise<Booking[]>;
  checkAvailability(
    auditoriumId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean>;
  deleteBooking(id: string): Promise<void>;
  getAllBookings(filter?: QueryFilter<Booking>): Promise<Booking[]>;
}
