import { RazorpayOrderResponse } from "./RazorpayTypes";

export type IRazorpayService = {
  createOrder(
    amountInPaise: number,
    receipt: string,
  ): Promise<RazorpayOrderResponse>;
  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean;
  getKeyId(): string;
}
