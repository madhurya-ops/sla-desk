import { Category, Role } from './enums';

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  team: Category | null;
}

export interface UserRef {
  id: number;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
}
