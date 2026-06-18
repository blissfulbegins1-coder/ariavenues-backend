import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { IAuditoriumRepository } from "../../repositories/auditorium/IAuditoriumRepository";
import { IAuditoriumEngine } from "./IAuditoriumEngine";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

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

  async getAuditoriumsByOwner(user: UserTokenDto): Promise<Auditorium[]> {
    return await this.auditoriumRepository.listByOwner(user);
  }

  async getPublicAuditoriums(): Promise<Auditorium[]> {
    return await this.auditoriumRepository.listPublic();
  }

  async getAuditoriumById(id: string): Promise<Auditorium | null> {
    return await this.auditoriumRepository.findById(id);
  }

  async updateAuditorium(
    id: string,
    data: Partial<Auditorium>,
  ): Promise<Auditorium> {
    return await this.auditoriumRepository.update(id, data);
  }

  async getAllAuditoriums(): Promise<Auditorium[]> {
    return await this.auditoriumRepository.listAll();
  }
}
