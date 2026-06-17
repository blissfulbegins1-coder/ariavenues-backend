export interface CreateBookingDTO {
  auditoriumId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  guestCount: number;
}
