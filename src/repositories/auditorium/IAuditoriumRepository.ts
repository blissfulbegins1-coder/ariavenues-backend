import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import UserTokenDto from '../../domain/dtos/user/UserTokenDto';

export interface IAuditoriumRepository {
  create(data: CreateAuditoriumDTO): Promise<Auditorium>;
  listByOwner(user: UserTokenDto): Promise<Auditorium[]>;
}
