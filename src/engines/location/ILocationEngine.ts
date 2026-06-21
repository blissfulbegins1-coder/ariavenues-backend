import { Location } from "../../domain/entities/Location";

export interface ILocationEngine {
  getStates(): Promise<string[]>;
  getDistricts(state: string): Promise<string[]>;
  getCities(state: string, district: string): Promise<string[]>;
  getAll(): Promise<Location[]>;
}
