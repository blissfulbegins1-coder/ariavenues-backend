import mongoose, { QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { Payment } from "../../domain/entities/Payment";
import { VerifyPaymentDTO } from "../../domain/dtos/payment/VerifyPaymentDTO";
import { IPaymentEngine } from "../../engines/payment/IPaymentEngine";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { IRazorpayService } from "../../infrastructure/services/razorpay/IRazorpayService";
import { IPaymentUseCase, RazorpayOrderResult } from "./IPaymentUseCase";
import { ApiError } from "../../domain/errors/ApiError";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { PaymentStatus } from "../../domain/enums/PaymentStatus";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { parseDDMMYYYY } from "../../utils/dateUtils";

type PaymentUseCaseConstructorParams = {
  paymentEngine: IPaymentEngine;
  bookingEngine: IBookingEngine;
  razorpayService: IRazorpayService;
};

export class PaymentUseCase implements IPaymentUseCase {
  private paymentEngine: IPaymentEngine;
  private bookingEngine: IBookingEngine;
  private razorpayService: IRazorpayService;

  constructor({
    paymentEngine,
    bookingEngine,
    razorpayService
  }: PaymentUseCaseConstructorParams) {
    this.paymentEngine = paymentEngine;
    this.bookingEngine = bookingEngine;
    this.razorpayService = razorpayService;
  }

  async createRazorpayOrder(
    bookingId: string,
    user: UserTokenDto,
  ): Promise<RazorpayOrderResult> {
    const booking = await this.bookingEngine.getBookingById(bookingId);
    if (!booking) {
      throw new ApiError("Booking details not found");
    }

    if (booking.userId !== user.id) {
      throw new ApiError("Access denied. Unauthorized reservation owner");
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new ApiError(
        "Cannot initiate payment for a cancelled booking",
      );
    }

    if (
      booking.bookingStatus === BookingStatus.CONFIRMED ||
      booking.bookingStatus === BookingStatus.COMPLETED
    ) {
      throw new ApiError("This booking is already paid and confirmed");
    }

    const availabilityFilter: QueryFilter<Booking> = {
      auditoriumId: new mongoose.Types.ObjectId(booking.auditoriumId) as any,
      bookingStatus: {
        $in: [
          BookingStatus.PENDING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
        ],
      },
      $expr: {
        $and: [
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              parseDDMMYYYY(booking.endDate),
            ],
          },
          {
            $gte: [
              { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
              parseDDMMYYYY(booking.startDate),
            ],
          },
        ],
      },
      _id: { $ne: new mongoose.Types.ObjectId(booking.id) } as any,
    };

    const isAvailable = await this.bookingEngine.checkAvailability(availabilityFilter);
    if (!isAvailable) {
      throw new ApiError(
        "The selected dates are no longer available for booking",
      );
    }

    const existingPayment = await this.paymentEngine.getPaymentByBookingId(
      booking.id,
    );

    if (existingPayment && existingPayment.paymentStatus === PaymentStatus.SUCCESS) {
      throw new ApiError(
        "Payment already completed successfully for this booking",
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
        throw new ApiError("Payment record not found for this order ID");
      }

      if (paymentDoc.paymentStatus === PaymentStatus.SUCCESS) {
        throw new ApiError(
          "Payment signature verification has already succeeded",
        );
      }

      const bookingDoc = await this.bookingEngine.getBookingById(paymentDoc.bookingId, session);
      if (!bookingDoc) {
        throw new ApiError("Associated booking details not found");
      }

      if (bookingDoc.userId.toString() !== user.id) {
        throw new ApiError(
          "Access denied. Unauthorized transaction owner",
        );
      }

      if (bookingDoc.bookingStatus === BookingStatus.CANCELLED) {
        throw new ApiError(
          "Cannot complete payment for a cancelled booking",
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
        throw new ApiError("Razorpay signature validation failed");
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
        throw new ApiError("Failed to update payment record");
      }

      await this.bookingEngine.updateBooking(
        bookingDoc.id,
        {
          bookingStatus: BookingStatus.CONFIRMED,
        },
        session,
      );

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
