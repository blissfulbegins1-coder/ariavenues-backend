import { Booking } from "../../domain/entities/Booking";
import { ConfirmedBookingDTO, PublicBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";

export type IBookingAdapter = {
  toPublicDTO(booking: Booking): PublicBookingDTO;
  toConfirmedDTO(booking: Booking): ConfirmedBookingDTO;
  toPublicDTOList(bookings: Booking[]): PublicBookingDTO[];
};
