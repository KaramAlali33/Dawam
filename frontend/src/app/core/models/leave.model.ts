export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: number;
  approvedByName?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: number;
  annual: number;
  annualUsed: number;
  sick: number;
  sickUsed: number;
  emergency: number;
  emergencyUsed: number;
}

export enum LeaveType {
  Annual = 'Annual',
  Sick = 'Sick',
  Emergency = 'Emergency'
}

export enum LeaveStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}
