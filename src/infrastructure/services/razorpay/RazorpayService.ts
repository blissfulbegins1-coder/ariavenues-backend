import Razorpay from "razorpay";
import crypto from "crypto";
import { IRazorpayService } from "./IRazorpayService";

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export class RazorpayService implements IRazorpayService {
  private razorpayClient: Razorpay;
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID!;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET!;

    this.razorpayClient = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(
    amountInPaise: number,
    receipt: string,
  ): Promise<RazorpayOrderResponse> {
    try {
      const order = await this.razorpayClient.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receipt,
      });
      return order as RazorpayOrderResponse;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Razorpay API order creation failed";
      throw new Error(message);
    }
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return generatedSignature === signature;
  }

  getKeyId(): string {
    return this.keyId;
  }
}
