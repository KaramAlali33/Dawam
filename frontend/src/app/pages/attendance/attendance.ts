import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceRecord, AttendanceStatus } from '../../core/models/attendance.model';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class AttendanceComponent implements OnInit {
  attendanceService = inject(AttendanceService);
  authService = inject(AuthService);

  selectedDate = this.attendanceService.selectedDate;
  records = this.attendanceService.records;
  summary = this.attendanceService.summary;

  searchQuery = signal('');
  activeFilter = signal<string>('all');

  today = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.loadData();
  }

  // Check if current view is HR Manager (Admin)
  isAdminOrHR = computed<boolean>(() => {
    const user = this.authService.currentUser();
    return user ? (user.role === UserRole.Admin || user.role === UserRole.HRManager) : false;
  });

  // Retrieve current active user details
  activeUserId = computed<number>(() => {
    const user = this.authService.currentUser();
    return user ? (user.employeeId || user.id) : 1;
  });

  loadData() {
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();
    this.attendanceService.loadRecords(isHR ? undefined : empId, this.selectedDate()).subscribe();
  }

  // Filtered records based on search and status filter
  filteredRecords = computed(() => {
    let recs: AttendanceRecord[] = this.records();
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();

    if (!isHR) {
      recs = recs.filter((r: AttendanceRecord) => r.employeeId === empId);
    }

    if (query) {
      recs = recs.filter((r: AttendanceRecord) =>
        (r.employeeName || '').toLowerCase().includes(query)
      );
    }

    if (filter !== 'all') {
      recs = recs.filter((r: AttendanceRecord) => r.status === filter);
    }

    return recs;
  });

  hasCheckedInToday = computed<boolean>(() => {
    const empId = this.activeUserId();
    const recs = this.records();
    return recs.some(r => r.employeeId === empId && r.date === this.today && r.checkIn);
  });

  hasCheckedOutToday = computed<boolean>(() => {
    const empId = this.activeUserId();
    const recs = this.records();
    return recs.some(r => r.employeeId === empId && r.date === this.today && r.checkOut);
  });

  doCheckIn(): void {
    const empId = this.activeUserId();
    if (!empId) return;

    this.attendanceService.checkIn(empId, 'Checked in from web app').subscribe(success => {
      if (success) {
        this.loadData();
        alert('تم تسجيل حضورك بنجاح');
      } else {
        alert('فشل تسجيل الحضور، قد تكون سجلت حضورك بالفعل اليوم');
      }
    });
  }

  doCheckOut(): void {
    const empId = this.activeUserId();
    if (!empId) return;

    this.attendanceService.checkOut(empId).subscribe(success => {
      if (success) {
        this.loadData();
        alert('تم تسجيل انصرافك بنجاح');
      } else {
        alert('فشل تسجيل الانصراف');
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedDate.set(value);
    this.loadData();
  }

  getStatusClass(status: AttendanceStatus): string {
    switch (status) {
      case AttendanceStatus.Present: return 'status-present';
      case AttendanceStatus.Late: return 'status-late';
      case AttendanceStatus.Absent: return 'status-absent';
      case AttendanceStatus.OnLeave: return 'status-leave';
      case AttendanceStatus.Holiday: return 'status-holiday';
      default: return '';
    }
  }

  getStatusLabel(status: AttendanceStatus): string {
    switch (status) {
      case AttendanceStatus.Present: return 'حاضر';
      case AttendanceStatus.Late: return 'متأخر';
      case AttendanceStatus.Absent: return 'غائب';
      case AttendanceStatus.OnLeave: return 'إجازة';
      case AttendanceStatus.Holiday: return 'عطلة';
      default: return status;
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + '.' + parts[1].charAt(0);
    }
    return parts[0].charAt(0);
  }

  formatLate(minutes: number): string {
    if (minutes === 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}س ${m}د`;
    return `${m} دقيقة`;
  }

  formatOvertime(minutes: number): string {
    if (minutes === 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}س ${m}د`;
    return `${m} دقيقة`;
  }

  get presentPercentage(): number {
    const s = this.summary();
    if (s.total === 0) return 0;
    return Math.round((s.present / s.total) * 100);
  }

  get latePercentage(): number {
    const s = this.summary();
    if (s.total === 0) return 0;
    return Math.round((s.late / s.total) * 100);
  }

  get absentPercentage(): number {
    const s = this.summary();
    if (s.total === 0) return 0;
    return Math.round((s.absent / s.total) * 100);
  }

  get donutSegments(): string {
    const s = this.summary();
    const total = s.total || 1;
    const presentPct = (s.present / total) * 100;
    const latePct = (s.late / total) * 100;
    const absentPct = (s.absent / total) * 100;
    const leavePct = (s.onLeave / total) * 100;

    const seg1 = presentPct;
    const seg2 = seg1 + latePct;
    const seg3 = seg2 + absentPct;
    const seg4 = seg3 + leavePct;

    return `conic-gradient(
      #10b981 0% ${seg1}%,
      #f59e0b ${seg1}% ${seg2}%,
      #ef4444 ${seg2}% ${seg3}%,
      #8b5cf6 ${seg3}% ${seg4}%,
      #e5e7eb ${seg4}% 100%
    )`;
  }
}
