export type UpdateAuditoriumDTO = {
  name: string;
  description: string;
  address: string;
  state: string;
  district: string;
  city: string;
  capacity: number;
  dayRate: number;
  existingImages: string[];
  newImages?: Express.Multer.File[];
  status?: string;
}
