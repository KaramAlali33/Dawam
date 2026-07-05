import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AttendanceRecord, AttendanceStatus } from '../models/attendance.model';

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  avgCheckIn: string;
  avgCheckOut: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5116/api/attendance';

  private today = new Date().toISOString().split('T')[0];

  records = signal<AttendanceRecord[]>([]);
  selectedDate = signal<string>(this.today);

  summary = computed<AttendanceSummary>(() => {
    const recs = this.records();
    const total = recs.length;
    const present = recs.filter(r => r.status === AttendanceStatus.Present).length;
    const late = recs.filter(r => r.status === AttendanceStatus.Late).length;
    const absent = recs.filter(r => r.status === AttendanceStatus.Absent).length;
    const onLeave = recs.filter(r => r.status === AttendanceStatus.OnLeave).length;

    return {
      total,
      present,
      late,
      absent,
      onLeave,
      avgCheckIn: '08:02',
      avgCheckOut: '16:08'
    };
  });

  loadRecords(employeeId?: number, date?: string): Observable<AttendanceRecord[]> {
    const params: any = {};
    if (employeeId) params.employeeId = employeeId;
    if (date) params.date = date;

    return this.http.get<{ success: boolean; data: AttendanceRecord[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data || []),
      tap(data => this.records.set(data))
    );
  }

  getRecordsByDate(date: string): AttendanceRecord[] {
    return this.records().filter(r => r.date === date);
  }

  getRecordsByStatus(status: AttendanceStatus): AttendanceRecord[] {
    return this.records().filter(r => r.status === status);
  }

  checkIn(employeeId: number, notes?: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/check-in`, { employeeId, notes }).pipe(
      map(res => res.success)
    );
  }

  checkOut(employeeId: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/check-out`, { employeeId }).pipe(
      map(res => res.success)
    );
  }
}
