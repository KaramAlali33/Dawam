import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { AuthService } from '../../core/services/auth.service';
import { JobPosting, Candidate, JobType, JobStatus, CandidateStatus } from '../../core/models/recruitment.model';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './recruitment.html',
  styleUrl: './recruitment.css'
})
export class RecruitmentComponent {
  recruitmentService = inject(RecruitmentService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);

  // Tab & search signals
  activeTab = signal<string>('jobs'); // 'jobs' | 'applicants'
  activeFilter = signal<string>('all');
  searchQuery = signal<string>('');

  // Demoware: toggle simulated role
  simulationActive = signal<boolean>(false);
  simulatedRole = signal<UserRole | null>(null);

  // Modal signals
  showCreateJobModal = signal<boolean>(false);
  showReferralModal = signal<boolean>(false);
  showCandidateModal = signal<boolean>(false);

  selectedCandidate = signal<Candidate | null>(null);
  selectedJobForReferral = signal<JobPosting | null>(null);

  // Form input signals (Create Job)
  newJobTitle = signal<string>('');
  newJobDept = signal<string>('تقنية المعلومات');
  newJobType = signal<JobType>(JobType.FullTime);

  // Form input signals (Referral / Apply)
  candName = signal<string>('');
  candEmail = signal<string>('');
  candPhone = signal<string>('');
  referralNotes = signal<string>('');

  formError = signal<string>('');
  formSuccess = signal<string>('');

  // Get active role (simulated or real)
  currentUserRole = computed<UserRole>(() => {
    if (this.simulationActive() && this.simulatedRole()) {
      return this.simulatedRole()!;
    }
    const user = this.authService.currentUser();
    return user ? user.role : UserRole.HRManager;
  });

  // Check if current view is HR Manager (Admin)
  isAdminOrHR = computed<boolean>(() => {
    const role = this.currentUserRole();
    return role === UserRole.Admin;
  });

  // Dynamic statistics
  totalJobsCount = computed<number>(() => {
    return this.recruitmentService.jobs().filter(j => j.status === JobStatus.Active).length;
  });

  activeApplicantsCount = computed<number>(() => {
    return this.recruitmentService.candidates()
      .filter(c => c.status !== CandidateStatus.Hired && c.status !== CandidateStatus.Rejected).length;
  });

  scheduledInterviewsCount = computed<number>(() => {
    return this.recruitmentService.candidates()
      .filter(c => c.status === CandidateStatus.Interview).length;
  });

  closedJobsCount = computed<number>(() => {
    return this.recruitmentService.jobs().filter(j => j.status === JobStatus.Closed).length;
  });

  // Filtered Job openings reactively
  filteredJobs = computed<JobPosting[]>(() => {
    let jList = this.recruitmentService.jobs();
    const query = this.searchQuery().trim().toLowerCase();

    // 2. Apply search query
    if (query) {
      jList = jList.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.department.toLowerCase().includes(query)
      );
    }

    return jList;
  });

  // Filtered Candidates reactively
  filteredCandidates = computed<Candidate[]>(() => {
    let cList = this.recruitmentService.candidates();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    // 1. Status Filter
    if (filter !== 'all') {
      cList = cList.filter(c => c.status.toLowerCase() === filter);
    }

    // 2. Search query
    if (query) {
      cList = cList.filter(c => 
        c.fullName.toLowerCase().includes(query) ||
        c.jobTitle.toLowerCase().includes(query) ||
        (c.notes || '').toLowerCase().includes(query)
      );
    }

    return cList;
  });

  setTab(tab: string): void {
    this.activeTab.set(tab);
    this.searchQuery.set(''); // Clear search on tab switch
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  // Toggles simulation role (between HR Manager and HR Specialist)
  toggleSimulatedRole(): void {
    if (!this.simulationActive()) {
      this.simulationActive.set(true);
      const realRole = this.authService.currentUser()?.role;
      if (realRole === UserRole.Admin) {
        this.simulatedRole.set(UserRole.HRManager);
      } else {
        this.simulatedRole.set(UserRole.Admin);
      }
    } else {
      this.simulationActive.set(false);
      this.simulatedRole.set(null);
    }
  }

  // Modals management (Create Job)
  openCreateJobModal(): void {
    this.newJobTitle.set('');
    this.newJobDept.set('تقنية المعلومات');
    this.newJobType.set(JobType.FullTime);
    this.formError.set('');
    this.formSuccess.set('');
    this.showCreateJobModal.set(true);
  }

  closeCreateJobModal(): void {
    this.showCreateJobModal.set(false);
  }

  submitJobOpening(): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.formError.set('');
    this.formSuccess.set('');

    const title = this.newJobTitle().trim();
    if (!title) {
      this.formError.set('EMPLOYEE.ERROR_REQUIRED');
      return;
    }

    this.recruitmentService.createJobPosting({
      title,
      department: this.newJobDept(),
      type: this.newJobType(),
      status: JobStatus.Active
    });

    this.formSuccess.set('RECRUITMENT.SUCCESS_JOB_CREATED');
    setTimeout(() => {
      this.closeCreateJobModal();
    }, 1500);
  }

  // Modals management (Referral / Apply Internally)
  openReferralModal(job: JobPosting): void {
    this.selectedJobForReferral.set(job);
    this.candName.set('');
    this.candEmail.set('');
    this.candPhone.set('');
    this.referralNotes.set('');
    this.formError.set('');
    this.formSuccess.set('');
    this.showReferralModal.set(true);
  }

  closeReferralModal(): void {
    this.showReferralModal.set(false);
    this.selectedJobForReferral.set(null);
  }

  submitReferral(): void {
    this.formError.set('');
    this.formSuccess.set('');

    const name = this.candName().trim();
    const email = this.candEmail().trim();
    const phone = this.candPhone().trim();
    const notes = this.referralNotes().trim();
    const job = this.selectedJobForReferral();

    if (!name || !email || !phone || !notes || !job) {
      this.formError.set('EMPLOYEE.ERROR_REQUIRED');
      return;
    }

    this.recruitmentService.createCandidate({
      jobId: job.id,
      jobTitle: job.title,
      fullName: name,
      email,
      phone,
      cvSummary: notes,
      notes: 'ترشيح داخلي مقدم عبر بوابة الموظفين.'
    });

    this.formSuccess.set('RECRUITMENT.SUCCESS_APPLIED');
    setTimeout(() => {
      this.closeReferralModal();
    }, 1500);
  }

  // Modals management (Candidate profile)
  openCandidateModal(cand: Candidate): void {
    this.selectedCandidate.set(cand);
    this.showCandidateModal.set(true);
  }

  closeCandidateModal(): void {
    this.showCandidateModal.set(false);
    this.selectedCandidate.set(null);
  }

  // Candidate pipeline management (Promote / Reject / Rate)
  promoteCandidate(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.recruitmentService.promoteCandidate(id);
    
    // Refresh modal data if currently viewing
    const cand = this.recruitmentService.candidates().find(c => c.id === id);
    if (cand) {
      this.selectedCandidate.set(cand);
    }
    
    alert(this.translateService.instant('RECRUITMENT.SUCCESS_PROMOTED'));
  }

  rejectCandidate(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.recruitmentService.rejectCandidate(id);
    
    const cand = this.recruitmentService.candidates().find(c => c.id === id);
    if (cand) {
      this.selectedCandidate.set(cand);
    }
    
    alert(this.translateService.instant('RECRUITMENT.SUCCESS_REJECTED'));
  }

  rateCandidate(id: number, stars: number): void {
    this.recruitmentService.updateCandidateRating(id, stars);
    
    const cand = this.recruitmentService.candidates().find(c => c.id === id);
    if (cand) {
      this.selectedCandidate.set(cand);
    }
  }

  closeJobPosting(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    if (confirm(this.translateService.instant('RECRUITMENT.SUCCESS_JOB_CLOSED') + '?')) {
      this.recruitmentService.updateJobStatus(id, JobStatus.Closed);
    }
  }

  reopenJobPosting(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.recruitmentService.updateJobStatus(id, JobStatus.Active);
  }

  // Display utils
  getJobTypeLabel(type: JobType): string {
    switch (type) {
      case JobType.FullTime: return 'RECRUITMENT.JOB_TYPE_FT';
      case JobType.PartTime: return 'RECRUITMENT.JOB_TYPE_PT';
      case JobType.Remote: return 'RECRUITMENT.JOB_TYPE_REMOTE';
      case JobType.Internship: return 'RECRUITMENT.JOB_TYPE_INT';
      default: return type;
    }
  }

  getJobTypeClass(type: JobType): string {
    switch (type) {
      case JobType.FullTime: return 'type-ft';
      case JobType.PartTime: return 'type-pt';
      case JobType.Remote: return 'type-remote';
      case JobType.Internship: return 'type-int';
      default: return '';
    }
  }

  getJobStatusClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.Active: return 'status-active';
      case JobStatus.Closed: return 'status-closed';
      case JobStatus.Draft: return 'status-draft';
      default: return '';
    }
  }

  getJobStatusLabel(status: JobStatus): string {
    switch (status) {
      case JobStatus.Active: return 'RECRUITMENT.JOB_STATUS_ACTIVE';
      case JobStatus.Closed: return 'RECRUITMENT.JOB_STATUS_CLOSED';
      case JobStatus.Draft: return 'RECRUITMENT.JOB_STATUS_DRAFT';
      default: return status;
    }
  }

  getCandidateStatusClass(status: CandidateStatus): string {
    switch (status) {
      case CandidateStatus.Applied: return 'status-applied';
      case CandidateStatus.Interview: return 'status-interview';
      case CandidateStatus.Offered: return 'status-offered';
      case CandidateStatus.Rejected: return 'status-rejected';
      case CandidateStatus.Hired: return 'status-hired';
      default: return '';
    }
  }

  getCandidateStatusLabel(status: CandidateStatus): string {
    switch (status) {
      case CandidateStatus.Applied: return 'RECRUITMENT.STATUS_APPLIED';
      case CandidateStatus.Interview: return 'RECRUITMENT.STATUS_INTERVIEW';
      case CandidateStatus.Offered: return 'RECRUITMENT.STATUS_OFFERED';
      case CandidateStatus.Rejected: return 'RECRUITMENT.STATUS_REJECTED';
      case CandidateStatus.Hired: return 'RECRUITMENT.STATUS_HIRED';
      default: return status;
    }
  }
}
