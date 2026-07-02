import { Auditorium } from "../../entities/Auditorium";

export type GetPublicAuditoriumsDTO = {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  excludeIds?: string[];
  page?: number;
  limit?: number;
}

export type PaginatedPublicAuditoriumsResponse = {
  auditoriums: Auditorium[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
