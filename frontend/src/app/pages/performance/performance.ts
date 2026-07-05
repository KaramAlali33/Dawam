import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PerformanceService } from '../../core/services/performance.service';
import { AuthService } from '../../core/services/auth.service';
import { PerformanceReview, Goal, GoalStatus, PerformanceStatus, CompetencyScores } from '../../core/models/performance.model';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './performance.html',
  styleUrl: './performance.css'
})
export class PerformanceComponent {
  performanceService = inject(PerformanceService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);

  // Tab control signal
  activeTab = signal<string>('reviews'); // 'reviews' | 'goals'

  // Demoware: toggle active role for easier testing without logging out
  simulationActive = signal<boolean>(false);
  simulatedRole = signal<UserRole | null>(null);

  // Get active user role (either simulated or actual)
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

  // Filters for HR Panel
  searchQuery = signal<string>('');
  statusFilter = signal<string>('ALL');

  // Computed lists and stats
  filteredReviews = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    let list = this.performanceService.reviews();

    if (status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }

    if (query) {
      list = list.filter(r => 
        r.employeeName.toLowerCase().includes(query) || 
        r.department.toLowerCase().includes(query) ||
        r.managerName.toLowerCase().includes(query)
      );
    }

    return list;
  });

  totalReviews = computed(() => this.performanceService.reviews().length);
  
  avgRating = computed(() => {
    const completed = this.performanceService.reviews().filter(r => r.managerRating);
    if (!completed.length) return 0;
    const sum = completed.reduce((acc, curr) => acc + (curr.managerRating || 0), 0);
    return parseFloat((sum / completed.length).toFixed(2));
  });

  pendingReviewsCount = computed(() => {
    return this.performanceService.reviews().filter(r => r.status !== PerformanceStatus.Completed).length;
  });

  highPerformersCount = computed(() => {
    return this.performanceService.reviews().filter(r => r.managerRating && r.managerRating >= 4.5).length;
  });

  // Current single employee review mock for Employee Panel
  employeeReview = computed(() => {
    // Return mock review representing currently logged in employee (e.g. employeeId 102)
    return this.performanceService.reviews().find(r => r.employeeId === 102) || null;
  });

  // Modals state
  showSelfEvalModal = signal<boolean>(false);
  showManagerEvalModal = signal<boolean>(false);
  showGoalModal = signal<boolean>(false);

  // Self Evaluation form data
  selectedSelfReviewId = signal<number | null>(null);
  selfRatingScore = signal<number>(4);
  selfCommentsText = signal<string>('');

  // Manager Evaluation form data
  selectedManagerReviewId = signal<number | null>(null);
  selectedReviewForManager = signal<PerformanceReview | null>(null);
  technicalScore = signal<number>(4);
  communicationScore = signal<number>(4);
  teamworkScore = signal<number>(4);
  leadershipScore = signal<number>(4);
  managerCommentsText = signal<string>('');

  // Add SMART Goal form data
  newGoalTitle = signal<string>('');
  newGoalDesc = signal<string>('');
  newGoalWeight = signal<number>(25);

  // Alert system for simulation
  alertMessage = signal<string>('');
  alertType = signal<'success' | 'info'>('success');

  // Trigger alert box
  showAlert(message: string, type: 'success' | 'info' = 'success'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => this.alertMessage.set(''), 4000);
  }

  // Toggle simulated role for testing (between HR Manager and HR Specialist)
  toggleRole(): void {
    if (!this.simulationActive()) {
      this.simulationActive.set(true);
      const realRole = this.authService.currentUser()?.role;
      if (realRole === UserRole.Admin) {
        this.simulatedRole.set(UserRole.HRManager);
      } else {
        this.simulatedRole.set(UserRole.Admin);
      }
    } else {
      if (this.simulatedRole() === UserRole.Admin) {
        this.simulatedRole.set(UserRole.HRManager);
      } else {
        this.simulatedRole.set(UserRole.Admin);
      }
    }
  }

  // Open self evaluation modal
  openSelfEvaluation(reviewId: number): void {
    const review = this.performanceService.reviews().find(r => r.id === reviewId);
    if (review) {
      this.selectedSelfReviewId.set(reviewId);
      this.selfRatingScore.set(review.selfRating || 4);
      this.selfCommentsText.set(review.selfComments || '');
      this.showSelfEvalModal.set(true);
    }
  }

  // Submit self evaluation
  submitSelfEval(): void {
    const reviewId = this.selectedSelfReviewId();
    if (reviewId !== null) {
      this.performanceService.submitSelfEvaluation(
        reviewId,
        this.selfRatingScore(),
        this.selfCommentsText()
      );
      this.showSelfEvalModal.set(false);
      
      const successMsg = this.translateService.instant('PERFORMANCE_PAGE.SUCCESS_SELF_SUBMITTED');
      this.showAlert(successMsg, 'success');
    }
  }

  // Open manager evaluation modal
  openManagerEvaluation(review: PerformanceReview): void {
    this.selectedManagerReviewId.set(review.id);
    this.selectedReviewForManager.set(review);
    
    if (review.scores) {
      this.technicalScore.set(review.scores.technical);
      this.communicationScore.set(review.scores.communication);
      this.teamworkScore.set(review.scores.teamwork);
      this.leadershipScore.set(review.scores.leadership);
    } else {
      this.technicalScore.set(4);
      this.communicationScore.set(4);
      this.teamworkScore.set(4);
      this.leadershipScore.set(4);
    }
    
    this.managerCommentsText.set(review.managerComments || '');
    this.showManagerEvalModal.set(true);
  }

  // Submit manager evaluation
  submitManagerEval(): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    const reviewId = this.selectedManagerReviewId();
    if (reviewId !== null) {
      const scores: CompetencyScores = {
        technical: this.technicalScore(),
        communication: this.communicationScore(),
        teamwork: this.teamworkScore(),
        leadership: this.leadershipScore()
      };
      
      this.performanceService.submitManagerEvaluation(
        reviewId,
        scores,
        this.managerCommentsText()
      );
      
      this.showManagerEvalModal.set(false);
      
      const successMsg = this.translateService.instant('PERFORMANCE_PAGE.SUCCESS_MANAGER_SUBMITTED');
      this.showAlert(successMsg, 'success');
    }
  }

  // Submit new goal
  submitNewGoal(): void {
    if (!this.newGoalTitle().trim()) return;

    this.performanceService.addGoal({
      title: this.newGoalTitle().trim(),
      description: this.newGoalDesc().trim(),
      weight: this.newGoalWeight()
    });

    this.newGoalTitle.set('');
    this.newGoalDesc.set('');
    this.newGoalWeight.set(25);
    this.showGoalModal.set(false);

    const successMsg = this.translateService.instant('PERFORMANCE_PAGE.GOAL_ADD_SUCCESS');
    this.showAlert(successMsg, 'success');
  }

  // Change goal progress dynamically (interactive simulator)
  adjustGoalProgress(goalId: number, change: number): void {
    const goal = this.performanceService.goals().find(g => g.id === goalId);
    if (goal) {
      let progress = goal.progress + change;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;

      let status = GoalStatus.InProgress;
      if (progress === 0) {
        status = GoalStatus.NotStarted;
      } else if (progress === 100) {
        status = GoalStatus.Completed;
      }

      this.performanceService.updateGoal(goalId, progress, status);
    }
  }
}
