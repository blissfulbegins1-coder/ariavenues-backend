import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";

export type IPaymentEngine = {
  createPayment(
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment>;
  getPaymentByOrderId(orderId: string, session?: ClientSession): Promise<Payment | null>;
  getPaymentByBookingId(bookingId: string, session?: ClientSession): Promise<Payment | null>;
  updatePayment(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null>;
}
