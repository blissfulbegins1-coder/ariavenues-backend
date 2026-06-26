import { Auditorium } from "../../entities/Auditorium";

export interface AuditoriumFilters {
  page?: number | null;
  limit?: number | null;
  search?: string;
  status?: "all" | "active" | "pending" | "rejected" | "maintenance" | "blocked" | string;
  sortBy?: "recent" | "name" | string;
}

export interface PaginatedAuditoriumsResponse {
  auditoriums: Auditorium[];
  total: number;
  totalCount: number;
  pendingCount: number;
  activeCount: number;
  maintenanceCount: number;
}

export interface AuditoriumDbQuery {
  query: any;
  sort: any;
  skip?: number | null;
  limit?: number | null;
}
