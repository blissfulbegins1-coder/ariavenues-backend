// DTO for updating a user (all fields optional)
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'moderator';
}
