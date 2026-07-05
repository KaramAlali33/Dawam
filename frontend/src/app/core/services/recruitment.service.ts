import { Injectable, signal } from '@angular/core';
import { JobPosting, Candidate, JobType, JobStatus, CandidateStatus } from '../models/recruitment.model';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  // Pre-populated mock Job openings
  private initialJobs: JobPosting[] = [
    {
      id: 1,
      title: 'مهندس برمجيات أول (Senior Angular Developer)',
      department: 'تقنية المعلومات',
      type: JobType.FullTime,
      status: JobStatus.Active,
      applicantsCount: 3,
      createdAt: '2026-05-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'أخصائي موارد بشرية (HR Specialist)',
      department: 'الموارد البشرية',
      type: JobType.FullTime,
      status: JobStatus.Active,
      applicantsCount: 2,
      createdAt: '2026-05-10T08:30:00Z'
    },
    {
      id: 3,
      title: 'محلل مالي (Financial Analyst)',
      department: 'المالية',
      type: JobType.FullTime,
      status: JobStatus.Closed,
      applicantsCount: 4,
      createdAt: '2026-04-15T11:00:00Z'
    },
    {
      id: 4,
      title: 'مصمم واجهات ومجسمات (UI/UX Designer)',
      department: 'التصميم والتطوير',
      type: JobType.Remote,
      status: JobStatus.Active,
      applicantsCount: 1,
      createdAt: '2026-05-20T14:20:00Z'
    }
  ];

  // Pre-populated mock candidates
  private initialCandidates: Candidate[] = [
    {
      id: 1,
      jobId: 1,
      jobTitle: 'مهندس برمجيات أول (Senior Angular Developer)',
      fullName: 'خالد إبراهيم الدوسري',
      email: 'khaled@email.com',
      phone: '+962791234567',
      status: CandidateStatus.Interview,
      rating: 4,
      appliedAt: '2026-05-03T09:00:00Z',
      cvSummary: 'خبرة 6 سنوات في بناء تطبيقات الويب باستخدام Angular 15+, و RxJS. يمتلك مهارات قيادة قوية.',
      notes: 'المقابلة الأولى ممتازة، متمكن من التقنيات وحل المشكلات البنائية.'
    },
    {
      id: 2,
      jobId: 1,
      jobTitle: 'مهندس برمجيات أول (Senior Angular Developer)',
      fullName: 'هدى ناصر الحربي',
      email: 'huda@email.com',
      phone: '+962788765432',
      status: CandidateStatus.Applied,
      rating: 3,
      appliedAt: '2026-05-05T14:15:00Z',
      cvSummary: 'مهندسة ويب متخصصة بالواجهات الأمامية، خبرة 4 سنوات في Angular و CSS Grid.',
      notes: 'بحاجة لتحديد موعد مقابلة فنية أولى.'
    },
    {
      id: 3,
      jobId: 2,
      jobTitle: 'أخصائي موارد بشرية (HR Specialist)',
      fullName: 'عمر فهد السبيعي',
      email: 'omar@email.com',
      phone: '+962799988776',
      status: CandidateStatus.Offered,
      rating: 5,
      appliedAt: '2026-05-12T11:00:00Z',
      cvSummary: 'ماجستير إدارة موارد بشرية، خبرة 5 سنوات في التوظيف وبناء سياسات العمل والاحتفاظ بالموظفين.',
      notes: 'تم إرسال عرض العمل المالي وبانتظار الموافقة الرسمية.'
    },
    {
      id: 4,
      jobId: 2,
      jobTitle: 'أخصائي موارد بشرية (HR Specialist)',
      fullName: 'لمى خالد الزهراني',
      email: 'lama@email.com',
      phone: '+962777665544',
      status: CandidateStatus.Rejected,
      rating: 2,
      appliedAt: '2026-05-14T10:30:00Z',
      cvSummary: 'خبرة سنتين في إدارة المكاتب والسكرتاريا، المعرفة بالموارد البشرية محدودة.',
      notes: 'الخبرة الميدانية في التوظيف غير كافية للشغل الحالي.'
    },
    {
      id: 5,
      jobId: 4,
      jobTitle: 'مصمم واجهات ومجسمات (UI/UX Designer)',
      fullName: 'منى حسن العتيبي',
      email: 'mona@email.com',
      phone: '+962791112223',
      status: CandidateStatus.Interview,
      rating: 5,
      appliedAt: '2026-05-22T08:15:00Z',
      cvSummary: 'مصممة واجهات مبدعة، تمتلك معرض أعمال فخم في Behance يشمل تطبيقات مالية وإدارية.',
      notes: 'تصميماتها فنية وعصرية جداً، مقابلة الواجهة مجدولة يوم غد.'
    },
    {
      id: 6,
      jobId: 1,
      jobTitle: 'مهندس برمجيات أول (Senior Angular Developer)',
      fullName: 'يوسف سلمان المطيري',
      email: 'yousef@email.com',
      phone: '+962781112233',
      status: CandidateStatus.Hired,
      rating: 5,
      appliedAt: '2026-05-02T12:00:00Z',
      cvSummary: 'مطور أول متكامل، خبرة 8 سنوات، متمكن من الواجهات وخدمات NodeJS السحابية.',
      notes: 'تم قبول العرض والتعيين الرسمي، يباشر العمل مطلع الشهر القادم.'
    }
  ];

  // Signals representing reactive states
  jobs = signal<JobPosting[]>(this.initialJobs);
  candidates = signal<Candidate[]>(this.initialCandidates);

  // Post a new job opening
  createJobPosting(job: Omit<JobPosting, 'id' | 'applicantsCount' | 'createdAt'>): void {
    const newJob: JobPosting = {
      ...job,
      id: this.jobs().length + 1,
      applicantsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.jobs.update(jList => [newJob, ...jList]);
  }

  // Toggle Job posting status (Open / Close)
  updateJobStatus(id: number, status: JobStatus): void {
    this.jobs.update(jList => jList.map(j => {
      if (j.id === id) {
        return { ...j, status };
      }
      return j;
    }));
  }

  // Refer a candidate or Apply internally (Employee / Internal Referrals)
  createCandidate(candidate: Omit<Candidate, 'id' | 'status' | 'appliedAt' | 'rating'>): void {
    const newCand: Candidate = {
      ...candidate,
      id: this.candidates().length + 1,
      status: CandidateStatus.Applied,
      rating: 3, // Default mid rating
      appliedAt: new Date().toISOString()
    };

    // 1. Update candidates list
    this.candidates.update(cList => [newCand, ...cList]);

    // 2. Increment applicant count for the job posting
    this.jobs.update(jList => jList.map(j => {
      if (j.id === candidate.jobId) {
        return {
          ...j,
          applicantsCount: j.applicantsCount + 1
        };
      }
      return j;
    }));
  }

  // Promote Candidate through the Pipeline stage
  promoteCandidate(id: number): void {
    this.candidates.update(cList => cList.map(cand => {
      if (cand.id === id) {
        let nextStatus = cand.status;
        if (cand.status === CandidateStatus.Applied) {
          nextStatus = CandidateStatus.Interview;
        } else if (cand.status === CandidateStatus.Interview) {
          nextStatus = CandidateStatus.Offered;
        } else if (cand.status === CandidateStatus.Offered) {
          nextStatus = CandidateStatus.Hired;
        }
        
        return {
          ...cand,
          status: nextStatus
        };
      }
      return cand;
    }));
  }

  // Reject Candidate
  rejectCandidate(id: number): void {
    this.candidates.update(cList => cList.map(cand => {
      if (cand.id === id) {
        return {
          ...cand,
          status: CandidateStatus.Rejected
        };
      }
      return cand;
    }));
  }

  // Update star Rating (1-5)
  updateCandidateRating(id: number, rating: number): void {
    this.candidates.update(cList => cList.map(cand => {
      if (cand.id === id) {
        return {
          ...cand,
          rating
        };
      }
      return cand;
    }));
  }
}
