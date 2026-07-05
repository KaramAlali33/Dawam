import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Payslip } from '../models/payroll.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5116/api/payroll';

  payslips = signal<Payslip[]>([]);

  loadPayslips(employeeId?: number): Observable<Payslip[]> {
    const params: any = {};
    if (employeeId) params.employeeId = employeeId;

    return this.http.get<{ success: boolean; data: Payslip[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data || []),
      tap(data => this.payslips.set(data))
    );
  }

  createPayslip(slip: { employeeId: number; month: number; year: number; bonuses: number; deductions: number }): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/generate`, slip).pipe(
      map(res => res.success)
    );
  }

  approvePayslip(id: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${id}/approve`, null).pipe(
      map(res => res.success)
    );
  }

  payPayslip(id: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${id}/mark-paid`, null).pipe(
      map(res => res.success)
    );
  }

  deletePayslip(id: number): void {
    // Local fallback deletion since backend does not expose delete
    this.payslips.update(slips => slips.filter(slip => slip.id !== id));
  }
}
