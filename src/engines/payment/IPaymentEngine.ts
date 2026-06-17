import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";

export interface IPaymentEngine {
  createPayment(
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment>;
  getPaymentByOrderId(orderId: string): Promise<Payment | null>;
  getPaymentByBookingId(bookingId: string): Promise<Payment | null>;
  updatePayment(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null>;
}
