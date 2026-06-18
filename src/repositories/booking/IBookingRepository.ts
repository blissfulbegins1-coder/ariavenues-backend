import { ClientSession } from "mongoose";
import { Booking } from "../../domain/entities/Booking";

export interface IBookingRepository {
  create(data: Partial<Booking>, session?: ClientSession): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByBookingNumber(bookingNumber: string): Promise<Booking | null>;
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
  listAll(): Promise<Booking[]>;
}
