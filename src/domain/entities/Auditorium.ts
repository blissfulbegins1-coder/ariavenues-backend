export interface Auditorium {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  state: string;
  district: string;
  city: string;
  capacity: number;
  dayRate: number; // INR
  amenities: string[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  status: "pending" | "draft" | "maintenance" | "active" | "rejected" | "blocked";
  approved: boolean;
  adminAdvance?: number;
  auditoriumAdvance?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
