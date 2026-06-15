import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import { IAuditoriumEngine } from '../../engines/auditorium/IAuditoriumEngine';
import { IAuditoriumUseCase } from './IAuditoriumUseCase';

type AuditoriumUseCaseConstructorParams = {
  auditoriumEngine: IAuditoriumEngine;
};

export class AuditoriumUseCase implements IAuditoriumUseCase {
  private auditoriumEngine: IAuditoriumEngine;

  constructor({ auditoriumEngine }: AuditoriumUseCaseConstructorParams) {
    this.auditoriumEngine = auditoriumEngine;
  }

  async createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium> {
    return await this.auditoriumEngine.createAuditorium(data);
  }

  async getOwnerAuditoriums(ownerId: string): Promise<Auditorium[]> {
    return await this.auditoriumEngine.getAuditoriumsByOwner(ownerId);
  }
}
