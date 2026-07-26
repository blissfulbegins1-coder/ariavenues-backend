import { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingDbQuery, PaginatedBookingsResponse, GetOwnerDashboardStatsDataParams, GetOwnerDashboardStatsDataResponse } from "../../domain/dtos/booking/BookingDto";

export type IBookingEngine = {
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
  checkAvailability(filter: QueryFilter<Booking>): Promise<boolean>;
  deleteBooking(id: string): Promise<void>;
  getAllBookings(filter?: QueryFilter<Booking>): Promise<Booking[]>;
  getBookings(dbQuery: BookingDbQuery): Promise<PaginatedBookingsResponse>;
  autoCompletePastBookings(): Promise<void>;
  getOwnerDashboardStatsData(filter: GetOwnerDashboardStatsDataParams): Promise<GetOwnerDashboardStatsDataResponse>;
}
