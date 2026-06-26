import { Booking } from "../../entities/Booking";

export interface BookingFilters {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: "all" | "confirmed" | "completed" | "cancelled" | "pending_payment" | string;
  sortBy?: "recent" | "oldest" | string;
  year?: number | null;
  month?: number | null;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedBookingsResponse {
  bookings: Booking[];
  total: number;
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface BookingDbQuery {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}
