import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PayrollService } from '../../core/services/payroll.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Payslip, PayslipStatus } from '../../core/models/payroll.model';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.css'
})
export class PayrollComponent implements OnInit {
  payrollService = inject(PayrollService);
  authService = inject(AuthService);
  employeeService = inject(EmployeeService);
  translateService = inject(TranslateService);

  // Core signals for list filters
  activeFilter = signal<string>('all');
  searchQuery = signal<string>('');

  // Demoware: toggle active role for easier testing without logging out
  simulationActive = signal<boolean>(false);
  simulatedRole = signal<UserRole | null>(null);

  // Modal display signals
  showGenerateModal = signal<boolean>(false);
  showSlipDetailsModal = signal<boolean>(false);
  selectedPayslip = signal<Payslip | null>(null);

  dbEmployees = signal<any[]>([]);

  get employees() {
    if (this.dbEmployees().length > 0) {
      return this.dbEmployees().map(e => ({ id: e.id, name: e.fullName, basic: e.salary }));
    }
    return [
      { id: 1, name: 'أحمد محمد العلي', basic: 9500 },
      { id: 2, name: 'سارة خالد الحمد', basic: 7200 },
      { id: 3, name: 'فهد عبدالله النجار', basic: 8000 },
      { id: 4, name: 'كرم عامر غانم', basic: 11000 }
    ];
  }

  // Form input signals
  selectedEmployeeId = signal<number>(1);
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());
  basicSalary = signal<number>(9500);
  bonuses = signal<number>(0);
  deductions = signal<number>(0);
  overtime = signal<number>(0);

  formError = signal<string>('');
  formSuccess = signal<string>('');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();

    this.payrollService.loadPayslips(isHR ? undefined : empId).subscribe();
    
    if (isHR) {
      this.employeeService.getAll().subscribe(emps => {
        this.dbEmployees.set(emps);
        if (emps.length > 0) {
          this.selectedEmployeeId.set(emps[0].id);
          this.basicSalary.set(emps[0].salary);
        }
      });
    }
  }

  // Get active user role (either simulated or actual)
  currentUserRole = computed<UserRole>(() => {
    if (this.simulationActive() && this.simulatedRole()) {
      return this.simulatedRole()!;
    }
    const user = this.authService.currentUser();
    return user ? user.role : UserRole.HRManager;
  });

  // Check if current view is HR Manager (Admin)
  isAdminOrHR = computed<boolean>(() => {
    const role = this.currentUserRole();
    return role === UserRole.Admin || role === UserRole.HRManager;
  });

  // Retrieve current active user details
  activeUserId = computed<number>(() => {
    const user = this.authService.currentUser();
    return user ? (user.employeeId || user.id) : 1;
  });

  // Live calculation of net salary for the input form
  calculatedNetSalary = computed<number>(() => {
    return Number(this.basicSalary()) + Number(this.bonuses()) + Number(this.overtime()) - Number(this.deductions());
  });

  // General company statistics
  totalPayrollCost = computed<number>(() => {
    return this.payrollService.payslips().reduce((sum, s) => sum + s.netSalary, 0);
  });

  paidSalariesAmount = computed<number>(() => {
    return this.payrollService.payslips()
      .filter(s => s.status === PayslipStatus.Paid)
      .reduce((sum, s) => sum + s.netSalary, 0);
  });

  pendingSalariesAmount = computed<number>(() => {
    return this.payrollService.payslips()
      .filter(s => s.status !== PayslipStatus.Paid)
      .reduce((sum, s) => sum + s.netSalary, 0);
  });

  averageNetSalary = computed<number>(() => {
    const slips = this.payrollService.payslips();
    if (slips.length === 0) return 0;
    return Math.round(this.totalPayrollCost() / slips.length);
  });

  paidPayslipsCount = computed<number>(() => {
    return this.payrollService.payslips().filter(s => s.status === PayslipStatus.Paid).length;
  });

  pendingPayslipsCount = computed<number>(() => {
    return this.payrollService.payslips().filter(s => s.status !== PayslipStatus.Paid).length;
  });

  // Filter payslips reactively
  filteredPayslips = computed<Payslip[]>(() => {
    let slips = this.payrollService.payslips();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();

    if (!isHR) {
      slips = slips.filter(s => s.employeeId === empId);
    }

    // 2. Filter by status
    if (filter !== 'all') {
      slips = slips.filter(s => s.status.toLowerCase() === filter);
    }

    // 3. Search filter
    if (query) {
      slips = slips.filter(s => 
        (s.employeeName || '').toLowerCase().includes(query) ||
        s.month.toString().includes(query) ||
        s.year.toString().includes(query)
      );
    }

    return slips;
  });

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  // Demo tool: toggle role Simulation (between HR Manager and Employee)
  toggleSimulatedRole(): void {
    if (!this.simulationActive()) {
      this.simulationActive.set(true);
      const realRole = this.authService.currentUser()?.role;
      if (realRole === UserRole.Admin || realRole === UserRole.HRManager) {
        this.simulatedRole.set(UserRole.Employee);
      } else {
        this.simulatedRole.set(UserRole.Admin);
      }
    } else {
      this.simulationActive.set(false);
      this.simulatedRole.set(null);
    }
    this.loadData();
  }

  // Pre-fill basic salary when an employee is chosen in form
  onEmployeeSelect(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.selectedEmployeeId.set(id);
    
    const emp = this.dbEmployees().find(e => e.id === id);
    if (emp) {
      this.basicSalary.set(emp.salary);
    }
  }

  // Reset form inputs
  resetForm(): void {
    const emps = this.dbEmployees();
    if (emps.length > 0) {
      this.selectedEmployeeId.set(emps[0].id);
      this.basicSalary.set(emps[0].salary);
    } else {
      this.selectedEmployeeId.set(1);
      this.basicSalary.set(9500);
    }
    this.bonuses.set(0);
    this.deductions.set(0);
    this.overtime.set(0);
    this.formError.set('');
    this.formSuccess.set('');
  }

  openGenerateModal(): void {
    this.resetForm();
    this.showGenerateModal.set(true);
  }

  closeGenerateModal(): void {
    this.showGenerateModal.set(false);
  }

  // Submit and save new payslip to API
  submitPayslip(): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.formError.set('');
    this.formSuccess.set('');

    const basic = this.basicSalary();
    const bonus = this.bonuses();
    const deduct = this.deductions();
    const ovt = this.overtime();

    if (basic < 0 || bonus < 0 || deduct < 0 || ovt < 0) {
      this.formError.set('PAYROLL.ERR_MIN_VALUE');
      return;
    }

    this.payrollService.createPayslip({
      employeeId: this.selectedEmployeeId(),
      month: Number(this.selectedMonth()),
      year: Number(this.selectedYear()),
      bonuses: Number(bonus),
      deductions: Number(deduct)
    }).subscribe({
      next: (success) => {
        if (success) {
          this.formSuccess.set('PAYROLL.SUCCESS_GENERATED');
          this.loadData();
          setTimeout(() => {
            this.closeGenerateModal();
          }, 1500);
        } else {
          this.formError.set('حدث خطأ أثناء إصدار كشف الراتب');
        }
      },
      error: (err) => {
        this.formError.set(err.error?.error || 'حدث خطأ أثناء إصدار كشف الراتب');
      }
    });
  }

  // Change Payslip status (Approve / Pay)
  approvePayslip(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.payrollService.approvePayslip(id).subscribe(success => {
      if (success) {
        this.loadData();
        alert(this.translateService.instant('PAYROLL.SUCCESS_APPROVED'));
      }
    });
  }

  payPayslip(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.payrollService.payPayslip(id).subscribe(success => {
      if (success) {
        this.loadData();
        alert(this.translateService.instant('PAYROLL.SUCCESS_PAID'));
      }
    });
  }

  deletePayslip(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    if (confirm(this.translateService.instant('PAYROLL.SUCCESS_DELETED') + '?')) {
      this.payrollService.deletePayslip(id);
    }
  }

  // Open single payslip details (receipt style)
  viewPayslipDetails(slip: Payslip): void {
    this.selectedPayslip.set(slip);
    this.showSlipDetailsModal.set(true);
  }

  closeSlipDetailsModal(): void {
    this.showSlipDetailsModal.set(false);
    this.selectedPayslip.set(null);
  }

  // Print function
  printPayslip(): void {
    window.print();
  }

  // Display utils
  getMonthName(monthNum: number): string {
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const lang = this.translateService.currentLang || 'ar';
    return lang === 'ar' ? monthsAr[monthNum - 1] : monthsEn[monthNum - 1];
  }

  getStatusClass(status: PayslipStatus): string {
    switch (status) {
      case PayslipStatus.Draft: return 'status-draft';
      case PayslipStatus.Approved: return 'status-approved';
      case PayslipStatus.Paid: return 'status-paid';
      default: return '';
    }
  }

  getStatusLabel(status: PayslipStatus): string {
    switch (status) {
      case PayslipStatus.Draft: return 'PAYROLL.STATUS_DRAFT';
      case PayslipStatus.Approved: return 'PAYROLL.STATUS_APPROVED';
      case PayslipStatus.Paid: return 'PAYROLL.STATUS_PAID';
      default: return status;
    }
  }
}
