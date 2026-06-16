// DTO for creating a new user (input validation)
export interface CreateUserDTO {
  name: string;
  email?: string;
  mobile: string;
  role: "customer" | "owner" | "admin";
}
