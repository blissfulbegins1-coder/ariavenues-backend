import { Auditorium } from "../../entities/Auditorium";

export type AuditoriumFilters = {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: string;
  sortBy?: string;
}

export type PaginatedAuditoriumsResponse = {
  auditoriums: Auditorium[];
  total: number;
  totalCount: number;
  pendingCount: number;
  activeCount: number;
  maintenanceCount: number;
}

export type AuditoriumDbQuery = {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}
