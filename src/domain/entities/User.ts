export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  mobileVerified: boolean;
  role: "customer" | "owner";
  status: "active" | "blocked" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}
