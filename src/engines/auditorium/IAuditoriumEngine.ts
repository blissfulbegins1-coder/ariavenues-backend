import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

export interface IAuditoriumEngine {
  createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium>;
  getAuditoriumsByOwner(user: UserTokenDto): Promise<Auditorium[]>;
  getPublicAuditoriums(): Promise<Auditorium[]>;
  getAuditoriumById(id: string): Promise<Auditorium | null>;
  updateAuditorium(id: string, data: Partial<Auditorium>): Promise<Auditorium>;
}
