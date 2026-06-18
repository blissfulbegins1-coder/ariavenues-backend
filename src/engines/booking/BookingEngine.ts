import { ClientSession } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../repositories/booking/IBookingRepository";
import { IBookingEngine } from "./IBookingEngine";

type BookingEngineConstructorParams = {
  bookingRepository: IBookingRepository;
};

export class BookingEngine implements IBookingEngine {
  private bookingRepository: IBookingRepository;

  constructor({ bookingRepository }: BookingEngineConstructorParams) {
    this.bookingRepository = bookingRepository;
  }

  async createBooking(
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking> {
    return await this.bookingRepository.create(data, session);
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return await this.bookingRepository.findById(id);
  }

  async getBookingByBookingNumber(
    bookingNumber: string,
  ): Promise<Booking | null> {
    return await this.bookingRepository.findByBookingNumber(bookingNumber);
  }

  async updateBooking(
    id: string,
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking | null> {
    return await this.bookingRepository.update(id, data, session);
  }

  async listBookingsByCustomer(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.listByCustomer(userId);
  }

  async listBookingsByOwner(ownerId: string): Promise<Booking[]> {
    return await this.bookingRepository.listByOwner(ownerId);
  }

  async checkAvailability(
    auditoriumId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    return await this.bookingRepository.checkAvailability(
      auditoriumId,
      startDate,
      endDate,
      excludeBookingId,
    );
  }

  async deleteBooking(id: string): Promise<void> {
    await this.bookingRepository.deleteById(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return await this.bookingRepository.listAll();
  }
}

