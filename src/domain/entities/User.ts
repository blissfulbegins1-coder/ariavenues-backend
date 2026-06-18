export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  mobileVerified: boolean;
  role: "customer" | "owner" | "admin";
  status: "active" | "blocked" | "deleted";
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
