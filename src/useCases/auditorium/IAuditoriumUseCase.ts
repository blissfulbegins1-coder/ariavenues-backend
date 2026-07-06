import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../../domain/dtos/auditorium/UpdateAuditoriumDTO";
import { GetPublicAuditoriumsDTO } from "../../domain/dtos/auditorium/GetPublicAuditoriumsDTO";
import { PaginatedPublicAuditoriumsDTO, PublicAuditoriumDTO } from "../../domain/dtos/auditorium/PublicAuditoriumDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { AuditoriumFilters, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";

export type IAuditoriumUseCase = {
  createAuditorium(data: CreateAuditoriumDTO): Promise<boolean>;
  getOwnerAuditoriums(user: UserTokenDto, filters?: AuditoriumFilters): Promise<PaginatedAuditoriumsResponse>;
  getPublicAuditoriums(filters?: GetPublicAuditoriumsDTO): Promise<PaginatedPublicAuditoriumsDTO>;
  getPublicAuditoriumById(id: string): Promise<PublicAuditoriumDTO | null>;
  getAuditoriumById(id: string): Promise<Auditorium | null>;
  getBookedAuditoriumDetails(id: string, user: UserTokenDto): Promise<Auditorium | null>;
  updateAuditorium(
    id: string,
    user: UserTokenDto,
    data: UpdateAuditoriumDTO,
  ): Promise<Auditorium>;
}
