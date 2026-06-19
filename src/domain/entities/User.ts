import UserRoles from "../enums/UserRole";
import UserStatus from "../enums/UserStatus";

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  mobileVerified: boolean;
  role: UserRoles;
  status: UserStatus;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
