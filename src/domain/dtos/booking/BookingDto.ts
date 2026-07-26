import { QueryFilter } from "mongoose";
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
  auditoriumId?: string;
}

export type PaginatedBookingsResponse = {
  bookings: Booking[];
  total: number;
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export type BookingDbQuery = {
  query: QueryFilter<Booking>;
  sort: Record<string, 1 | -1>;
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
  pendingAuditoriums: number;
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
