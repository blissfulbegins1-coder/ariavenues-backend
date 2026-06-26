import { Booking } from "../../domain/entities/Booking";
import { CreateBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { BookingFilters, PaginatedBookingsResponse } from "../../domain/dtos/booking/BookingDto";

export interface IBookingUseCase {
  createBooking(data: CreateBookingDTO, user: UserTokenDto): Promise<Booking>;
  getCustomerBookings(user: UserTokenDto): Promise<Booking[]>;
  getOwnerBookings(user: UserTokenDto, filters: BookingFilters): Promise<PaginatedBookingsResponse>;
  getBookingDetails(id: string, user: UserTokenDto): Promise<Booking>;
  cancelPendingBooking(id: string, user: UserTokenDto): Promise<void>;
  getPublicBookingsForAuditorium(
    auditoriumId: string,
    startDate: string,
    endDate: string,
  ): Promise<Booking[]>;
}
