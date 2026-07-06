export type ConfirmedBookingDTO = {
  id: string;
  bookingNumber: string;
  auditoriumId: string;
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
  owner?: {
    name: string;
    email?: string;
    mobile?: string;
  };
};

export type PublicBookingDTO = {
  id: string;
  bookingNumber: string;
  auditoriumId: string;
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
  owner?: {
    name: string;
    email?: string;
    mobile?: string;
  };
};
