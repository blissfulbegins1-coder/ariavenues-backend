import { Request, Response, NextFunction } from "express";
import { IBookingUseCase } from "../useCases/booking/IBookingUseCase";
import {
  createOwnerBookingSchema,
  bookingIdParamSchema,
  getPublicBookingsSchema,
  ownerDashboardStatsQuerySchema,
} from "../infrastructure/validation/booking/BookingValidationSchemas";
import { CreateOwnerBookingDTO } from "../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";
import { adminBookingsQuerySchema } from "../infrastructure/validation/user/UserValidationSchemas";

type BookingControllerConstructorParams = {
  bookingUseCase: IBookingUseCase;
};

export class BookingController {
  private bookingUseCase: IBookingUseCase;

  constructor({ bookingUseCase }: BookingControllerConstructorParams) {
    this.bookingUseCase = bookingUseCase;
  }

  async createOwnerBooking(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedData = await createOwnerBookingSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.bookingUseCase.createOwnerBooking(
        validatedData as CreateOwnerBookingDTO,
        user,
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: "Owner booking created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerBookings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const filters = await adminBookingsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      const result = await this.bookingUseCase.getOwnerBookings(user, filters);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedQuery = (await ownerDashboardStatsQuerySchema.validate(req.query, {
        abortEarly: false,
      })) as any;
      const result = await this.bookingUseCase.getOwnerDashboardStats(
        user,
        validatedQuery.statsStart,
        validatedQuery.statsEnd,
        validatedQuery.targetYear,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const { id } = await bookingIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const result = await this.bookingUseCase.getBookingDetails(id, user);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const { id } = await bookingIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      await this.bookingUseCase.cancelPendingBooking(id, user);
      return res.status(200).json({
        success: true,
        message: "Booking cancelled and removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicBookingsForAuditorium(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { auditoriumId } = req.params;
      const { startDate, endDate } = req.query;

      const validated = await getPublicBookingsSchema.validate({
        auditoriumId,
        startDate,
        endDate,
      }, {
        abortEarly: false,
      });

      const result = await this.bookingUseCase.getPublicBookingsForAuditorium(
        validated.auditoriumId,
        validated.startDate,
        validated.endDate,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async getPublicBookedSlots(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { auditoriumId, date } = req.query;
      if (!auditoriumId || !date) {
        return res.status(400).json({ success: false, message: "auditoriumId and date are required" });
      }
      const result = await this.bookingUseCase.getBookedSlotsForDate(
        String(auditoriumId),
        String(date),
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

