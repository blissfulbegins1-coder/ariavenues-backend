export interface Activity {
  id: string;
  type:
    | "USER_REGISTERED"
    | "OWNER_REGISTERED"
    | "AUDITORIUM_SUBMITTED"
    | "BOOKING_CONFIRMED"
    | "PAYMENT_RECEIVED";
  title: string;
  description: string;
  referenceId: string;
  referenceType: "USER" | "OWNER" | "ONWER" | "AUDITORIUM" | "BOOKING" | "PAYMENT";
  performedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
