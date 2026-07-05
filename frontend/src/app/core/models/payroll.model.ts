export interface Payslip {
  id: number;
  employeeId: number;
  employeeName?: string;
  month: number;
  year: number;
  basicSalary: number;
  bonuses: number;
  deductions: number;
  overtime: number;
  netSalary: number;
  status: PayslipStatus;
  generatedAt: string;
}

export enum PayslipStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Paid = 'Paid'
}
