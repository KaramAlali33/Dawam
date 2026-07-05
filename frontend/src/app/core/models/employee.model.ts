export interface Employee {
  id: number;
  employeeNumber: string;
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: Gender;
  departmentId: number;
  departmentName?: string;
  jobTitle: string;
  salary: number;
  hireDate: string;
  contractType: ContractType;
  status: EmployeeStatus;
  avatar?: string;
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum ContractType {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  Contract = 'Contract',
  Temporary = 'Temporary'
}

export enum EmployeeStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  Terminated = 'Terminated'
}
