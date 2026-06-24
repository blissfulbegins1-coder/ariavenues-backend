import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { QueryFilter } from "mongoose";

export interface IAuditoriumRepository {
  create(data: CreateAuditoriumDTO): Promise<boolean>;
  listByOwner(user: UserTokenDto): Promise<Auditorium[]>;
  listPublic(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
  findById(id: string): Promise<Auditorium | null>;
  update(id: string, data: Partial<Auditorium>): Promise<Auditorium>;
  listAll(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
}
