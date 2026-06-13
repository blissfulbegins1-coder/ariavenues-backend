// Domain Entity - Pure business logic, no database concerns
export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string; // optional
  mobileVerified: boolean;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'blocked' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

