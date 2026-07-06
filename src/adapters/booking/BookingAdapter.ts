import { Booking } from "../../domain/entities/Booking";
import { ConfirmedBookingDTO, PublicBookingDTO } from "../../domain/dtos/booking/ConfirmedBookingDTO";
import { IBookingAdapter } from "./IBookingAdapter";

export class BookingAdapter implements IBookingAdapter {
  toPublicDTO(booking: Booking): PublicBookingDTO {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      auditoriumId: booking.auditoriumId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalDays: booking.totalDays,
      dayRate: booking.dayRate,
      totalAmount: booking.totalAmount,
      bookingStatus: booking.bookingStatus,
      guestCount: booking.guestCount,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      auditorium: {
        name: booking.auditorium?.name ?? "",
        images: booking.auditorium?.images ?? [],
      },
      owner: booking.owner,
    };
  }

  toConfirmedDTO(booking: Booking): ConfirmedBookingDTO {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      auditoriumId: booking.auditoriumId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalDays: booking.totalDays,
      dayRate: booking.dayRate,
      totalAmount: booking.totalAmount,
      bookingStatus: booking.bookingStatus,
      guestCount: booking.guestCount,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      auditorium: {
        name: booking.auditorium?.name ?? "",
        address: booking.auditorium?.address ?? "",
        images: booking.auditorium?.images ?? [],
      },
      owner: booking.owner,
    };
  }

  toPublicDTOList(bookings: Booking[]): PublicBookingDTO[] {
    return bookings.map((b) => this.toPublicDTO(b));
  }
}
