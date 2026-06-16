import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import { IAuditoriumEngine } from '../../engines/auditorium/IAuditoriumEngine';
import { IAuditoriumUseCase } from './IAuditoriumUseCase';
import { CloudinaryService } from '../../infrastructure/services/cloudinary/CloudinaryService';
import UserTokenDto from '../../domain/dtos/user/UserTokenDto';

type AuditoriumUseCaseConstructorParams = {
  auditoriumEngine: IAuditoriumEngine;
  cloudinaryService: CloudinaryService;
};

export class AuditoriumUseCase implements IAuditoriumUseCase {
  private auditoriumEngine: IAuditoriumEngine;
  private cloudinaryService: CloudinaryService;

  constructor({ auditoriumEngine, cloudinaryService }: AuditoriumUseCaseConstructorParams) {
    this.auditoriumEngine = auditoriumEngine;
    this.cloudinaryService = cloudinaryService;
  }

  async createAuditorium(data: CreateAuditoriumDTO): Promise<Auditorium> {
    const files = data.images as Express.Multer.File[];
    const imageUrls = await this.cloudinaryService.uploadMultiple(files);

    return await this.auditoriumEngine.createAuditorium({
      ...data,
      images: imageUrls,
    });
  }

  async getOwnerAuditoriums(user: UserTokenDto): Promise<Auditorium[]> {
    return await this.auditoriumEngine.getAuditoriumsByOwner(user);
  }
}
