export interface JobPosting {
  id: number;
  title: string;
  department: string;
  type: JobType;
  status: JobStatus;
  applicantsCount: number;
  createdAt: string;
}

export interface Candidate {
  id: number;
  jobId: number;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  rating: number; // 1-5 rating scale
  appliedAt: string;
  notes?: string;
  cvSummary?: string;
}

export enum JobType {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  Remote = 'Remote',
  Internship = 'Internship'
}

export enum JobStatus {
  Active = 'Active',
  Closed = 'Closed',
  Draft = 'Draft'
}

export enum CandidateStatus {
  Applied = 'Applied',
  Interview = 'Interview',
  Offered = 'Offered',
  Rejected = 'Rejected',
  Hired = 'Hired'
}
