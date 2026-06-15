import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';

export interface IAuditoriumEngine {
  createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium>;
  getAuditoriumsByOwner(ownerId: string): Promise<Auditorium[]>;
}
