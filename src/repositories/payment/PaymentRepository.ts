import { ClientSession } from "mongoose";
import { Payment } from "../../domain/entities/Payment";
import { PaymentModel } from "../../infrastructure/services/mongodb/models/payment/PaymentModel";
import { IPaymentRepository } from "./IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  private toEntity(doc: any): Payment {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      bookingId: obj.bookingId.toString(),
      amount: obj.amount,
      currency: obj.currency,
      gateway: obj.gateway,
      orderId: obj.orderId,
      paymentId: obj.paymentId,
      signature: obj.signature,
      paymentMethod: obj.paymentMethod,
      paymentStatus: obj.paymentStatus,
      paidAt: obj.paidAt,
      isActive: obj.isActive ?? true,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  async create(
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment> {
    const payment = new PaymentModel(data);
    await payment.save({ session });
    return this.toEntity(payment);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ orderId, isActive: true });
    if (!payment) return null;
    return this.toEntity(payment);
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    const payment = await PaymentModel.findOne({ bookingId, isActive: true });
    if (!payment) return null;
    return this.toEntity(payment);
  }

  async update(
    id: string,
    data: Partial<Payment>,
    session?: ClientSession,
  ): Promise<Payment | null> {
    const payment = await PaymentModel.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      {
        new: true,
        session,
      },
    );
    if (!payment) return null;
    return this.toEntity(payment);
  }
}
