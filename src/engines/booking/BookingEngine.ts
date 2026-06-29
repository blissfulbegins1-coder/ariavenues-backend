import { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../repositories/booking/IBookingRepository";
import { IBookingEngine } from "./IBookingEngine";
import { BookingDbQuery, PaginatedBookingsResponse, GetOwnerDashboardStatsDataParams, GetOwnerDashboardStatsDataResponse, OwnerMonthlyRevenue, OwnerActivityItem } from "../../domain/dtos/booking/BookingDto";

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

  async getBookingById(id: string, session?: ClientSession): Promise<Booking | null> {
    return await this.bookingRepository.findById(id, session);
  }

  async getBookingByBookingNumber(
    bookingNumber: string,
    session?: ClientSession,
  ): Promise<Booking | null> {
    return await this.bookingRepository.findByBookingNumber(bookingNumber, session);
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

  async checkAvailability(filter: QueryFilter<Booking>): Promise<boolean> {
    return await this.bookingRepository.checkAvailability(filter);
  }

  async deleteBooking(id: string): Promise<void> {
    await this.bookingRepository.deleteById(id);
  }

  async getAllBookings(filter: QueryFilter<Booking>): Promise<Booking[]> {
    return await this.bookingRepository.listAll(filter);
  }

  async getBookings(dbQuery: BookingDbQuery): Promise<PaginatedBookingsResponse> {
    return await this.bookingRepository.getBookings(dbQuery);
  }

  async autoCompletePastBookings(): Promise<void> {
    await this.bookingRepository.autoCompletePastBookings();
  }

  async getOwnerDashboardStatsData(
    params: GetOwnerDashboardStatsDataParams,
  ): Promise<GetOwnerDashboardStatsDataResponse> {
    return await this.bookingRepository.getOwnerDashboardStatsData(params);
  }
}

