export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: UserRole;
  departmentId: string | null;
  designationId: string | null;
  department?: Department | null;
  designation?: Designation | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

