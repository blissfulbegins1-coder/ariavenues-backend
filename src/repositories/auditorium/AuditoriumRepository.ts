import { Auditorium } from '../../domain/entities/Auditorium';
import { CreateAuditoriumDTO } from '../../domain/dtos/auditorium/CreateAuditoriumDTO';
import { AuditoriumModel } from '../../infrastructure/services/mongodb/models/auditorium/AuditoriumModel';
import { IAuditoriumRepository } from './IAuditoriumRepository';
import UserTokenDto from '../../domain/dtos/user/UserTokenDto';

export class AuditoriumRepository implements IAuditoriumRepository {
  async create(data: CreateAuditoriumDTO): Promise<Auditorium> {
    const { user, ...rest } = data;
    const auditorium = new AuditoriumModel({
      ...rest,
      ownerId: user.id,
      averageRating: 0,
      totalReviews: 0,
      totalBookings: 0,
      isActive: true,
    });
    await auditorium.save();

    const obj = auditorium.toObject();
    return {
      id: obj._id.toString(),
      ownerId: obj.ownerId.toString(),
      name: obj.name,
      description: obj.description,
      address: obj.address,
      capacity: obj.capacity,
      dayRate: obj.dayRate,
      amenities: obj.amenities,
      images: obj.images,
      averageRating: obj.averageRating,
      totalReviews: obj.totalReviews,
      totalBookings: obj.totalBookings,
      status: obj.status,
      isActive: obj.isActive,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Auditorium;
  }

  async listByOwner(user: UserTokenDto): Promise<Auditorium[]> {
    const items = await AuditoriumModel.find({ ownerId: user.id });
    return items.map((item) => {
      const obj = item.toObject();
      return {
        id: obj._id.toString(),
        ownerId: obj.ownerId.toString(),
        name: obj.name,
        description: obj.description,
        address: obj.address,
        capacity: obj.capacity,
        dayRate: obj.dayRate,
        amenities: obj.amenities,
        images: obj.images,
        averageRating: obj.averageRating,
        totalReviews: obj.totalReviews,
        totalBookings: obj.totalBookings,
        status: obj.status,
        isActive: obj.isActive,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      } as Auditorium;
    });
  }
}
