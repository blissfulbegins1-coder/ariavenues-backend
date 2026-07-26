import { ConfirmedBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";
import { CreateOwnerBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import {
  BookingFilters,
  PaginatedBookingsResponse,
  OwnerDashboardStats,
} from "../../domain/dtos/booking/BookingDto";

export type IBookingUseCase = {
  createOwnerBooking(data: CreateOwnerBookingDTO, user: UserTokenDto): Promise<ConfirmedBookingDTO>;
  getOwnerBookings(user: UserTokenDto, filters: BookingFilters): Promise<PaginatedBookingsResponse>;
  getOwnerDashboardStats(
    user: UserTokenDto,
    statsStart: Date,
    statsEnd: Date,
    targetYear: number,
  ): Promise<OwnerDashboardStats>;
  getBookingDetails(id: string, user: UserTokenDto): Promise<ConfirmedBookingDTO>;
  cancelPendingBooking(id: string, user: UserTokenDto): Promise<void>;
  getPublicBookingsForAuditorium(
    auditoriumId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ startDate: string; endDate: string }[]>;
  getBookedSlotsForDate(
    auditoriumId: string,
    date: string,
  ): Promise<{ startTime: string; endTime: string; bookingNumber: string }[]>;
};
