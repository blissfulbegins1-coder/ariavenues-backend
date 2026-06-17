import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";
import { IPaymentRepository } from "../../repositories/payment/IPaymentRepository";
import { IPaymentEngine } from "./IPaymentEngine";

type PaymentEngineConstructorParams = {
  paymentRepository: IPaymentRepository;
};

export class PaymentEngine implements IPaymentEngine {
  private paymentRepository: IPaymentRepository;

  constructor({ paymentRepository }: PaymentEngineConstructorParams) {
    this.paymentRepository = paymentRepository;
  }

  async createPayment(
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment> {
    return await this.paymentRepository.create(data, session);
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return await this.paymentRepository.findByOrderId(orderId);
  }

  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    return await this.paymentRepository.findByBookingId(bookingId);
  }

  async updatePayment(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null> {
    return await this.paymentRepository.update(id, data, session);
  }
}
