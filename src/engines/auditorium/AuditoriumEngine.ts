import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import { IAuditoriumRepository } from '../../repositories/auditorium/IAuditoriumRepository';
import { IAuditoriumEngine } from './IAuditoriumEngine';

type AuditoriumEngineConstructorParams = {
  auditoriumRepository: IAuditoriumRepository;
};

export class AuditoriumEngine implements IAuditoriumEngine {
  private auditoriumRepository: IAuditoriumRepository;

  constructor({ auditoriumRepository }: AuditoriumEngineConstructorParams) {
    this.auditoriumRepository = auditoriumRepository;
  }

  async createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium> {
    return await this.auditoriumRepository.create(data);
  }

  async getAuditoriumsByOwner(ownerId: string): Promise<Auditorium[]> {
    return await this.auditoriumRepository.listByOwner(ownerId);
  }
}
