// DTO for creating a new user (input validation)
export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  role?: 'admin' | 'user' | 'moderator';
}
