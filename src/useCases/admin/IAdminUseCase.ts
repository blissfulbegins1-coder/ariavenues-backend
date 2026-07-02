import { User } from "../../domain/entities/User";
import { Auditorium } from "../../domain/entities/Auditorium";
import { Booking } from "../../domain/entities/Booking";
import { AuditoriumStatus } from "../../domain/enums/AuditoriumStatus";
import UserStatus from "../../domain/enums/UserStatus";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { UserFilters, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
import { AuditoriumFilters, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";
import { BookingFilters, PaginatedBookingsResponse } from "../../domain/dtos/booking/BookingDto";

export type DashboardStats = {
  totalUsers: number;
  totalOwners: number;
  totalAuditoriums: number;
  activeBookings: number;
  totalCommission: number;
  monthlyCommission: { name: string; commission: number }[];
  recentActivities: {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }[];
}

export type IAdminUseCase = {
  signIn(mobile: string): Promise<{ success: boolean; message: string }>;
  verifyOtp(
    mobile: string,
    otp: string,
  ): Promise<{
    user: { id: string; name: string };
    token: string;
    redirectUrl: string;
  }>;
  resendOtp(mobile: string): Promise<{ success: boolean; message: string }>;
  getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats>;
  getUsers(filters: UserFilters): Promise<PaginatedUsersResponse>;
  getOwners(filters: UserFilters): Promise<PaginatedUsersResponse>;
  getAuditoriums(filters: AuditoriumFilters): Promise<PaginatedAuditoriumsResponse>;
  getBookings(filters: BookingFilters): Promise<PaginatedBookingsResponse>;
  updateAuditoriumStatus(
    id: string,
    status: AuditoriumStatus,
    adminAdvance?: number,
    auditoriumAdvance?: number
  ): Promise<Auditorium>;
  updateUserStatus(
    id: string,
    status: UserStatus
  ): Promise<User>;
  updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking>;
  getActivities(
    page: number,
    limit: number
  ): Promise<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }[]>;
}
