export type PublicAuditoriumDTO = {
  id: string;
  name: string;
  address: string;
  description: string;
  state: string;
  district: string;
  city: string;
  capacity: number;
  dayRate: number;
  amenities: string[];
  images: string[];
  averageRating: number;
  totalReviews: number;
  status: string;
  adminAdvance: number;
  auditoriumAdvance: number;
};

export type PaginatedPublicAuditoriumsDTO = {
  auditoriums: PublicAuditoriumDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
