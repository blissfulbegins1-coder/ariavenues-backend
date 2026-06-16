export interface UpdateAuditoriumDTO {
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  existingImages: string[];
  newImages?: Express.Multer.File[];
  status?: "draft" | "maintenance" | "active";
}
