export type ConfirmedBookingDTO = {
  id: string;
  bookingNumber: string;
  auditoriumId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalAmount: number;
  bookingStatus: string;
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
  startTime?: string;
  endTime?: string;
  totalAmount: number;
  bookingStatus: string;
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
