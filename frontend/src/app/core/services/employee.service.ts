import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5116/api/employees';

  getAll(): Observable<Employee[]> {
    return this.http.get<{ success: boolean; data: Employee[] }>(this.apiUrl).pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<{ success: boolean; data: Employee }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  create(employee: any): Observable<number> {
    return this.http.post<{ success: boolean; data: number }>(this.apiUrl, employee).pipe(
      map(res => res.data)
    );
  }

  update(id: number, employee: any): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/${id}`, employee).pipe(
      map(res => res.success)
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.success)
    );
  }
}
