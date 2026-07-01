export type GetPublicAuditoriumsDTO = {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  excludeIds?: string[];
}
