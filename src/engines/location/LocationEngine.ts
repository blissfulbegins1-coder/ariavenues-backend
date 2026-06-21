import { Location } from "../../domain/entities/Location";
import { ILocationRepository } from "../../repositories/location/ILocationRepository";
import { ILocationEngine } from "./ILocationEngine";

type LocationEngineConstructorParams = {
  locationRepository: ILocationRepository;
};

export class LocationEngine implements ILocationEngine {
  private locationRepository: ILocationRepository;

  constructor({ locationRepository }: LocationEngineConstructorParams) {
    this.locationRepository = locationRepository;
  }

  async getStates(): Promise<string[]> {
    return await this.locationRepository.getStates();
  }

  async getDistricts(state: string): Promise<string[]> {
    return await this.locationRepository.getDistricts(state);
  }

  async getCities(state: string, district: string): Promise<string[]> {
    return await this.locationRepository.getCities(state, district);
  }

  async getAll(): Promise<Location[]> {
    return await this.locationRepository.getAll();
  }
}
