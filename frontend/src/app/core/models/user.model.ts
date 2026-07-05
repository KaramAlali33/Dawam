export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  employeeId?: number;
}

export enum UserRole {
  Admin = 'Admin',
  HRManager = 'HRManager',
  Employee = 'Employee'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
