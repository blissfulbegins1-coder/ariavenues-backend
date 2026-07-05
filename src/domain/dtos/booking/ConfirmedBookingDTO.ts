export type ConfirmedBookingDTO = {
  id: string;
  bookingNumber: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dayRate: number;
  totalAmount: number;
  bookingStatus: string;
  guestCount: number;
  createdAt: Date;
  updatedAt: Date;
  auditorium: {
    name: string;
    address: string;
    images: string[];
  };
};

export type PublicBookingDTO = {
  id: string;
  bookingNumber: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dayRate: number;
  totalAmount: number;
  bookingStatus: string;
  guestCount: number;
  createdAt: Date;
  updatedAt: Date;
  auditorium: {
    name: string;
    images: string[];
  };
};
