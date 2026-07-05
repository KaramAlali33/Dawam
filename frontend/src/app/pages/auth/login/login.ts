import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslateModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  translateService = inject(TranslateService);
  private document = inject(DOCUMENT);

  email = '';
  password = '';
  errorMessage = signal('');
  isLoading = signal(false);

  selectDemoUser(role: string): void {
    if (role === 'manager') {
      this.email = 'admin@dawam.com';
      this.password = 'Admin@123';
    } else if (role === 'employee') {
      this.email = 'hr@dawam.com';
      this.password = 'Admin@123';
    }
  }

  get currentLang(): string {
    return this.translateService.currentLang || 'ar';
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translateService.use(newLang);
    this.document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = newLang;
    localStorage.setItem('lang', newLang);
  }

  onSubmit(): void {
    this.errorMessage.set('');
    if (!this.email || !this.password) {
      this.errorMessage.set('LOGIN.ERROR_REQUIRED');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('LOGIN.ERROR_INVALID');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('LOGIN.ERROR_INVALID');
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '313268932155-dn51bpbvsjvre049nf8oonvhudj1h2bo.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: 380 }
      );
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    if (response.credential) {
      this.isLoading.set(true);
      this.authService.googleLogin(response.credential).subscribe({
        next: (success) => {
          this.isLoading.set(false);
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage.set('فشل تسجيل الدخول بواسطة Google. يرجى المحاولة لاحقاً.');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('حدث خطأ أثناء الاتصال بالخادم.');
        }
      });
    }
  }
}
