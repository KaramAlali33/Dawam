import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, UserRole, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5116/api/auth';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/login`, credentials).pipe(
      map(res => {
        if (res.success && res.data) {
          const user: User = {
            id: res.data.userId,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role as UserRole,
            employeeId: res.data.employeeId || undefined
          };

          localStorage.setItem('auth_token', res.data.token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  register(user: any): Observable<boolean> {
    return this.http.post<{ success: boolean; error?: string }>(`${this.apiUrl}/register`, user).pipe(
      map(res => res.success),
      catchError(() => of(false))
    );
  }

  googleLogin(idToken: string): Observable<boolean> {
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      map(res => {
        if (res.success && res.data) {
          const user: User = {
            id: res.data.userId,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role as UserRole,
            employeeId: res.data.employeeId || undefined
          };

          localStorage.setItem('auth_token', res.data.token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }
}
