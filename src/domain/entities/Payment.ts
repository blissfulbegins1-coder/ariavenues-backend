import { PaymentStatus } from "../enums/PaymentStatus";

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  gateway: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
