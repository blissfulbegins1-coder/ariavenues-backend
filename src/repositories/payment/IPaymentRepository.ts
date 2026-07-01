import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";

export type IPaymentRepository = {
  create(data: Partial<Payment>, session?: ClientSession): Promise<Payment>;
  findByOrderId(orderId: string, session?: ClientSession): Promise<Payment | null>;
  findByBookingId(bookingId: string, session?: ClientSession): Promise<Payment | null>;
  update(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null>;
}
