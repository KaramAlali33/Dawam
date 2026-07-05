import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveService } from '../../../core/services/leave.service';
import { PayrollService } from '../../../core/services/payroll.service';
import { Employee, EmployeeStatus } from '../../../core/models/employee.model';
import { AttendanceRecord, AttendanceStatus } from '../../../core/models/attendance.model';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '../../../core/models/leave.model';
import { Payslip, PayslipStatus } from '../../../core/models/payroll.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css'
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);
  private payrollService = inject(PayrollService);

  activeTab = signal('info');
  employee = signal<Employee | null>(null);

  attendanceRecords = signal<AttendanceRecord[]>([]);
  leaveRequests = signal<LeaveRequest[]>([]);
  leaveBalance = signal<LeaveBalance | null>(null);
  payslips = signal<Payslip[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const empId = +id;
      this.loadEmployeeData(empId);
    }
  }

  loadEmployeeData(empId: number) {
    this.employeeService.getById(empId).subscribe({
      next: (emp) => {
        this.employee.set(emp);
      },
      error: () => {
        alert('فشل تحميل بيانات الموظف');
      }
    });

    this.attendanceService.loadRecords(empId).subscribe(records => {
      this.attendanceRecords.set(records);
    });

    this.leaveService.loadRequests(empId).subscribe(leaves => {
      this.leaveRequests.set(leaves);
    });
    this.leaveService.loadBalance(empId).subscribe(balance => {
      this.leaveBalance.set(balance);
    });

    this.payrollService.loadPayslips(empId).subscribe(slips => {
      this.payslips.set(slips);
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Security Check: Admin / HR or the employee themselves can view salary, leaves, and payroll
  canViewSensitiveData = computed<boolean>(() => {
    const loggedInUser = this.authService.currentUser();
    const currentEmp = this.employee();
    if (!loggedInUser || !currentEmp) return false;

    const isAdmin = loggedInUser.role === 'Admin' || loggedInUser.role === 'HRManager';
    const isSelf = currentEmp.id === (loggedInUser.employeeId || loggedInUser.id);
    
    return isAdmin || isSelf;
  });

  // Check if current user is Admin/HR (for showing Edit button, etc.)
  isAdminOrHR = computed<boolean>(() => {
    const user = this.authService.currentUser();
    return user ? (user.role === 'Admin' || user.role === 'HRManager') : false;
  });

  // Fetch direct manager based on seed department mappings
  managerName = computed<string>(() => {
    const currentEmp = this.employee();
    if (!currentEmp) return '—';
    if (currentEmp.departmentId === 1) return 'فهد عبدالله النجار';
    if (currentEmp.departmentId === 2) return 'سارة خالد الحمد';
    return 'مدير النظام';
  });

  // Display labels formatting
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
      case 'Present':
      case 'Approved':
      case 'Paid':
        return 'status-approved';
      case 'Late':
      case 'Pending':
      case 'Draft':
        return 'status-pending';
      case 'Absent':
      case 'Rejected':
      case 'Suspended':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Active': return 'نشط';
      case 'Inactive': return 'غير نشط';
      case 'Suspended': return 'موقوف';
      case 'Terminated': return 'منتهي الصلاحية';
      case 'Present': return 'حاضر';
      case 'Late': return 'متأخر';
      case 'Absent': return 'غائب';
      case 'OnLeave': return 'إجازة';
      case 'Pending': return 'معلق';
      case 'Approved': return 'مقبول';
      case 'Rejected': return 'مرفوض';
      case 'Draft': return 'مسودة';
      case 'Paid': return 'مدفوع';
      default: return status;
    }
  }

  getLeaveTypeLabel(type: string): string {
    switch (type) {
      case 'Annual': return 'إجازة سنوية';
      case 'Sick': return 'إجازة مرضية';
      case 'Emergency': return 'إجازة اضطرارية';
      default: return type;
    }
  }

  getLeaveTypeClass(type: string): string {
    switch (type) {
      case 'Annual': return 'type-annual';
      case 'Sick': return 'type-sick';
      case 'Emergency': return 'type-emergency';
      default: return '';
    }
  }

  formatLate(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}س ${m}د`;
    return `${m} دقيقة`;
  }

  formatOvertime(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}س ${m}د`;
    return `${m} دقيقة`;
  }

  getMonthName(monthNum: number): string {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return monthsAr[monthNum - 1] || monthNum.toString();
  }
}
