export type VerifyPaymentDTO = {
  orderId: string;
  paymentId: string;
  signature: string;
  paymentMethod?: string;
}
