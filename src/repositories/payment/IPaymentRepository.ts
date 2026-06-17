import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";

export interface IPaymentRepository {
  create(data: Partial<Payment>, session?: ClientSession): Promise<Payment>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  findByBookingId(bookingId: string): Promise<Payment | null>;
  update(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null>;
}
