import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  activeTab = signal<'profile' | 'preferences'>('profile');
  
  // Profile form signals/fields
  fullName = signal('');
  email = signal('');
  newPassword = signal('');
  
  // Status feedback signals
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Preference signals
  themeMode = signal<'light' | 'dark'>('light');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.fullName.set(user.fullName);
      this.email.set(user.email);
    }

    const isDark = this.document.documentElement.classList.contains('dark-mode') 
      || localStorage.getItem('theme') === 'dark';
    this.themeMode.set(isDark ? 'dark' : 'light');
  }

  get currentLang(): string {
    return this.translateService.currentLang || 'ar';
  }

  setTab(tab: 'profile' | 'preferences'): void {
    this.activeTab.set(tab);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  saveProfile(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.fullName() || !this.email()) {
      this.errorMessage.set('LOGIN.ERROR_REQUIRED');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      fullName: this.fullName(),
      email: this.email(),
      newPassword: this.newPassword() || undefined
    };

    this.authService.updateProfile(payload).subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (success) {
          this.successMessage.set('SETTINGS_PAGE.SAVE_SUCCESS');
          this.newPassword.set('');
        } else {
          this.errorMessage.set('SETTINGS_PAGE.SAVE_ERROR');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('SETTINGS_PAGE.SAVE_ERROR');
      }
    });
  }

  changeLanguage(lang: string): void {
    this.translateService.use(lang);
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }

  changeTheme(theme: 'light' | 'dark'): void {
    this.themeMode.set(theme);
    if (theme === 'dark') {
      this.document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      this.document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }
}
