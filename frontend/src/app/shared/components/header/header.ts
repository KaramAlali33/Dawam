import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  showUserMenu = signal(false);
  showNotifications = signal(false);
  pageTitle = signal('NAV.DASHBOARD');
  isDarkMode = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });

    // التعرف على المسار الحالي عند أول تحميل للمكون
    this.updatePageTitle(this.router.url);
    
    // Check initial dark mode state
    const isDark = localStorage.getItem('theme') === 'dark';
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    }
  }

  private updatePageTitle(url: string): void {
    if (url.includes('/employees')) {
      this.pageTitle.set('NAV.EMPLOYEES');
    } else if (url.includes('/departments')) {
      this.pageTitle.set('NAV.DEPARTMENTS');
    } else if (url.includes('/attendance')) {
      this.pageTitle.set('NAV.ATTENDANCE');
    } else if (url.includes('/leaves')) {
      this.pageTitle.set('NAV.LEAVES');
    } else if (url.includes('/payroll')) {
      this.pageTitle.set('NAV.PAYROLL');
    } else if (url.includes('/recruitment')) {
      this.pageTitle.set('NAV.RECRUITMENT');
    } else if (url.includes('/performance')) {
      this.pageTitle.set('NAV.PERFORMANCE');
    } else if (url.includes('/documents')) {
      this.pageTitle.set('NAV.DOCUMENTS');
    } else if (url.includes('/notifications')) {
      this.pageTitle.set('NAV.NOTIFICATIONS');
    } else if (url.includes('/reports')) {
      this.pageTitle.set('NAV.REPORTS');
    } else if (url.includes('/settings')) {
      this.pageTitle.set('NAV.SETTINGS');
    } else {
      this.pageTitle.set('NAV.DASHBOARD');
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

  toggleDarkMode(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    this.showUserMenu.set(false);
    this.router.navigate(['/settings']);
  }
}
