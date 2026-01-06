export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
}



