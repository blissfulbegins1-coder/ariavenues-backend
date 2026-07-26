import { Auditorium } from "../../entities/Auditorium";

export type PaginatedPublicAuditoriumsDTO = {
  auditoriums: Auditorium[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
