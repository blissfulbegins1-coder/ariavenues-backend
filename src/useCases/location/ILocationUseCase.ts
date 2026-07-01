import { Location } from "../../domain/entities/Location";

export type ILocationUseCase = {
  getStates(): Promise<string[]>;
  getDistricts(state: string): Promise<string[]>;
  getCities(state: string, district: string): Promise<string[]>;
  getAll(): Promise<Location[]>;
}
