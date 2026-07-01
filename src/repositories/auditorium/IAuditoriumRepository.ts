import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { QueryFilter } from "mongoose";
import { AuditoriumDbQuery, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";

export type IAuditoriumRepository = {
  create(data: CreateAuditoriumDTO): Promise<Auditorium>;
  listByOwner(user: UserTokenDto): Promise<Auditorium[]>;
  listPublic(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
  findById(id: string): Promise<Auditorium | null>;
  update(id: string, data: Partial<Auditorium>): Promise<Auditorium>;
  listAll(filter?: QueryFilter<Auditorium>): Promise<Auditorium[]>;
  getAuditoriums(dbQuery: AuditoriumDbQuery): Promise<PaginatedAuditoriumsResponse>;
}
