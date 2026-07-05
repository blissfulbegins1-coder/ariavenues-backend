import { ConfirmedBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";
import { CreateBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import {
  BookingFilters,
  PaginatedBookingsResponse,
  OwnerDashboardStats,
  CustomerBookingsPaginatedResponse,
  CustomerBookingsQuery,
} from "../../domain/dtos/booking/BookingDto";

export type IBookingUseCase = {
  createBooking(data: CreateBookingDTO, user: UserTokenDto): Promise<ConfirmedBookingDTO>;
  getCustomerBookings(user: UserTokenDto, query: CustomerBookingsQuery): Promise<CustomerBookingsPaginatedResponse>;
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
}
