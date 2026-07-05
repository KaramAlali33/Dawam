import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { LeaveService } from '../../core/services/leave.service';
import { EmployeeService } from '../../core/services/employee.service';
import { PayrollService } from '../../core/services/payroll.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  attendanceService = inject(AttendanceService);
  leaveService = inject(LeaveService);
  employeeService = inject(EmployeeService);
  payrollService = inject(PayrollService);

  private today = new Date().toISOString().split('T')[0];

  totalEmployeesCount = signal<number>(0);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const user = this.authService.currentUser();
    if (!user) return;

    const isAdmin = user.role !== 'Employee';
    const empId = user.employeeId || user.id;

    if (isAdmin) {
      this.employeeService.getAll().subscribe(emps => {
        this.totalEmployeesCount.set(emps.length);
      });
      this.attendanceService.loadRecords(undefined, this.today).subscribe();
      this.leaveService.loadRequests().subscribe();
    } else {
      if (empId) {
        this.attendanceService.loadRecords(empId).subscribe();
        this.leaveService.loadRequests(empId).subscribe();
        this.leaveService.loadBalance(empId).subscribe();
      }
    }
  }

  attendanceStats = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role !== 'Employee';
    const recs = this.attendanceService.records();

    if (isAdmin) {
      const total = this.totalEmployeesCount();
      const present = recs.filter(r => r.status === 'Present').length;
      const late = recs.filter(r => r.status === 'Late').length;
      const absent = recs.filter(r => r.status === 'Absent').length;
      const onLeave = recs.filter(r => r.status === 'OnLeave').length;
      const checkedOut = recs.filter(r => r.checkOut).length;

      return [
        { title: 'DASHBOARD.TOTAL_EMPLOYEES', value: total.toString(), icon: 'assets/user.png', color: 'blue', bgColor: '#e0f2fe', textColor: '#0284c7' },
        { title: 'DASHBOARD.PRESENT_TODAY', value: (present + late).toString(), icon: 'assets/attend.png', color: 'green', bgColor: '#dcfce7', textColor: '#16a34a', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.ABSENT', value: absent.toString(), icon: 'assets/absence.png', color: 'red', bgColor: '#fee2e2', textColor: '#dc2626', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.LATE', value: late.toString(), icon: 'assets/late.png', color: 'orange', bgColor: '#fef3c7', textColor: '#d97706' },
        { title: 'DASHBOARD.ON_LEAVE', value: onLeave.toString(), icon: 'assets/vacation.png', color: 'purple', bgColor: '#f3e8ff', textColor: '#9333ea' },
        { title: 'ATTENDANCE.COL_CHECK_OUT', value: checkedOut.toString(), icon: 'assets/exit.png', color: 'teal', bgColor: '#ccfbf1', textColor: '#0d9488' }
      ];
    } else {
      const totalDays = recs.length;
      const present = recs.filter(r => r.status === 'Present').length;
      const late = recs.filter(r => r.status === 'Late').length;
      const absent = recs.filter(r => r.status === 'Absent').length;
      const onLeave = recs.filter(r => r.status === 'OnLeave').length;
      
      const balance = this.leaveService.userBalance();
      const annualBalance = balance ? (balance.annual - balance.annualUsed) : 21;

      return [
        { title: 'ATTENDANCE.TOTAL', value: totalDays.toString(), icon: 'assets/user.png', color: 'blue', bgColor: '#e0f2fe', textColor: '#0284c7' },
        { title: 'ATTENDANCE.PRESENT', value: (present + late).toString(), icon: 'assets/attend.png', color: 'green', bgColor: '#dcfce7', textColor: '#16a34a', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.LATE', value: late.toString(), icon: 'assets/late.png', color: 'orange', bgColor: '#fef3c7', textColor: '#d97706' },
        { title: 'ATTENDANCE.ABSENT', value: absent.toString(), icon: 'assets/absence.png', color: 'red', bgColor: '#fee2e2', textColor: '#dc2626', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.ON_LEAVE', value: onLeave.toString(), icon: 'assets/vacation.png', color: 'purple', bgColor: '#f3e8ff', textColor: '#9333ea' },
        { title: 'LEAVE.BALANCE', value: annualBalance.toString(), icon: 'assets/exit.png', color: 'teal', bgColor: '#ccfbf1', textColor: '#0d9488' }
      ];
    }
  });

  quickStats = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role !== 'Employee';
    if (isAdmin) {
      return [
        { label: 'ATTENDANCE.TITLE', value: '09:00 - 17:00', icon: 'clock' },
        { label: 'PAYROLL.CURRENCY', value: 'JOD', icon: 'dollar' },
        { label: 'NAV.DEPARTMENTS', value: '5', icon: 'trending' }
      ];
    } else {
      const recs = this.attendanceService.records();
      const totalLate = recs.reduce((sum, r) => sum + r.lateMinutes, 0);
      const totalOvertime = recs.reduce((sum, r) => sum + r.overtimeMinutes, 0);
      return [
        { label: 'ATTENDANCE.COL_LATE', value: `${totalLate} min`, icon: 'clock' },
        { label: 'ATTENDANCE.COL_OVERTIME', value: `${totalOvertime} min`, icon: 'trending' },
        { label: 'PAYROLL.CURRENCY', value: 'JOD', icon: 'dollar' }
      ];
    }
  });

  topDisciplined = computed(() => {
    const user = this.authService.currentUser();
    const name = user ? user.fullName : 'أحمد خليل';
    return {
      name,
      department: user?.role === 'Employee' ? 'تقنية المعلومات' : 'الإدارة العامة',
      label: 'WELCOME'
    };
  });

  recentLeaves = computed(() => {
    const requests = this.leaveService.requests();
    return requests.slice(0, 3).map(r => ({
      name: r.employeeName || 'موظف',
      type: 'LEAVE.' + r.leaveType.toUpperCase(),
      days: r.totalDays,
      status: 'STATUS.' + r.status.toUpperCase()
    }));
  });
}
