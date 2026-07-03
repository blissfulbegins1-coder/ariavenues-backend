export type User = {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  mobileVerified: boolean;
  role: string;
  status: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
