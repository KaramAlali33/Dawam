export interface MonthlyAttendanceData {
  month: string;
  monthEn: string;
  attendanceRate: number;
  lateRate: number;
  absentRate: number;
}

export interface DepartmentBudgetData {
  department: string;
  departmentEn: string;
  employeeCount: number;
  totalPayroll: number;
  allocatedBudget: number;
}

export interface LeaveBreakdown {
  typeKey: string; // e.g. "REPORTS_PAGE.LEAVE_ANNUAL"
  percentage: number;
  daysCount: number;
  color: string;
}

export interface RecruitmentFunnel {
  applied: number;
  interview: number;
  offered: number;
  hired: number;
}

export interface CompanyMetrics {
  totalMonthlyPayroll: number;
  averageAttendanceRate: number;
  consumedLeaveDays: number;
  newHiresCount: number;
}
