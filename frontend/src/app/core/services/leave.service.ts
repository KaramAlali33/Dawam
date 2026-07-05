import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LeaveRequest, LeaveBalance, LeaveType } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5116/api/leaves';

  requests = signal<LeaveRequest[]>([]);
  balances = signal<LeaveBalance[]>([]);
  userBalance = signal<LeaveBalance | null>(null);

  loadRequests(employeeId?: number): Observable<LeaveRequest[]> {
    const params: any = {};
    if (employeeId) params.employeeId = employeeId;

    return this.http.get<{ success: boolean; data: LeaveRequest[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data || []),
      tap(data => this.requests.set(data))
    );
  }

  loadBalance(employeeId: number): Observable<LeaveBalance> {
    return this.http.get<{ success: boolean; data: LeaveBalance }>(`${this.apiUrl}/balance/${employeeId}`).pipe(
      map(res => res.data),
      tap(balance => {
        this.userBalance.set(balance);
        this.balances.update(bals => {
          const index = bals.findIndex(b => b.employeeId === employeeId);
          if (index !== -1) {
            bals[index] = balance;
            return [...bals];
          }
          return [...bals, balance];
        });
      })
    );
  }

  getBalance(employeeId: number): LeaveBalance {
    const balance = this.balances().find(b => b.employeeId === employeeId);
    if (balance) return balance;
    
    return {
      employeeId,
      annual: 21,
      annualUsed: 0,
      sick: 14,
      sickUsed: 0,
      emergency: 5,
      emergencyUsed: 0
    };
  }

  createRequest(request: { employeeId: number; leaveType: LeaveType; startDate: string; endDate: string; reason: string }): Observable<boolean> {
    return this.http.post<{ success: boolean }>(this.apiUrl, request).pipe(
      map(res => res.success)
    );
  }

  approveRequest(id: number, approverId: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${id}/approve`, null, {
      params: { approverId: approverId.toString() }
    }).pipe(
      map(res => res.success)
    );
  }

  rejectRequest(id: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${id}/reject`, null).pipe(
      map(res => res.success)
    );
  }
}
