import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  employees = signal<any[]>([]);

  searchQuery = signal('');

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe(data => {
      this.employees.set(data.map(e => ({
        id: e.id,
        name: e.fullName,
        position: e.jobTitle,
        department: e.departmentName || 'General',
        email: e.email,
        status: 'STATUS.' + e.status.toUpperCase(),
        statusCode: e.status
      })));
    });
  }

  deleteEmployee(id: number) {
    if(confirm('هل أنت متأكد من حذف هذا الموظف؟ (Are you sure?)')) {
      this.employeeService.delete(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => {
          alert('لا يمكن حذف الموظف لوجود سجلات حضور أو رواتب أو إجازات مرتبطة به في النظام.');
        }
      });
    }
  }
}
