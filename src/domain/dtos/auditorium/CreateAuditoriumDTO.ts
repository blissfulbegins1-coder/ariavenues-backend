import { AuditoriumStatus } from "../../enums/AuditoriumStatus";
import UserTokenDto from "../user/UserTokenDto";

export type CreateAuditoriumDTO = {
  user: UserTokenDto;
  name: string;
  description: string;
  address: string;
  state: string;
  district: string;
  city: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  images: Express.Multer.File[] | string[];
  status?: AuditoriumStatus;
}
