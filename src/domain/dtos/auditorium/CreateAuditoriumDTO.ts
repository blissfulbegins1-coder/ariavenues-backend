export interface CreateAuditoriumDTO {
  ownerId: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  dayRate: number; // INR
  amenities: string[];
  images: string[];
  status?: 'draft' | 'maintenance' | 'active';
}
