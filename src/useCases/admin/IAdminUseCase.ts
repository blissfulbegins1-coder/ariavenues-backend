import { User } from "../../domain/entities/User";
import { Auditorium } from "../../domain/entities/Auditorium";
import { Booking } from "../../domain/entities/Booking";

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
  getDashboardStats(): Promise<DashboardStats>;
  getUsers(): Promise<User[]>;
  getOwners(): Promise<User[]>;
  getAuditoriums(): Promise<Auditorium[]>;
  getBookings(): Promise<Booking[]>;
  updateAuditoriumStatus(
    id: string,
    status: "pending" | "draft" | "maintenance" | "active" | "rejected",
    adminAdvance?: number,
    auditoriumAdvance?: number
  ): Promise<Auditorium>;
}
