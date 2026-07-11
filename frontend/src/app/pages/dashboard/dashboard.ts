import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { LeaveService } from '../../core/services/leave.service';
import { EmployeeService } from '../../core/services/employee.service';
import { PayrollService } from '../../core/services/payroll.service';
import { Employee } from '../../core/models/employee.model';

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
  departmentsCount = signal<number>(0);
  pendingLeavesCount = signal<number>(0);
  allEmployees = signal<Employee[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const user = this.authService.currentUser();
    if (!user) return;

    const isAdmin = user.role !== 'Employee';
    const empId = user.employeeId || user.id;

    if (isAdmin) {
      // Load employees → derive count + unique departments
      this.employeeService.getAll().subscribe(emps => {
        this.allEmployees.set(emps);
        this.totalEmployeesCount.set(emps.length || 30); // Fallback to 30 for the virtual attendance data
        const depts = new Set(emps.map(e => e.departmentId).filter(Boolean));
        this.departmentsCount.set(depts.size || 3); // Fallback to 3 departments
      });

      // Today's attendance
      this.attendanceService.loadRecords(undefined, this.today).subscribe();

      // All leave requests → count pending
      this.leaveService.loadRequests().subscribe(reqs => {
        const pending = reqs.filter(r => r.status?.toLowerCase() === 'pending').length;
        this.pendingLeavesCount.set(pending);
      });

      // Payroll for this month
      const now = new Date();
      this.payrollService.loadPayslips().subscribe();

    } else {
      if (empId) {
        this.attendanceService.loadRecords(empId).subscribe();
        this.leaveService.loadRequests(empId).subscribe();
        this.leaveService.loadBalance(empId).subscribe();
        this.payrollService.loadPayslips(empId).subscribe();
      }
    }
  }

  /* ── Stat Cards (top row) ─────────────────────────────────── */
  attendanceStats = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role !== 'Employee';
    const recs = this.attendanceService.records();

    if (isAdmin) {
      const total = Math.max(this.totalEmployeesCount(), recs.length);
      const present = recs.filter(r => r.status === 'Present').length;
      const late = recs.filter(r => r.status === 'Late').length;
      const absent = recs.filter(r => r.status === 'Absent').length;
      const onLeave = recs.filter(r => r.status === 'OnLeave').length;
      const checkedOut = recs.filter(r => r.checkOut).length;

      return [
        { title: 'DASHBOARD.TOTAL_EMPLOYEES', value: total.toString(), icon: 'assets/user.png', bgColor: '#e0f2fe', textColor: '#0284c7' },
        { title: 'DASHBOARD.PRESENT_TODAY', value: (present + late).toString(), icon: 'assets/attend.png', bgColor: '#dcfce7', textColor: '#16a34a', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.ABSENT', value: absent.toString(), icon: 'assets/absence.png', bgColor: '#fee2e2', textColor: '#dc2626', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.LATE', value: late.toString(), icon: 'assets/late.png', bgColor: '#fef3c7', textColor: '#d97706' },
        { title: 'DASHBOARD.ON_LEAVE', value: onLeave.toString(), icon: 'assets/vacation.png', bgColor: '#f3e8ff', textColor: '#9333ea' },
        { title: 'ATTENDANCE.COL_CHECK_OUT', value: checkedOut.toString(), icon: 'assets/exit.png', bgColor: '#ccfbf1', textColor: '#0d9488' },
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
        { title: 'ATTENDANCE.TOTAL', value: totalDays.toString(), icon: 'assets/user.png', bgColor: '#e0f2fe', textColor: '#0284c7' },
        { title: 'ATTENDANCE.PRESENT', value: (present + late).toString(), icon: 'assets/attend.png', bgColor: '#dcfce7', textColor: '#16a34a', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.LATE', value: late.toString(), icon: 'assets/late.png', bgColor: '#fef3c7', textColor: '#d97706' },
        { title: 'ATTENDANCE.ABSENT', value: absent.toString(), icon: 'assets/absence.png', bgColor: '#fee2e2', textColor: '#dc2626', iconClass: 'icon-lg' },
        { title: 'ATTENDANCE.ON_LEAVE', value: onLeave.toString(), icon: 'assets/vacation.png', bgColor: '#f3e8ff', textColor: '#9333ea' },
        { title: 'LEAVE.BALANCE', value: annualBalance.toString(), icon: 'assets/exit.png', bgColor: '#ccfbf1', textColor: '#0d9488' },
      ];
    }
  });

  /* ── Quick Stats panel (side panel) ──────────────────────── */
  quickStats = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role !== 'Employee';

    if (isAdmin) {
      // Pending leave requests
      const pending = this.pendingLeavesCount();
      // Departments from real data
      const depts = this.departmentsCount();
      // Total late minutes today from attendance records
      const recs = this.attendanceService.records();
      const lateToday = recs.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);

      return [
        { label: 'DASHBOARD.PENDING_LEAVES', value: pending.toString() },
        { label: 'ATTENDANCE.COL_LATE', value: `${lateToday} min` },
        { label: 'NAV.DEPARTMENTS', value: depts.toString() },
      ];
    } else {
      const recs = this.attendanceService.records();
      const totalLate = recs.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
      const totalOvertime = recs.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
      const balance = this.leaveService.userBalance();
      const remaining = balance ? (balance.annual - balance.annualUsed) : 21;

      return [
        { label: 'ATTENDANCE.COL_LATE', value: `${totalLate} min` },
        { label: 'ATTENDANCE.COL_OVERTIME', value: `${totalOvertime} min` },
        { label: 'LEAVE.BALANCE', value: `${remaining} days` },
      ];
    }
  });

  /* ── Top Disciplined Employee ─────────────────────────────── */
  topDisciplined = computed(() => {
    const user = this.authService.currentUser();
    const isAdmin = user?.role !== 'Employee';

    if (isAdmin) {
      const recs = this.attendanceService.records();
      const emps = this.allEmployees();

      // Count Present days per employee from today's records
      const countMap: Record<number, number> = {};
      recs.forEach(r => {
        if (r.status === 'Present' && r.employeeId) {
          countMap[r.employeeId] = (countMap[r.employeeId] || 0) + 1;
        }
      });

      // Find the employee with the highest present count
      let topId = -1, topCount = -1;
      Object.entries(countMap).forEach(([id, cnt]) => {
        if (cnt > topCount) { topCount = cnt; topId = +id; }
      });

      const topEmp = emps.find(e => e.id === topId);
      const name = topEmp
        ? topEmp.fullName
        : (emps[0] ? emps[0].fullName : 'N/A');
      const dept = topEmp?.departmentName || emps[0]?.departmentName || '—';

      return { name, department: dept, label: 'DASHBOARD.TOP_EMPLOYEE' };
    } else {
      // For the employee — show their own name and attendance score
      const recs = this.attendanceService.records();
      const present = recs.filter(r => r.status === 'Present').length;
      const score = recs.length > 0 ? Math.round((present / recs.length) * 100) : 100;
      return {
        name: user?.fullName ?? '—',
        department: `${score}%`,
        label: 'DASHBOARD.MY_ATTENDANCE_SCORE'
      };
    }
  });

  /* ── Recent Leave Requests ────────────────────────────────── */
  recentLeaves = computed(() => {
    const requests = this.leaveService.requests();
    // Show latest 3, most recent first
    return [...requests]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 3)
      .map(r => ({
        name: r.employeeName || 'موظف',
        type: 'LEAVE.' + r.leaveType.toUpperCase(),
        days: r.totalDays,
        status: 'STATUS.' + r.status.toUpperCase()
      }));
  });
}
