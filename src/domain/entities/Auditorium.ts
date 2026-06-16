export interface Auditorium {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number; // INR
  amenities: string[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  status: "draft" | "maintenance" | "active";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
