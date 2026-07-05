import { Injectable, signal } from '@angular/core';
import { PerformanceReview, Goal, GoalStatus, PerformanceStatus, CompetencyScores } from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  // Mock database of performance reviews for the company
  private initialReviews: PerformanceReview[] = [
    {
      id: 1,
      employeeId: 101,
      employeeName: 'خالد إبراهيم الدوسري',
      department: 'تقنية المعلومات',
      reviewCycle: 'السنوي 2025',
      managerName: 'أحمد محمود العلي',
      selfRating: 4,
      managerRating: 4.5,
      selfComments: 'أشعر أنني قدمت أداءً متميزاً هذا العام وساهمت في تدشين عدة مشاريع بنجاح.',
      managerComments: 'خالد مطور استثنائي، ملتزم جداً ويقدم كوداً عالي الجودة. ننصح بترقيته للمستوى الأعلى.',
      status: PerformanceStatus.Completed,
      scores: {
        technical: 5,
        communication: 4,
        teamwork: 5,
        leadership: 4
      },
      updatedAt: '2026-05-15T09:00:00Z'
    },
    {
      id: 2,
      employeeId: 102,
      employeeName: 'لمى خالد الزهراني',
      department: 'الموارد البشرية',
      reviewCycle: 'الربع الأول 2026',
      managerName: 'فاطمة محمد الحربي',
      status: PerformanceStatus.PendingSelf,
      updatedAt: '2026-05-20T11:30:00Z'
    },
    {
      id: 3,
      employeeId: 103,
      employeeName: 'عمر فهد السبيعي',
      department: 'المالية',
      reviewCycle: 'الربع الأول 2026',
      managerName: 'عبد الله سليمان البشير',
      selfRating: 4,
      selfComments: 'أتممت إعداد الحسابات الختامية بدقة متناهية ودون أي تأخير هذا الربع.',
      status: PerformanceStatus.PendingManager,
      updatedAt: '2026-05-25T14:15:00Z'
    },
    {
      id: 4,
      employeeId: 104,
      employeeName: 'هدى ناصر الحربي',
      department: 'التصميم والتطوير',
      reviewCycle: 'الربع الأول 2026',
      managerName: 'أحمد محمود العلي',
      status: PerformanceStatus.Draft,
      updatedAt: '2026-05-28T10:00:00Z'
    }
  ];

  // Mock list of current SMART Goals / KPIs (for Employee view)
  private initialGoals: Goal[] = [
    {
      id: 1,
      title: 'تحسين سرعة تحميل الصفحة الرئيسية (Speed Index)',
      description: 'رفع سرعة استجابة الموقع بنسبة 30% من خلال ضغط الموارد والتحميل الكسول وتخفيف ملفات CSS.',
      weight: 30,
      progress: 85,
      status: GoalStatus.InProgress
    },
    {
      id: 2,
      title: 'تطوير وتدشين 3 صفحات فرعية تفاعلية فخمة',
      description: 'إنجاز وبرمجة لوحات الإجازات، الرواتب، والتوظيف بمعايير بصرية فائقة وربطها بالترجمات بالكامل.',
      weight: 40,
      progress: 100,
      status: GoalStatus.Completed
    },
    {
      id: 3,
      title: 'إتمام دورة القيادة الفنية والتواصل الفعال للمهندسين',
      description: 'حضور الدورة المعتمدة وحل الاختبار النهائي لتأهيل قيادة المشاريع البرمجية المستقبلية.',
      weight: 30,
      progress: 40,
      status: GoalStatus.InProgress
    }
  ];

  // Signals for reactive state
  reviews = signal<PerformanceReview[]>(this.initialReviews);
  goals = signal<Goal[]>(this.initialGoals);

  // Submit Self Evaluation (Employee flow)
  submitSelfEvaluation(reviewId: number, selfRating: number, selfComments: string): void {
    this.reviews.update(items => items.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          selfRating,
          selfComments,
          status: PerformanceStatus.PendingManager,
          updatedAt: new Date().toISOString()
        };
      }
      return rev;
    }));
  }

  // Submit Manager Evaluation (Manager flow)
  submitManagerEvaluation(reviewId: number, scores: CompetencyScores, managerComments: string): void {
    // Calculate overall rating as arithmetic average of core competencies
    const average = (scores.technical + scores.communication + scores.teamwork + scores.leadership) / 4;
    
    this.reviews.update(items => items.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          scores,
          managerComments,
          managerRating: parseFloat(average.toFixed(2)),
          status: PerformanceStatus.Completed,
          updatedAt: new Date().toISOString()
        };
      }
      return rev;
    }));
  }

  // Create a brand new SMART Goal (Employee/Manager action)
  addGoal(goal: Omit<Goal, 'id' | 'progress' | 'status'>): void {
    const newGoal: Goal = {
      ...goal,
      id: this.goals().length + 1,
      progress: 0,
      status: GoalStatus.NotStarted
    };
    this.goals.update(items => [...items, newGoal]);
  }

  // Update an existing goal's progress and status
  updateGoal(id: number, progress: number, status: GoalStatus): void {
    this.goals.update(items => items.map(g => {
      if (g.id === id) {
        return {
          ...g,
          progress,
          status
        };
      }
      return g;
    }));
  }
}
