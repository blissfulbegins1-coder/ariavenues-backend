import { Auditorium } from "../../domain/entities/Auditorium";
import { CreateAuditoriumDTO } from "../../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../../domain/dtos/auditorium/UpdateAuditoriumDTO";
import { GetPublicAuditoriumsDTO } from "../../domain/dtos/auditorium/GetPublicAuditoriumsDTO";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IBookingEngine } from "../../engines/booking/IBookingEngine";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { IAuditoriumUseCase } from "./IAuditoriumUseCase";
import { CloudinaryService } from "../../infrastructure/services/cloudinary/CloudinaryService";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { ApiError } from "../../domain/errors/ApiError";
import { QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { IActivityEngine } from "../../engines/activity/IActivityEngine";

type AuditoriumUseCaseConstructorParams = {
  auditoriumEngine: IAuditoriumEngine;
  bookingEngine: IBookingEngine;
  cloudinaryService: CloudinaryService;
  activityEngine: IActivityEngine;
};

export class AuditoriumUseCase implements IAuditoriumUseCase {
  private auditoriumEngine: IAuditoriumEngine;
  private bookingEngine: IBookingEngine;
  private cloudinaryService: CloudinaryService;
  private activityEngine: IActivityEngine;

  constructor({
    auditoriumEngine,
    bookingEngine,
    cloudinaryService,
    activityEngine,
  }: AuditoriumUseCaseConstructorParams) {
    this.auditoriumEngine = auditoriumEngine;
    this.bookingEngine = bookingEngine;
    this.cloudinaryService = cloudinaryService;
    this.activityEngine = activityEngine;
  }

  async createAuditorium(data: CreateAuditoriumDTO): Promise<boolean> {
    const files = data.images as Express.Multer.File[];
    const imageUrls = await this.cloudinaryService.uploadMultiple(files);

    const auditorium = await this.auditoriumEngine.createAuditorium({
      ...data,
      images: imageUrls,
    });

    await this.activityEngine.createActivity({
      type: "AUDITORIUM_SUBMITTED",
      title: "New Auditorium Submission",
      description: `${auditorium.name} (Pending Approval)`,
      referenceId: auditorium.id,
      referenceType: "AUDITORIUM",
      performedBy: data.user.id,
    }).catch((err) => console.error("Failed to log auditorium submission activity:", err));

    return true;
  }


  async getOwnerAuditoriums(user: UserTokenDto): Promise<Auditorium[]> {
    return await this.auditoriumEngine.getAuditoriumsByOwner(user);
  }

  async getPublicAuditoriums(filters?: GetPublicAuditoriumsDTO): Promise<Auditorium[]> {
    const query: QueryFilter<Auditorium> = {};

    if (filters) {
      if (filters.destination) {
        const terms = filters.destination
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean);

        if (terms.length > 0) {
          query.$and = terms.map((term) => {
            const termRegex = new RegExp(term, "i");
            return {
              $or: [
                { city: termRegex },
                { district: termRegex },
                { state: termRegex },
              ],
            };
          });
        }
      }

      if (filters.capacity !== undefined && filters.capacity !== null) {
        query.capacity = { $gte: filters.capacity };
      }

      if (
        (filters.minPrice !== undefined && filters.minPrice !== null) ||
        (filters.maxPrice !== undefined && filters.maxPrice !== null)
      ) {
        query.dayRate = {};
        if (filters.minPrice !== undefined && filters.minPrice !== null) {
          query.dayRate.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
          query.dayRate.$lte = filters.maxPrice;
        }
      }

      let excludeIds: string[] = [];
      if (filters.startDate && filters.endDate) {
        const parsedStart = filters.startDate;
        const parsedEnd = filters.endDate;

        const overlappingBookings = await this.bookingEngine.getAllBookings({
          bookingStatus: { $ne: BookingStatus.CANCELLED },
          $expr: {
            $and: [
              {
                $lte: [
                  { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
                  parsedEnd,
                ],
              },
              {
                $gte: [
                  { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
                  parsedStart,
                ],
              },
            ],
          },
        } as QueryFilter<Booking>);
        excludeIds = overlappingBookings.map((b) => b.auditoriumId.toString());
      }

      if (filters.excludeIds && filters.excludeIds.length > 0) {
        excludeIds = [...excludeIds, ...filters.excludeIds];
      }

      if (excludeIds.length > 0) {
        query._id = { $nin: excludeIds };
      }
    }

    return await this.auditoriumEngine.getPublicAuditoriums(query);
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
      throw new ApiError("Auditorium not found");
    }
    if (venue.ownerId !== user.id) {
      throw new ApiError("Unauthorized to update this auditorium");
    }
    if (venue.status === "pending") {
      throw new ApiError("Cannot edit a venue that is pending approval");
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
