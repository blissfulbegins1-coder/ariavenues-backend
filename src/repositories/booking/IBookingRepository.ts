import { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";

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
  checkAvailability(
    auditoriumId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean>;
  listAll(filter: QueryFilter <Booking>): Promise<Booking[]>;
}
