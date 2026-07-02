import { Booking } from "../../entities/Booking";

export type BookingFilters = {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: string;
  sortBy?: string;
  year?: number | null;
  month?: number | null;
  startDate?: string;
  endDate?: string;
}

export type PaginatedBookingsResponse = {
  bookings: Booking[];
  total: number;
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export type CustomerBookingsPaginatedResponse = {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}

export type CustomerBookingsQuery = {
  page: number;
  limit: number;
}

export type BookingDbQuery = {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}

export type OwnerActivityItem = {
  id: string;
  type: string;
  bookingNumber: string;
  auditoriumName: string;
  customerName: string;
  amount: number;
  createdAt: Date;
}

export type OwnerMonthlyRevenue = {
  month: string;
  revenue: number;
}

export type OwnerDashboardStats = {
  totalAuditoriums: number;
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  totalRevenue: number;
  monthlyRevenue: OwnerMonthlyRevenue[];
  recentActivity: OwnerActivityItem[];
}

export type GetOwnerDashboardStatsDataParams = {
  ownerId: string;
  statsStart: Date;
  statsEnd: Date;
  targetYear: number;
}

export type GetOwnerDashboardStatsDataResponse = {
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  monthlyRevenue: OwnerMonthlyRevenue[];
  recentActivity: OwnerActivityItem[];
}
