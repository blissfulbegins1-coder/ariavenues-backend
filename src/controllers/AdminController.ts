import { Request, Response, NextFunction } from "express";
import { IAdminUseCase } from "../useCases/admin/IAdminUseCase";
import {
  signInSchema,
  verifyOtpSchema,
  resendOtpSchema,
  userIdParamSchema,
  updateUserStatusSchema,
  dashboardStatsQuerySchema,
  adminBookingsQuerySchema,
  getActivitiesQuerySchema,
} from "../infrastructure/validation/user/UserValidationSchemas";
import { auditoriumIdParamSchema, updateAuditoriumStatusSchema } from "../infrastructure/validation/auditorium/AuditoriumSchemaValidation";
import { bookingIdParamSchema, updateBookingStatusSchema } from "../infrastructure/validation/booking/BookingValidationSchemas";

type AdminControllerConstructorParams = {
  adminUseCase: IAdminUseCase;
};

export class AdminController {
  private adminUseCase: IAdminUseCase;

  constructor({ adminUseCase }: AdminControllerConstructorParams) {
    this.adminUseCase = adminUseCase;
  }

  async signIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedData = await signInSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.adminUseCase.signIn(validatedData.mobile);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedData = await verifyOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.adminUseCase.verifyOtp(
        validatedData.mobile,
        validatedData.otp
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Verification successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedData = await resendOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.adminUseCase.resendOtp(validatedData.mobile);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedQuery = await dashboardStatsQuerySchema.validate(req.query, {
        abortEarly: false,
      });

      const stats = await this.adminUseCase.getDashboardStats(validatedQuery.startDate, validatedQuery.endDate);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const users = await this.adminUseCase.getUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwners(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const owners = await this.adminUseCase.getOwners();
      return res.status(200).json({
        success: true,
        data: owners,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditoriums(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const auditoriums = await this.adminUseCase.getAuditoriums();
      return res.status(200).json({
        success: true,
        data: auditoriums,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedQuery = await adminBookingsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      const bookings = await this.adminUseCase.getBookings(validatedQuery.startDate, validatedQuery.endDate);
      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAuditoriumStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = await auditoriumIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const validatedData = await updateAuditoriumStatusSchema.validate(req.body, {
        abortEarly: false,
      })
      const result = await this.adminUseCase.updateAuditoriumStatus(
        id,
        validatedData.status,
        validatedData.adminAdvance,
        validatedData.auditoriumAdvance
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Auditorium status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = await userIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const validatedData = await updateUserStatusSchema.validate(req.body, {
        abortEarly: false,
      })

      const result = await this.adminUseCase.updateUserStatus(id, validatedData.status);
      return res.status(200).json({
        success: true,
        data: result,
        message: "User status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedData = await bookingIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const validatedData2 = await updateBookingStatusSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.adminUseCase.updateBookingStatus(validatedData.id, validatedData2.status);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Booking status updated successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedQuery = await getActivitiesQuerySchema.validate(req.query, {
        abortEarly: false,
      });

      const result = await this.adminUseCase.getActivities(
        validatedQuery.page,
        validatedQuery.limit
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
