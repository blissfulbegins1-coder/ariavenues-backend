import { Request, Response, NextFunction } from "express";
import { IPaymentUseCase } from "../useCases/payment/IPaymentUseCase";
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
} from "../infrastructure/validation/payment/PaymentValidationSchemas";
import { VerifyPaymentDTO } from "../domain/dtos/payment/VerifyPaymentDTO";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";

type PaymentControllerConstructorParams = {
  paymentUseCase: IPaymentUseCase;
};

export class PaymentController {
  private paymentUseCase: IPaymentUseCase;

  constructor({ paymentUseCase }: PaymentControllerConstructorParams) {
    this.paymentUseCase = paymentUseCase;
  }

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedData = await createRazorpayOrderSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.paymentUseCase.createRazorpayOrder(
        validatedData.bookingId,
        user,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Razorpay order created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedData = await verifyPaymentSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.paymentUseCase.verifyPayment(
        validatedData as VerifyPaymentDTO,
        user,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Payment verified successfully, booking confirmed",
      });
    } catch (error) {
      next(error);
    }
  }
}
