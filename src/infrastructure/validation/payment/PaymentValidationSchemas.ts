import * as yup from "yup";

export const createRazorpayOrderSchema = yup.object().shape({
  bookingId: yup.string().required("Booking ID is required").trim(),
});

export const verifyPaymentSchema = yup.object().shape({
  orderId: yup.string().required("Razorpay Order ID is required").trim(),
  paymentId: yup.string().required("Razorpay Payment ID is required").trim(),
  signature: yup.string().required("Razorpay Signature is required").trim(),
  paymentMethod: yup.string().optional().trim(),
});
