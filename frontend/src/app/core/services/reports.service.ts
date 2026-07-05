import { Injectable, signal } from '@angular/core';
import { MonthlyAttendanceData, DepartmentBudgetData, LeaveBreakdown, RecruitmentFunnel, CompanyMetrics } from '../models/reports.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  // Mock database of monthly attendance records (RTL / LTR supported)
  private initialAttendance: MonthlyAttendanceData[] = [
    { month: 'كانون الثاني', monthEn: 'January', attendanceRate: 94.2, lateRate: 4.5, absentRate: 1.3 },
    { month: 'شباط', monthEn: 'February', attendanceRate: 95.8, lateRate: 3.2, absentRate: 1.0 },
    { month: 'آذار', monthEn: 'March', attendanceRate: 93.1, lateRate: 5.1, absentRate: 1.8 },
    { month: 'نيسان', monthEn: 'April', attendanceRate: 96.5, lateRate: 2.8, absentRate: 0.7 },
    { month: 'أيار', monthEn: 'May', attendanceRate: 97.2, lateRate: 2.1, absentRate: 0.7 }
  ];

  // Mock budgets for departments in Jordanian Dinars (JOD)
  private initialBudgets: DepartmentBudgetData[] = [
    { department: 'تقنية المعلومات', departmentEn: 'IT Department', employeeCount: 12, totalPayroll: 18500, allocatedBudget: 22000 },
    { department: 'الموارد البشرية', departmentEn: 'Human Resources', employeeCount: 4, totalPayroll: 5400, allocatedBudget: 6000 },
    { department: 'المالية', departmentEn: 'Finance & Accounts', employeeCount: 3, totalPayroll: 4800, allocatedBudget: 5500 },
    { department: 'التصميم والتطوير', departmentEn: 'Design & UX', employeeCount: 5, totalPayroll: 7200, allocatedBudget: 8500 },
    { department: 'الإدارة والمكاتب', departmentEn: 'Administration', employeeCount: 2, totalPayroll: 3100, allocatedBudget: 3500 }
  ];

  // Mock leave categories allocation breakdown
  private initialLeaves: LeaveBreakdown[] = [
    { typeKey: 'REPORTS_PAGE.LEAVE_ANNUAL', percentage: 60, daysCount: 144, color: 'var(--primary-color)' },
    { typeKey: 'REPORTS_PAGE.LEAVE_SICK', percentage: 22, daysCount: 53, color: '#ca8a04' },
    { typeKey: 'REPORTS_PAGE.LEAVE_UNPAID', percentage: 10, daysCount: 24, color: '#ef4444' },
    { typeKey: 'REPORTS_PAGE.LEAVE_COMPASSIONATE', percentage: 8, daysCount: 19, color: '#8b5cf6' }
  ];

  // Mock candidate flow statistics
  private initialFunnel: RecruitmentFunnel = {
    applied: 145,
    interview: 38,
    offered: 12,
    hired: 8
  };

  // Corporate overall aggregated indicators
  private initialMetrics: CompanyMetrics = {
    totalMonthlyPayroll: 39000,
    averageAttendanceRate: 95.36,
    consumedLeaveDays: 240,
    newHiresCount: 8
  };

  // Signals to expose state reactively
  attendanceData = signal<MonthlyAttendanceData[]>(this.initialAttendance);
  departmentBudgets = signal<DepartmentBudgetData[]>(this.initialBudgets);
  leavesBreakdown = signal<LeaveBreakdown[]>(this.initialLeaves);
  recruitmentFunnel = signal<RecruitmentFunnel>(this.initialFunnel);
  companyMetrics = signal<CompanyMetrics>(this.initialMetrics);

  // Method to filter/update metrics reactively (simulation support)
  simulateDepartmentFilter(deptName: string): void {
    if (deptName === 'ALL') {
      this.attendanceData.set(this.initialAttendance);
      this.companyMetrics.set(this.initialMetrics);
    } else {
      // Scale down or adjust slightly to simulate filtering
      const factor = deptName === 'تقنية المعلومات' ? 1.02 : 0.95;
      
      this.attendanceData.set(this.initialAttendance.map(item => ({
        ...item,
        attendanceRate: Math.min(100, parseFloat((item.attendanceRate * factor).toFixed(1))),
        lateRate: parseFloat((item.lateRate * (2 - factor)).toFixed(1)),
        absentRate: parseFloat((item.absentRate * (2 - factor)).toFixed(1))
      })));

      const budget = this.initialBudgets.find(b => b.department === deptName || b.departmentEn === deptName);
      if (budget) {
        this.companyMetrics.set({
          totalMonthlyPayroll: budget.totalPayroll,
          averageAttendanceRate: Math.min(100, parseFloat((this.initialMetrics.averageAttendanceRate * factor).toFixed(2))),
          consumedLeaveDays: Math.round(this.initialMetrics.consumedLeaveDays * (budget.employeeCount / 26)),
          newHiresCount: Math.round(this.initialMetrics.newHiresCount * (budget.employeeCount / 26))
        });
      }
    }
  }
}
