import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../../domain/dtos/auditorium/UpdateAuditoriumDTO";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IAuditoriumUseCase } from "./IAuditoriumUseCase";
import { CloudinaryService } from "../../infrastructure/services/cloudinary/CloudinaryService";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

type AuditoriumUseCaseConstructorParams = {
  auditoriumEngine: IAuditoriumEngine;
  cloudinaryService: CloudinaryService;
};

export class AuditoriumUseCase implements IAuditoriumUseCase {
  private auditoriumEngine: IAuditoriumEngine;
  private cloudinaryService: CloudinaryService;

  constructor({
    auditoriumEngine,
    cloudinaryService,
  }: AuditoriumUseCaseConstructorParams) {
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

  async getPublicAuditoriums(): Promise<Auditorium[]> {
    return await this.auditoriumEngine.getPublicAuditoriums();
  }

  async getAuditoriumById(id: string): Promise<Auditorium | null> {
    return await this.auditoriumEngine.getAuditoriumById(id);
  }

  async updateAuditorium(
    id: string,
    user: UserTokenDto,
    data: UpdateAuditoriumDTO,
  ): Promise<Auditorium> {
    const venue = await this.auditoriumEngine.getAuditoriumById(id);
    if (!venue) {
      throw new Error("Auditorium not found");
    }
    if (venue.ownerId !== user.id) {
      throw new Error("Unauthorized to update this auditorium");
    }

    const { existingImages, newImages, ...rest } = data;
    let finalImages = venue.images;

    if (existingImages) {
      let newUrls: string[] = [];
      if (newImages && newImages.length > 0) {
        newUrls = await this.cloudinaryService.uploadMultiple(newImages);
      }

      let fileIdx = 0;
      finalImages = existingImages.map((imgUrl: string) => {
        if (imgUrl) return imgUrl;
        return newUrls[fileIdx++] || "";
      });
    }

    return await this.auditoriumEngine.updateAuditorium(id, {
      ...rest,
      images: finalImages,
    });
  }
}
