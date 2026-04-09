export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
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
