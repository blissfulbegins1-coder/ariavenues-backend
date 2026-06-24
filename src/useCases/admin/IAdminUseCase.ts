import { User } from "../../domain/entities/User";
import { Auditorium } from "../../domain/entities/Auditorium";
import { Booking } from "../../domain/entities/Booking";
import { AuditoriumStatus } from "../../domain/enums/AuditoriumStatus";
import UserStatus from "../../domain/enums/UserStatus";
import { BookingStatus } from "../../domain/enums/BookingStatus";

export interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalAuditoriums: number;
  activeBookings: number;
  totalCommission: number;
  monthlyCommission: { name: string; commission: number }[];
  recentActivities: {
    id: string;
    type: "booking" | "payment" | "registration" | "auditorium" | "system";
    title: string;
    message: string;
    time: string;
  }[];
}

export interface IAdminUseCase {
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
  getUsers(): Promise<User[]>;
  getOwners(): Promise<User[]>;
  getAuditoriums(): Promise<Auditorium[]>;
  getBookings(startDate?: string, endDate?: string): Promise<Booking[]>;
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
    type: "booking" | "payment" | "registration" | "auditorium" | "system";
    title: string;
    message: string;
    time: string;
  }[]>;
}
