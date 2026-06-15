import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';

export interface IAuditoriumRepository {
  create(data: CreateAuditoriumDTO): Promise<Auditorium>;
  listByOwner(ownerId: string): Promise<Auditorium[]>;
}
