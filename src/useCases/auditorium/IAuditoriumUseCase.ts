import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../../domain/dtos/auditorium/UpdateAuditoriumDTO";
import { GetPublicAuditoriumsDTO } from "../../domain/dtos/auditorium/GetPublicAuditoriumsDTO";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { AuditoriumFilters, PaginatedAuditoriumsResponse } from "../../domain/dtos/auditorium/AuditoriumDto";

export interface IAuditoriumUseCase {
  createAuditorium(data: CreateAuditoriumDTO): Promise<boolean>;
  getOwnerAuditoriums(user: UserTokenDto, filters?: AuditoriumFilters): Promise<PaginatedAuditoriumsResponse>;
  getPublicAuditoriums(filters?: GetPublicAuditoriumsDTO): Promise<Auditorium[]>;
  getAuditoriumById(id: string): Promise<Auditorium | null>;
  updateAuditorium(
    id: string,
    user: UserTokenDto,
    data: UpdateAuditoriumDTO,
  ): Promise<Auditorium>;
}
