import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { QueryFilter } from "mongoose";

export interface IAuditoriumEngine {
  createAuditorium(data: CreateAuditoriumDTO): Promise<boolean>;
  getAuditoriumsByOwner(user: UserTokenDto): Promise<Auditorium[]>;
  getPublicAuditoriums(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
  getAuditoriumById(id: string): Promise<Auditorium | null>;
  updateAuditorium(id: string, data: Partial<Auditorium>): Promise<Auditorium>;
  getAllAuditoriums(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
}
