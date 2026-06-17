import mongoose from "mongoose";
import { Payment } from "../../domain/entities/Payment";
import { VerifyPaymentDTO } from "../../domain/dtos/payment/VerifyPaymentDTO";
import { IPaymentEngine } from "../../engines/payment/IPaymentEngine";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { RazorpayService } from "../../infrastructure/services/razorpay/RazorpayService";
import { IPaymentUseCase, RazorpayOrderResult } from "./IPaymentUseCase";
import { AppError } from "../../domain/errors/AppError";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { PaymentModel } from "../../infrastructure/services/mongodb/models/payment/PaymentModel";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";
import { PaymentStatus } from "../../domain/enums/PaymentStatus";

type PaymentUseCaseConstructorParams = {
  paymentEngine: IPaymentEngine;
  bookingEngine: IBookingEngine;
};

export class PaymentUseCase implements IPaymentUseCase {
  private paymentEngine: IPaymentEngine;
  private bookingEngine: IBookingEngine;
  private razorpayService: RazorpayService;

  constructor({
    paymentEngine,
    bookingEngine,
  }: PaymentUseCaseConstructorParams) {
    this.paymentEngine = paymentEngine;
    this.bookingEngine = bookingEngine;
    this.razorpayService = new RazorpayService();
  }

  async createRazorpayOrder(
    bookingId: string,
    user: UserTokenDto,
  ): Promise<RazorpayOrderResult> {
    const booking = await this.bookingEngine.getBookingById(bookingId);
    if (!booking) {
      throw new AppError("Booking details not found", 404);
    }

    if (booking.userId !== user.id) {
      throw new AppError("Access denied. Unauthorized reservation owner", 403);
    }

    if (booking.bookingStatus === "CANCELLED") {
      throw new AppError(
        "Cannot initiate payment for a cancelled booking",
        400,
      );
    }

    if (
      booking.bookingStatus === "CONFIRMED" ||
      booking.bookingStatus === "COMPLETED"
    ) {
      throw new AppError("This booking is already paid and confirmed", 400);
    }

    // Availability Lock Check - double check if dates are still available
    const isAvailable = await this.bookingEngine.checkAvailability(
      booking.auditoriumId,
      booking.startDate,
      booking.endDate,
      booking.id,
    );
    if (!isAvailable) {
      throw new AppError(
        "The selected dates are no longer available for booking",
        409,
      );
    }

    // Check for duplicate payments
    const existingPayment = await this.paymentEngine.getPaymentByBookingId(
      booking.id,
    );
    if (existingPayment && existingPayment.paymentStatus === "SUCCESS") {
      throw new AppError(
        "Payment already completed successfully for this booking",
        400,
      );
    }

    // Create Razorpay Order (amount must be in paise)
    const amountInPaise = Math.round(booking.totalAmount * 100);
    const order = await this.razorpayService.createOrder(
      amountInPaise,
      booking.bookingNumber,
    );

    // Save/Update Payment Record
    if (existingPayment) {
      await this.paymentEngine.updatePayment(existingPayment.id, {
        orderId: order.id,
        paymentStatus: "CREATED",
      });
    } else {
      await this.paymentEngine.createPayment({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: "INR",
        gateway: "Razorpay",
        orderId: order.id,
        paymentStatus: "CREATED",
      });
    }

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: this.razorpayService.getKeyId(),
      bookingNumber: booking.bookingNumber,
    };
  }

  async verifyPayment(
    data: VerifyPaymentDTO,
    user: UserTokenDto,
  ): Promise<Payment> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const paymentDoc = await PaymentModel.findOne({
        orderId: data.orderId,
      }).session(session);
      if (!paymentDoc) {
        throw new AppError("Payment record not found for this order ID", 404);
      }

      if (paymentDoc.paymentStatus === "SUCCESS") {
        throw new AppError(
          "Payment signature verification has already succeeded",
          400,
        );
      }

      const bookingDoc = await BookingModel.findById(
        paymentDoc.bookingId,
      ).session(session);
      if (!bookingDoc) {
        throw new AppError("Associated booking details not found", 404);
      }

      if (bookingDoc.userId.toString() !== user.id) {
        throw new AppError(
          "Access denied. Unauthorized transaction owner",
          403,
        );
      }

      if (bookingDoc.bookingStatus === "CANCELLED") {
        throw new AppError(
          "Cannot complete payment for a cancelled booking",
          400,
        );
      }

      // Verify Signature using Razorpay Key Secret
      const isSignatureValid = this.razorpayService.verifySignature(
        data.orderId,
        data.paymentId,
        data.signature,
      );

      if (!isSignatureValid) {
        // Outside the transaction, record the failure so it persists
        await PaymentModel.findByIdAndUpdate(paymentDoc._id, {
          paymentStatus: "FAILED",
        });
        throw new AppError("Razorpay signature validation failed", 400);
      }

      // Update payment record inside transaction
      paymentDoc.paymentStatus = "SUCCESS";
      paymentDoc.paymentId = data.paymentId;
      paymentDoc.signature = data.signature;
      if (data.paymentMethod) {
        paymentDoc.paymentMethod = data.paymentMethod;
      }
      paymentDoc.paidAt = new Date();
      await paymentDoc.save({ session });

      // Update booking status inside transaction
      bookingDoc.bookingStatus = "CONFIRMED";
      await bookingDoc.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return {
        id: paymentDoc._id.toString(),
        bookingId: paymentDoc.bookingId.toString(),
        amount: paymentDoc.amount,
        currency: paymentDoc.currency as "INR",
        gateway: paymentDoc.gateway as "Razorpay",
        orderId: paymentDoc.orderId,
        paymentId: paymentDoc.paymentId,
        signature: paymentDoc.signature,
        paymentMethod: paymentDoc.paymentMethod,
        paymentStatus: paymentDoc.paymentStatus as PaymentStatus,
        paidAt: paymentDoc.paidAt,
        createdAt: paymentDoc.createdAt,
        updatedAt: paymentDoc.updatedAt,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
