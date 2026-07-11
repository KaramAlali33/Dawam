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
      map(res => {
        let list = res.data || [];
        if (list.length === 0) {
          const mockDate = date || this.today;
          list = [
            { id: 101, employeeId: 1, employeeName: 'أحمد خليل', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60, notes: 'منتظم' },
            { id: 102, employeeId: 2, employeeName: 'سارة العلي', date: mockDate, checkIn: '08:45', checkOut: '17:00', status: AttendanceStatus.Late, lateMinutes: 45, overtimeMinutes: 0, notes: 'تأخر مواصلات' },
            { id: 103, employeeId: 3, employeeName: 'محمد عمر', date: mockDate, checkIn: '08:05', checkOut: '17:15', status: AttendanceStatus.Present, lateMinutes: 5, overtimeMinutes: 15, notes: 'حضور بالوقت' },
            { id: 104, employeeId: 4, employeeName: 'كرم عامر غانم', date: mockDate, checkIn: '07:50', checkOut: '16:30', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 30, notes: 'منضبط ومتميز' },
            { id: 105, employeeId: 5, employeeName: 'خالد حسن', date: mockDate, status: AttendanceStatus.OnLeave, lateMinutes: 0, overtimeMinutes: 0, notes: 'إجازة سنوية مرخصة' },
            { id: 106, employeeId: 6, employeeName: 'ليلى سليم', date: mockDate, checkIn: '07:55', checkOut: '16:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 107, employeeId: 7, employeeName: 'عبدالرحمن خالد', date: mockDate, checkIn: '08:10', checkOut: '17:10', status: AttendanceStatus.Present, lateMinutes: 10, overtimeMinutes: 10 },
            { id: 108, employeeId: 8, employeeName: 'يوسف العبدالله', date: mockDate, status: AttendanceStatus.Absent, lateMinutes: 0, overtimeMinutes: 0, notes: 'بدون عذر' },
            { id: 109, employeeId: 9, employeeName: 'هبة منصور', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 110, employeeId: 10, employeeName: 'عمر الفاروق', date: mockDate, checkIn: '08:50', checkOut: '17:00', status: AttendanceStatus.Late, lateMinutes: 50, overtimeMinutes: 0 },
            { id: 111, employeeId: 11, employeeName: 'فاطمة الزهراء', date: mockDate, checkIn: '08:02', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 2, overtimeMinutes: 0 },
            { id: 112, employeeId: 12, employeeName: 'باسل المصري', date: mockDate, status: AttendanceStatus.OnLeave, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 113, employeeId: 13, employeeName: 'طارق زياد', date: mockDate, checkIn: '07:45', checkOut: '16:45', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 45 },
            { id: 114, employeeId: 14, employeeName: 'منى عبدالكريم', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 115, employeeId: 15, employeeName: 'جمال عبدالناصر', date: mockDate, status: AttendanceStatus.Absent, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 116, employeeId: 16, employeeName: 'حسين علي', date: mockDate, checkIn: '08:35', checkOut: '17:00', status: AttendanceStatus.Late, lateMinutes: 35, overtimeMinutes: 0 },
            { id: 117, employeeId: 17, employeeName: 'مريم الصالح', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 118, employeeId: 18, employeeName: 'جهاد أحمد', date: mockDate, status: AttendanceStatus.Absent, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 119, employeeId: 19, employeeName: 'سماح غازي', date: mockDate, checkIn: '08:05', checkOut: '17:05', status: AttendanceStatus.Present, lateMinutes: 5, overtimeMinutes: 5 },
            { id: 120, employeeId: 20, employeeName: 'نزار قباني', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 121, employeeId: 21, employeeName: 'غسان كنفاني', date: mockDate, checkIn: '08:15', checkOut: '17:15', status: AttendanceStatus.Present, lateMinutes: 15, overtimeMinutes: 15 },
            { id: 122, employeeId: 22, employeeName: 'محمود درويش', date: mockDate, status: AttendanceStatus.OnLeave, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 123, employeeId: 23, employeeName: 'بدر شاكر', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 124, employeeId: 24, employeeName: 'أمل دنقل', date: mockDate, checkIn: '08:40', checkOut: '17:00', status: AttendanceStatus.Late, lateMinutes: 40, overtimeMinutes: 0 },
            { id: 125, employeeId: 25, employeeName: 'نازك الملائكة', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 126, employeeId: 26, employeeName: 'جبران خليل', date: mockDate, status: AttendanceStatus.Absent, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 127, employeeId: 27, employeeName: 'مي زيادة', date: mockDate, checkIn: '08:03', checkOut: '17:03', status: AttendanceStatus.Present, lateMinutes: 3, overtimeMinutes: 3 },
            { id: 128, employeeId: 28, employeeName: 'عباس العقاد', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 },
            { id: 129, employeeId: 29, employeeName: 'طه حسين', date: mockDate, status: AttendanceStatus.OnLeave, lateMinutes: 0, overtimeMinutes: 0 },
            { id: 130, employeeId: 30, employeeName: 'توفيق الحكيم', date: mockDate, checkIn: '08:00', checkOut: '17:00', status: AttendanceStatus.Present, lateMinutes: 0, overtimeMinutes: 60 }
          ];
          if (employeeId) {
            list = list.filter(r => r.employeeId === employeeId);
          }
        }
        return list;
      }),
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
