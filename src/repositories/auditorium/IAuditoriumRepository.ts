import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import UserTokenDto from '../../domain/dtos/user/UserTokenDto';

export interface IAuditoriumRepository {
  create(data: CreateAuditoriumDTO): Promise<Auditorium>;
  listByOwner(user: UserTokenDto): Promise<Auditorium[]>;
  listPublic(): Promise<Auditorium[]>;
  findById(id: string): Promise<Auditorium | null>;
  update(id: string, data: Partial<Auditorium>): Promise<Auditorium>;
}
