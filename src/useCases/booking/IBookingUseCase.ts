import { Booking } from "../../domain/entities/Booking";
import { CreateBookingDTO } from "../../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

export interface IBookingUseCase {
  createBooking(data: CreateBookingDTO, user: UserTokenDto): Promise<Booking>;
  getCustomerBookings(user: UserTokenDto): Promise<Booking[]>;
  getOwnerBookings(user: UserTokenDto): Promise<Booking[]>;
  getBookingDetails(id: string, user: UserTokenDto): Promise<Booking>;
  cancelPendingBooking(id: string, user: UserTokenDto): Promise<void>;
}
