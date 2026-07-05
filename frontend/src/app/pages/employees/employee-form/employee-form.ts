import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);

  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  isSubmitting = false;

  departments = ['تقنية المعلومات', 'الموارد البشرية', 'المالية', 'التسويق', 'المبيعات'];

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  private initForm() {
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      jobTitle: ['', Validators.required],
      department: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      hireDate: ['', Validators.required],
      contractType: ['FullTime', Validators.required],
      gender: ['Male', Validators.required]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = +id;
      this.employeeService.getById(this.employeeId).subscribe(emp => {
        const deptNames: { [key: number]: string } = {
          1: 'تقنية المعلومات',
          2: 'الموارد البشرية',
          3: 'المالية',
          4: 'التسويق',
          5: 'المبيعات'
        };
        this.employeeForm.patchValue({
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          jobTitle: emp.jobTitle,
          department: deptNames[emp.departmentId] || 'تقنية المعلومات',
          salary: emp.salary,
          hireDate: emp.hireDate,
          contractType: emp.contractType,
          gender: emp.gender
        });
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.employeeForm.value;

    const deptIds: { [key: string]: number } = {
      'تقنية المعلومات': 1,
      'الموارد البشرية': 2,
      'المالية': 3,
      'التسويق': 4,
      'المبيعات': 5
    };

    const payload = {
      employeeNumber: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      fullName: formVal.fullName,
      fullNameAr: formVal.fullName,
      email: formVal.email,
      phone: formVal.phone,
      address: 'عمان، الأردن',
      dateOfBirth: '1995-01-01',
      gender: formVal.gender,
      departmentId: deptIds[formVal.department] || 1,
      jobTitle: formVal.jobTitle,
      salary: formVal.salary,
      hireDate: formVal.hireDate,
      contractType: formVal.contractType
    };

    const observer = {
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.isSubmitting = false;
        alert('حدث خطأ أثناء حفظ البيانات');
      }
    };

    if (this.isEditMode && this.employeeId) {
      this.employeeService.update(this.employeeId, payload).subscribe(observer);
    } else {
      this.employeeService.create(payload).subscribe(observer);
    }
  }
}
