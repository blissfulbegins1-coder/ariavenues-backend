import { IAdminUseCase, DashboardStats } from "./IAdminUseCase";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IJwtManagementEngine } from "../../engines/jwt/IJwtManagementEngine";
import { UserFilters, PaginatedUsersResponse } from "../../domain/dtos/user/UserDto";
import { AuditoriumFilters, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";
import { BookingFilters, PaginatedBookingsResponse } from "../../domain/dtos/booking/BookingDto";
import { OtpService } from "../../infrastructure/services/otp/OtpService";
import { User } from "../../domain/entities/User";
import { Auditorium } from "../../domain/entities/Auditorium";
import { Booking } from "../../domain/entities/Booking";
import UserRole from "../../domain/enums/UserRole";
import { ApiError } from "../../domain/errors/ApiError";
import { REDIRECT_PATHS } from "../../domain/constants/constants";
import { QueryFilter, Types } from "mongoose";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { AuditoriumStatus } from "../../domain/enums/AuditoriumStatus";
import UserStatus from "../../domain/enums/UserStatus";
import { parseDDMMYYYY } from "../../utils/dateUtils";
import { IActivityEngine } from "../../engines/activity/IActivityEngine";
import { getRelativeTime } from "../../domain/functions/getRaltiveTime";


type AdminUseCaseConstructorParams = {
  userEngine: IUserEngine;
  auditoriumEngine: IAuditoriumEngine;
  bookingEngine: IBookingEngine;
  jwtManagementEngine: IJwtManagementEngine;
  otpService: OtpService;
  activityEngine: IActivityEngine;
};

export class AdminUseCase implements IAdminUseCase {
  private userEngine: IUserEngine;
  private auditoriumEngine: IAuditoriumEngine;
  private bookingEngine: IBookingEngine;
  private jwtManagementEngine: IJwtManagementEngine;
  private otpService: OtpService;
  private activityEngine: IActivityEngine;

  constructor({
    userEngine,
    auditoriumEngine,
    bookingEngine,
    jwtManagementEngine,
    otpService,
    activityEngine,
  }: AdminUseCaseConstructorParams) {
    this.userEngine = userEngine;
    this.auditoriumEngine = auditoriumEngine;
    this.bookingEngine = bookingEngine;
    this.jwtManagementEngine = jwtManagementEngine;
    this.otpService = otpService;
    this.activityEngine = activityEngine;

  }

  async signIn(mobile: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user) {
      throw new ApiError("User not found!");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ApiError(
        "Access denied. Only system administrators can sign in here."
      );
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOtp(
    mobile: string,
    otp: string
  ): Promise<{
    user: { id: string; name: string };
    token: string;
    redirectUrl: string;
  }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ApiError("Unauthorized admin credentials.");
    }

    await this.otpService.verifyOtp(mobile, otp);

    const token = this.jwtManagementEngine.generateToken({
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
      },
      token,
      redirectUrl: REDIRECT_PATHS[UserRole.ADMIN],
    };
  }

  async resendOtp(
    mobile: string
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userEngine.getUserByMobile(mobile);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ApiError("Unauthorized admin credentials.");
    }

    await this.otpService.sendOtp(mobile);

    return {
      success: true,
      message: "OTP resent successfully",
    };
  }

  async getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    try {

      let userFilter: QueryFilter<User> = {
        role: { $in: [UserRole.CUSTOMER, UserRole.OWNER] },
      };
      if (startDate && endDate) {
        const start = parseDDMMYYYY(startDate);
        const end = parseDDMMYYYY(endDate);
        end.setHours(23, 59, 59, 999);
        userFilter.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
      const users = await this.userEngine.getAllUsers(userFilter);
      const customers = users.filter((u) => u.role.includes(UserRole.CUSTOMER));
      const owners = users.filter((u) => u.role.includes(UserRole.OWNER));

      let auditoriumFilter: QueryFilter<Auditorium> = {
        status: AuditoriumStatus.ACTIVE,
        approved: true,
      };
      if (startDate && endDate) {
        const start = parseDDMMYYYY(startDate);
        const end = parseDDMMYYYY(endDate);
        end.setHours(23, 59, 59, 999);
        auditoriumFilter.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
      const auditoriums = await this.auditoriumEngine.getAllAuditoriums(auditoriumFilter);

      let bookingFilter: QueryFilter<Booking> = {
        bookingStatus: { $in: [BookingStatus.CONFIRMED] },
      };
      if (startDate && endDate) {
        const start = parseDDMMYYYY(startDate);
        const end = parseDDMMYYYY(endDate);
        end.setHours(23, 59, 59, 999);
        bookingFilter.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
      const bookings = await this.bookingEngine.getAllBookings(bookingFilter);

      let actualCommission = 0;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const commissionsByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      bookings.forEach((bk) => {
        const commission = bk.adminAdvance || 0;
        actualCommission += commission;

        const monthIndex = new Date(bk.createdAt).getMonth();

        if (monthIndex >= 0 && monthIndex <= 11) {
          commissionsByMonth[monthIndex] += commission;
        }
      });

      const monthlyCommission = months.map((m, idx) => {
        const dbComm = commissionsByMonth[idx];
        return {
          name: m,
          commission: dbComm > 0 ? dbComm : 0,
        };
      });

      const recentDbActivities = await this.activityEngine.getRecentActivities(4);
      const recentActivities = recentDbActivities.map((act) => {
        let type: "booking" | "payment" | "registration" | "auditorium" | "system" = "system";
        if (act.type === "USER_REGISTERED" || act.type === "OWNER_REGISTERED") {
          type = "registration";
        } else if (act.type === "AUDITORIUM_SUBMITTED") {
          type = "auditorium";
        } else if (act.type === "BOOKING_CONFIRMED") {
          type = "booking";
        } else if (act.type === "PAYMENT_RECEIVED") {
          type = "payment";
        }

        return {
          id: act.id,
          type,
          title: act.title,
          message: act.description,
          time: getRelativeTime(act.createdAt),
        };
      });


      return {
        totalUsers: customers.length,
        totalOwners: owners.length,
        totalAuditoriums: auditoriums.length,
        activeBookings: bookings.length,
        totalCommission: actualCommission,
        monthlyCommission,
        recentActivities,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUsers(filters: UserFilters): Promise<PaginatedUsersResponse> {
    const query: any = { isActive: true, role: UserRole.CUSTOMER };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
      ];
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === "name") {
      sortObj = { name: 1 };
    }

    const skip = (filters.page && filters.limit) ? (filters.page - 1) * filters.limit : null;
    const limit = (filters.page && filters.limit) ? filters.limit : null;

    return await this.userEngine.getUsers({
      query,
      sort: sortObj,
      skip,
      limit,
    });
  }

  async getOwners(filters: UserFilters): Promise<PaginatedUsersResponse> {
    const query: any = { isActive: true, role: UserRole.OWNER };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
      ];
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === "name") {
      sortObj = { name: 1 };
    }

    const skip = (filters.page && filters.limit) ? (filters.page - 1) * filters.limit : null;
    const limit = (filters.page && filters.limit) ? filters.limit : null;

    return await this.userEngine.getUsers({
      query,
      sort: sortObj,
      skip,
      limit,
    });
  }

  async getAuditoriums(filters: AuditoriumFilters): Promise<PaginatedAuditoriumsResponse> {
    const query: any = { isActive: true };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
      ];
    }

    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === "name") {
      sortObj = { name: 1 };
    }

    const skip = (filters.page && filters.limit) ? (filters.page - 1) * filters.limit : null;
    const limit = (filters.page && filters.limit) ? filters.limit : null;

    return await this.auditoriumEngine.getAuditoriums({
      query,
      sort: sortObj,
      skip,
      limit,
    });
  }

  async getBookings(filters: BookingFilters): Promise<PaginatedBookingsResponse> {
    const query: any = { isActive: true };

    if (filters.startDate && filters.endDate) {
      const start = parseDDMMYYYY(filters.startDate);
      const end = parseDDMMYYYY(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      const [matchingUsers, matchingAuditoriums] = await Promise.all([
        this.userEngine.getAllUsers({ name: searchRegex }),
        this.auditoriumEngine.getAllAuditoriums({ name: searchRegex }),
      ]);
      const userIds = matchingUsers.map(u => new Types.ObjectId(u.id));
      const auditoriumIds = matchingAuditoriums.map(a => new Types.ObjectId(a.id));

      query.$or = [
        { bookingNumber: searchRegex },
        { userId: { $in: userIds } },
        { auditoriumId: { $in: auditoriumIds } },
      ];
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "revenue") {
        query.bookingStatus = { $in: ["confirmed", "completed"] };
      } else {
        query.bookingStatus = filters.status;
      }
    }

    let sortObj: any = { createdAt: -1 };
    if (filters.sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    }

    const skip = (filters.page && filters.limit) ? (filters.page - 1) * filters.limit : null;
    const limit = (filters.page && filters.limit) ? filters.limit : null;

    return await this.bookingEngine.getBookings({
      query,
      sort: sortObj,
      skip,
      limit,
    });
  }

  async updateAuditoriumStatus(
    id: string,
    status: AuditoriumStatus,
    adminAdvance?: number,
    auditoriumAdvance?: number
  ): Promise<Auditorium> {
    const updateData: Partial<Auditorium> = { status };
    if (status === AuditoriumStatus.ACTIVE) {
      updateData.approved = true;
      if (adminAdvance !== undefined) updateData.adminAdvance = adminAdvance;
      if (auditoriumAdvance !== undefined) updateData.auditoriumAdvance = auditoriumAdvance;
    } else if (status === AuditoriumStatus.REJECTED) {
      updateData.approved = false;
    }
    return await this.auditoriumEngine.updateAuditorium(id, updateData);
  }

  async updateUserStatus(
    id: string,
    status: UserStatus
  ): Promise<User> {
    const updated = await this.userEngine.updateUser(id, { status });
    if (!updated) {
      throw new ApiError("User Not Found");
    }
    return updated;
  }

  async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking> {
    const updated = await this.bookingEngine.updateBooking(id, { bookingStatus: status });
    if (!updated) {
      throw new ApiError("Booking Not Found!");
    }
    return updated;
  }

  async getActivities(
    page: number,
    limit: number
  ): Promise<{
    id: string;
    type: "booking" | "payment" | "registration" | "auditorium" | "system";
    title: string;
    message: string;
    time: string;
  }[]> {
    const recentDbActivities = await this.activityEngine.getPaginatedActivities(page, limit);
    return recentDbActivities.map((act) => {
      let type: "booking" | "payment" | "registration" | "auditorium" | "system" = "system";
      if (act.type === "USER_REGISTERED" || act.type === "OWNER_REGISTERED") {
        type = "registration";
      } else if (act.type === "AUDITORIUM_SUBMITTED") {
        type = "auditorium";
      } else if (act.type === "BOOKING_CONFIRMED") {
        type = "booking";
      } else if (act.type === "PAYMENT_RECEIVED") {
        type = "payment";
      }

      return {
        id: act.id,
        type,
        title: act.title,
        message: act.description,
        time: getRelativeTime(act.createdAt),
      };
    });
  }
}
