import { AuditoriumStatus } from "../../enums/AuditoriumStatus";
import UserTokenDto from "../user/UserTokenDto";

export interface CreateAuditoriumDTO {
  user: UserTokenDto;
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  images: Express.Multer.File[] | string[];
  status?: AuditoriumStatus;
}
