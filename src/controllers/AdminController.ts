import { Request, Response, NextFunction } from "express";
import { IAdminUseCase } from "../useCases/admin/IAdminUseCase";
import {
  signInSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../infrastructure/validation/user/UserValidationSchemas";

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
      const stats = await this.adminUseCase.getDashboardStats();
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
      const bookings = await this.adminUseCase.getBookings();
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
      const { id } = req.params;
      const { status, adminAdvance, auditoriumAdvance } = req.body;

      if (
        !["pending", "draft", "maintenance", "active", "rejected"].includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const result = await this.adminUseCase.updateAuditoriumStatus(
        id as string,
        status as any,
        adminAdvance !== undefined ? Number(adminAdvance) : undefined,
        auditoriumAdvance !== undefined ? Number(auditoriumAdvance) : undefined
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
}
