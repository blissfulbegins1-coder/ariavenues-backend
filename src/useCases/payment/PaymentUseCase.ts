import mongoose from "mongoose";
import { Payment } from "../../domain/entities/Payment";
import { VerifyPaymentDTO } from "../../domain/dtos/payment/VerifyPaymentDTO";
import { IPaymentEngine } from "../../engines/payment/IPaymentEngine";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IRazorpayService } from "../../infrastructure/services/razorpay/IRazorpayService";
import { IPaymentUseCase, RazorpayOrderResult } from "./IPaymentUseCase";
import { ApiError } from "../../domain/errors/ApiError";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { IActivityEngine } from "../../engines/activity/IActivityEngine";
import { PaymentStatus } from "../../domain/enums/PaymentStatus";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { timeToMinutes } from "../../domain/functions/dateFunctions";
import UserRoles from "../../domain/enums/UserRole";
import { HttpStatus } from "../../domain/enums/HttpStatus";
import { logger } from "../../utils/logger";

type PaymentUseCaseConstructorParams = {
  paymentEngine: IPaymentEngine;
  bookingEngine: IBookingEngine;
  razorpayService: IRazorpayService;
  activityEngine: IActivityEngine;
};

export class PaymentUseCase implements IPaymentUseCase {
  private paymentEngine: IPaymentEngine;
  private bookingEngine: IBookingEngine;
  private razorpayService: IRazorpayService;
  private activityEngine: IActivityEngine;

  constructor({
    paymentEngine,
    bookingEngine,
    razorpayService,
    activityEngine,
  }: PaymentUseCaseConstructorParams) {
    this.paymentEngine = paymentEngine;
    this.bookingEngine = bookingEngine;
    this.razorpayService = razorpayService;
    this.activityEngine = activityEngine;
  }

  async createRazorpayOrder(
    bookingId: string,
    user: UserTokenDto,
  ): Promise<RazorpayOrderResult> {
    const booking = await this.bookingEngine.getBookingById(bookingId);
    if (!booking) {
      throw new ApiError("Booking details not found", HttpStatus.NOT_FOUND);
    }

    if (booking.userId !== user.id && booking.ownerId !== user.id && user.role !== UserRoles.OWNER) {
      throw new ApiError("Access denied. Unauthorized reservation owner", HttpStatus.FORBIDDEN);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new ApiError(
        "Cannot initiate payment for a cancelled booking",
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      booking.bookingStatus === BookingStatus.CONFIRMED ||
      booking.bookingStatus === BookingStatus.COMPLETED
    ) {
      throw new ApiError("This booking is already paid and confirmed", HttpStatus.BAD_REQUEST);
    }

    const existingBookings = await this.bookingEngine.getAllBookings({
      auditoriumId: new mongoose.Types.ObjectId(booking.auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      startDate: booking.startDate,
      _id: { $ne: new mongoose.Types.ObjectId(booking.id) } as any,
    });

    const nStart = timeToMinutes(booking.startTime ?? "");
    const nEnd = timeToMinutes(booking.endTime ?? "");

    for (const existing of existingBookings) {
      const eStart = timeToMinutes(existing.startTime ?? "");
      const eEnd = timeToMinutes(existing.endTime ?? "");
      if (nStart < eEnd && nEnd > eStart) {
        throw new ApiError(
          "The selected time slot is no longer available for booking",
          HttpStatus.CONFLICT,
        );
      }
    }

    const existingPayment = await this.paymentEngine.getPaymentByBookingId(
      booking.id,
    );

    if (existingPayment && existingPayment.paymentStatus === PaymentStatus.SUCCESS) {
      throw new ApiError(
        "Payment already completed successfully for this booking",
        HttpStatus.BAD_REQUEST
      );
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);
    const order = await this.razorpayService.createOrder(
      amountInPaise,
      booking.bookingNumber,
    );

    if (existingPayment) {
      await this.paymentEngine.updatePayment(existingPayment.id, {
        orderId: order.id,
        paymentStatus: PaymentStatus.CREATED,
      });
    } else {
      await this.paymentEngine.createPayment({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: "INR",
        gateway: "Razorpay",
        orderId: order.id,
        paymentStatus: PaymentStatus.CREATED,
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
      const paymentDoc = await this.paymentEngine.getPaymentByOrderId(data.orderId, session);

      if (!paymentDoc) {
        throw new ApiError("Payment record not found for this order ID", HttpStatus.NOT_FOUND);
      }

      if (paymentDoc.paymentStatus === PaymentStatus.SUCCESS) {
        throw new ApiError(
          "Payment signature verification has already succeeded",
          HttpStatus.BAD_REQUEST
        );
      }

      const bookingDoc = await this.bookingEngine.getBookingById(paymentDoc.bookingId, session);
      if (!bookingDoc) {
        throw new ApiError("Associated booking details not found", HttpStatus.NOT_FOUND);
      }

      if (bookingDoc.userId?.toString() !== user.id && bookingDoc.ownerId?.toString() !== user.id && user.role !== UserRoles.OWNER) {
        throw new ApiError(
          "Access denied. Unauthorized transaction owner",
          HttpStatus.FORBIDDEN
        );
      }

      if (bookingDoc.bookingStatus === BookingStatus.CANCELLED) {
        throw new ApiError(
          "Cannot complete payment for a cancelled booking",
          HttpStatus.BAD_REQUEST
        );
      }

      const isSignatureValid = this.razorpayService.verifySignature(
        data.orderId,
        data.paymentId,
        data.signature,
      );

      if (!isSignatureValid) {
        await this.paymentEngine.updatePayment(paymentDoc.id, {
          paymentStatus: PaymentStatus.FAILED,
        }, session);
        throw new ApiError("Razorpay signature validation failed", HttpStatus.BAD_REQUEST);
      }

      const updatedPayment = await this.paymentEngine.updatePayment(
        paymentDoc.id,
        {
          paymentStatus: PaymentStatus.SUCCESS,
          paymentId: data.paymentId,
          signature: data.signature,
          paymentMethod: data.paymentMethod,
          paidAt: new Date(),
        },
        session,
      );

      if (!updatedPayment) {
        throw new ApiError("Failed to update payment record", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await this.bookingEngine.updateBooking(
        bookingDoc.id,
        {
          bookingStatus: BookingStatus.CONFIRMED,
        },
        session,
      );

      // Log activities under the verification transaction session
      await this.activityEngine.createActivity({
        type: "BOOKING_CONFIRMED",
        title: "New Booking Confirmed",
        description: `Booking #${bookingDoc.bookingNumber} confirmed`,
        referenceId: bookingDoc.id,
        referenceType: "BOOKING",
        performedBy: user.id,
      }, session).catch((err) => logger.error("Failed to log booking confirmed activity:", err));

      await this.activityEngine.createActivity({
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        description: `Payment of ₹${bookingDoc.totalAmount.toLocaleString()} received for Booking #${bookingDoc.bookingNumber}`,
        referenceId: updatedPayment.id,
        referenceType: "PAYMENT",
        performedBy: user.id,
      }, session).catch((err) => logger.error("Failed to log payment received activity:", err));

      await session.commitTransaction();
      session.endSession();
      return updatedPayment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
