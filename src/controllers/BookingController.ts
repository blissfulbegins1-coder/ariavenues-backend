import { Request, Response, NextFunction } from "express";
import { IBookingUseCase } from "../useCases/booking/IBookingUseCase";
import {
  createBookingSchema,
  bookingIdParamSchema,
} from "../infrastructure/validation/booking/BookingValidationSchemas";
import { CreateBookingDTO } from "../domain/dtos/booking/CreateBookingDTO";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";

type BookingControllerConstructorParams = {
  bookingUseCase: IBookingUseCase;
};

export class BookingController {
  private bookingUseCase: IBookingUseCase;

  constructor({ bookingUseCase }: BookingControllerConstructorParams) {
    this.bookingUseCase = bookingUseCase;
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedData = await createBookingSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.bookingUseCase.createBooking(
        validatedData as CreateBookingDTO,
        user,
      );

      return res.status(201).json({
        success: true,
        data: result,
        message: "Booking created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerBookings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const result = await this.bookingUseCase.getCustomerBookings(user);
      return res.status(200).json({
        success: true,
        data: result,
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
      const result = await this.bookingUseCase.getOwnerBookings(user);
      return res.status(200).json({
        success: true,
        data: result,
      });
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
}

