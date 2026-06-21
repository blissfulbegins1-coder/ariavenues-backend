import { Location } from "../../domain/entities/Location";
import { ILocationEngine } from "../../engines/location/ILocationEngine";
import { ILocationUseCase } from "./ILocationUseCase";

type LocationUseCaseConstructorParams = {
  locationEngine: ILocationEngine;
};

export class LocationUseCase implements ILocationUseCase {
  private locationEngine: ILocationEngine;

  constructor({ locationEngine }: LocationUseCaseConstructorParams) {
    this.locationEngine = locationEngine;
  }

  async getStates(): Promise<string[]> {
    return await this.locationEngine.getStates();
  }

  async getDistricts(state: string): Promise<string[]> {
    return await this.locationEngine.getDistricts(state);
  }

  async getCities(state: string, district: string): Promise<string[]> {
    return await this.locationEngine.getCities(state, district);
  }

  async getAll(): Promise<Location[]> {
    return await this.locationEngine.getAll();
  }
}
