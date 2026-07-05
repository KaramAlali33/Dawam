import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './department-form.html',
  styleUrl: './department-form.css'
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  deptForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  employees = ['عبدالرحمن خالد', 'سارة أحمد', 'محمد النجار', 'نورة سعد'];

  ngOnInit() {
    this.deptForm = this.fb.group({
      name: ['', Validators.required],
      manager: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.deptForm.patchValue({
        name: 'تقنية المعلومات',
        manager: 'عبدالرحمن خالد',
        budget: 150000,
        description: 'مسؤول عن البنية التحتية والبرمجيات'
      });
    }
  }

  onSubmit() {
    if (this.deptForm.invalid) {
      this.deptForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/departments']);
    }, 800);
  }
}
