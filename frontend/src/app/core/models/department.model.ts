export interface Department {
  id: number;
  name: string;
  nameAr: string;
  managerId?: number;
  managerName?: string;
  employeeCount: number;
  description?: string;
}
