import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportsService } from '../../core/services/reports.service';
import { AuthService } from '../../core/services/auth.service';
import { MonthlyAttendanceData, DepartmentBudgetData, LeaveBreakdown, RecruitmentFunnel, CompanyMetrics } from '../../core/models/reports.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  reportsService = inject(ReportsService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);

  // Simulation switcher: true is HR Manager, false is Standard HR (HR عادي)
  isHRManagerMode = signal<boolean>(true);

  // Filtering signals
  selectedDept = signal<string>('ALL');
  selectedCycle = signal<string>('2026');

  // Interactive Toast alert
  alertMessage = signal<string>('');

  // Current Date Generated (Formatted in Arabic/English)
  get generatedDate(): string {
    const locale = this.translateService.currentLang === 'ar' ? 'ar-EG' : 'en-US';
    return new Date().toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Toggles role switcher for review demo
  toggleRole(): void {
    this.isHRManagerMode.update(val => !val);
  }

  // Handle department filter update
  onDeptChange(dept: string): void {
    this.selectedDept.set(dept);
    this.reportsService.simulateDepartmentFilter(dept);
  }

  // Trigger pdf / print layout exporter
  printReport(): void {
    const msg = this.translateService.instant('REPORTS_PAGE.SUCCESS_ALERT');
    this.alertMessage.set(msg);
    
    setTimeout(() => {
      this.alertMessage.set('');
      window.print();
    }, 2000);
  }
}
