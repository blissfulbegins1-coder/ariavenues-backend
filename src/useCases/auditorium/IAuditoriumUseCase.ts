import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import UserTokenDto from '../../domain/dtos/user/UserTokenDto';

export interface IAuditoriumUseCase {
  createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium>;
  getOwnerAuditoriums(user: UserTokenDto): Promise<Auditorium[]>;
}
