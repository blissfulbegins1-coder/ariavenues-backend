import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';

export interface IAuditoriumUseCase {
  createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium>;
  getOwnerAuditoriums(ownerId: string): Promise<Auditorium[]>;
}
