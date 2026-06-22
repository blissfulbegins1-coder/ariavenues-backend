import { BookingStatus } from "../enums/BookingStatus";

export interface Booking {
  id: string;
  bookingNumber: string;
  auditoriumId: string;
  userId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dayRate: number;
  totalAmount: number;
  adminAdvance?: number;
  auditoriumAdvance?: number;
  bookingStatus: BookingStatus;
  guestCount: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  auditorium?: {
    name: string;
    address: string;
    images: string[];
  };
}
