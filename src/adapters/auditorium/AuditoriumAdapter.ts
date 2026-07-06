import { Auditorium } from "../../domain/entities/Auditorium";
import { PublicAuditoriumDTO } from "../../domain/dtos/auditorium/PublicAuditoriumDTO";
import { IAuditoriumAdapter } from "./IAuditoriumAdapter";

export class AuditoriumAdapter implements IAuditoriumAdapter {
  private maskedName(id: string): string {
    const suffix = id.slice(-4).toUpperCase();
    return `Venue #${suffix}`;
  }

  private readonly maskedAddress = "Address revealed after booking";

  toPublicDTO(auditorium: Auditorium): PublicAuditoriumDTO {
    return {
      id: auditorium.id,
      name: this.maskedName(auditorium.id),
      address: this.maskedAddress,
      description: auditorium.description,
      state: auditorium.state,
      district: auditorium.district,
      city: auditorium.city,
      capacity: auditorium.capacity,
      dayRate: auditorium.dayRate,
      amenities: auditorium.amenities,
      images: auditorium.images,
      averageRating: auditorium.averageRating,
      totalReviews: auditorium.totalReviews,
      status: auditorium.status,
      adminAdvance: auditorium.adminAdvance ?? 0,
      auditoriumAdvance: auditorium.auditoriumAdvance ?? 0,
      approved: auditorium.approved,
    };
  }

  toPublicDTOList(auditoriums: Auditorium[]): PublicAuditoriumDTO[] {
    return auditoriums.map((a) => this.toPublicDTO(a));
  }
}
