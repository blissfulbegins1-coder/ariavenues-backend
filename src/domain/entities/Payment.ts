import { PaymentStatus } from "../enums/PaymentStatus";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: "INR";
  gateway: "Razorpay";
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
