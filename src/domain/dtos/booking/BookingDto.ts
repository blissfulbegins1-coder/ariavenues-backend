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

export interface OwnerActivityItem {
  id: string;
  type: "booking" | "payment";
  bookingNumber: string;
  auditoriumName: string;
  customerName: string;
  amount: number;
  createdAt: Date;
}

export interface OwnerMonthlyRevenue {
  month: string;
  revenue: number;
}

export interface OwnerDashboardStats {
  totalAuditoriums: number;
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  totalRevenue: number;
  monthlyRevenue: OwnerMonthlyRevenue[];
  recentActivity: OwnerActivityItem[];
}

export interface GetOwnerDashboardStatsDataParams {
  ownerId: string;
  statsStart: Date;
  statsEnd: Date;
  targetYear: number;
}

export interface GetOwnerDashboardStatsDataResponse {
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  monthlyRevenue: OwnerMonthlyRevenue[];
  recentActivity: OwnerActivityItem[];
}
