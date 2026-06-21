export interface UpdateAuditoriumDTO {
  name: string;
  description: string;
  address: string;
  state: string;
  district: string;
  city: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  existingImages: string[];
  newImages?: Express.Multer.File[];
  status?: "pending" | "draft" | "maintenance" | "active" | "rejected";
}
