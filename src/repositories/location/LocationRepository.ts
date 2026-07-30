import { Location } from "../../domain/entities/Location";
import { LocationModel } from "../../infrastructure/services/mongodb/models/location/LocationModel";
import { ILocationRepository } from "./ILocationRepository";

export class LocationRepository implements ILocationRepository {
  private toEntity(doc: { toObject?: () => Record<string, any> } & Record<string, any>): Location {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      city: obj.city,
      district: obj.district,
      state: obj.state,
      country: obj.country,
    };
  }

  async getStates(): Promise<string[]> {
    const states = await LocationModel.distinct("state");
    return states.filter(Boolean).sort();
  }

  async getDistricts(state: string): Promise<string[]> {
    const districts = await LocationModel.distinct("district", {
      state: { $regex: new RegExp(`^${state.trim()}$`, "i") },
    });
    return districts.filter(Boolean).sort();
  }

  async getCities(state: string, district: string): Promise<string[]> {
    const cities = await LocationModel.distinct("city", {
      state: { $regex: new RegExp(`^${state.trim()}$`, "i") },
      district: { $regex: new RegExp(`^${district.trim()}$`, "i") },
    });
    return cities.filter(Boolean).sort();
  }

  async getAll(): Promise<Location[]> {
    const docs = await LocationModel.find().sort({ state: 1, district: 1, city: 1 });
    return docs.map((doc) => this.toEntity(doc));
  }
}
