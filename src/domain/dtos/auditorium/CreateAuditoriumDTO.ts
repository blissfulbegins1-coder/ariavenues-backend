import UserTokenDto from "../user/UserTokenDto";

export interface CreateAuditoriumDTO {
  user: UserTokenDto;
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number; // INR
  amenities: string[];
  images: Express.Multer.File[] | string[];
  status?: "pending" | "draft" | "maintenance" | "active" | "rejected";
}
