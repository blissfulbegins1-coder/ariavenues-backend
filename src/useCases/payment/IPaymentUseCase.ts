import { Payment } from "../../domain/entities/Payment";
import { VerifyPaymentDTO } from "../../domain/dtos/payment/VerifyPaymentDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

export type RazorpayOrderResult = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingNumber: string;
}

export type IPaymentUseCase = {
  createRazorpayOrder(
    bookingId: string,
    user: UserTokenDto,
  ): Promise<RazorpayOrderResult>;
  verifyPayment(data: VerifyPaymentDTO, user: UserTokenDto): Promise<Payment>;
}
