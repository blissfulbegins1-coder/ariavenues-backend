import { BookingStatus } from "../enums/BookingStatus";

export type Booking = {
  id: string;
  bookingNumber: string;
  auditoriumId: string;
  ownerId: string;
  userId?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalAmount: number;
  bookingStatus: BookingStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  auditorium?: {
    name: string;
    address: string;
    images?: string[];
  };
  user?: {
    name: string;
    email?: string;
    mobile?: string;
  };
  owner?: {
    name: string;
    email?: string;
    mobile?: string;
  };
};
