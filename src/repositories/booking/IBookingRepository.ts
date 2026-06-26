import { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingDbQuery, PaginatedBookingsResponse } from "../../domain/dtos/booking/BookingDto";

export interface IBookingRepository {
  create(data: Partial<Booking>, session?: ClientSession): Promise<Booking>;
  findById(id: string, session?: ClientSession): Promise<Booking | null>;
  findByBookingNumber(bookingNumber: string, session?: ClientSession): Promise<Booking | null>;
  update(
    id: string,
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking | null>;
  deleteById(id: string): Promise<void>;
  listByCustomer(userId: string): Promise<Booking[]>;
  listByOwner(ownerId: string): Promise<Booking[]>;
  checkAvailability(filter: QueryFilter<Booking>): Promise<boolean>;
  listAll(filter: QueryFilter <Booking>): Promise<Booking[]>;
  getBookings(dbQuery: BookingDbQuery): Promise<PaginatedBookingsResponse>;
}
