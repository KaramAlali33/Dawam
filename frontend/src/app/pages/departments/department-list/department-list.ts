import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css'
})
export class DepartmentListComponent {
  departments = signal([
    { id: 1, name: 'تقنية المعلومات', manager: 'عبدالرحمن خالد', employeeCount: 42, budget: 150000 },
    { id: 2, name: 'الموارد البشرية', manager: 'سارة أحمد', employeeCount: 18, budget: 85000 },
    { id: 3, name: 'المالية', manager: 'محمد النجار', employeeCount: 25, budget: 120000 },
    { id: 4, name: 'التسويق', manager: 'نورة سعد', employeeCount: 31, budget: 200000 }
  ]);

  deleteDepartment(id: number) {
    if(confirm('هل أنت متأكد من حذف هذا القسم؟ (Are you sure you want to delete this department?)')) {
      this.departments.update(deps => deps.filter(d => d.id !== id));
    }
  }
}
