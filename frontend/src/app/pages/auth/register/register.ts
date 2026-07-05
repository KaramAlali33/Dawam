import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  roles = [
    { value: UserRole.Admin, label: 'مدير النظام (Admin)' },
    { value: UserRole.HRManager, label: 'مدير الموارد البشرية (HR Manager)' },
    { value: UserRole.Employee, label: 'موظف (Employee)' }
  ];

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.Employee, Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (success) {
          this.successMessage.set('تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة تسجيل الدخول...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage.set('فشل إنشاء الحساب. قد يكون البريد الإلكتروني مسجل مسبقاً.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('حدث خطأ أثناء الاتصال بالخادم.');
      }
    });
  }
}
