export interface UpdateAuditoriumDTO {
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  existingImages: string[];
  newImages?: Express.Multer.File[];
  status?: "pending" | "draft" | "maintenance" | "active" | "rejected";
}
