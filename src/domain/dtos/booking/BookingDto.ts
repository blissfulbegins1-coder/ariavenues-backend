import { Booking } from "../../entities/Booking";

export type BookingFilters = {
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

export type PaginatedBookingsResponse = {
  bookings: Booking[];
  total: number;
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export type BookingDbQuery = {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}

export type OwnerActivityItem = {
  id: string;
  type: "booking" | "payment";
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
