import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequest, LeaveType, LeaveStatus } from '../../core/models/leave.model';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './leaves.html',
  styleUrl: './leaves.css'
})
export class LeavesComponent implements OnInit {
  leaveService = inject(LeaveService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);

  // Core signals for list filters
  activeFilter = signal<string>('all');
  searchQuery = signal<string>('');

  // Demoware: toggle active role for easier testing without logging out
  simulationActive = signal<boolean>(false);
  simulatedRole = signal<UserRole | null>(null);

  // Modal display signal
  showRequestModal = signal<boolean>(false);

  // Form input signals
  selectedLeaveType = signal<LeaveType>(LeaveType.Annual);
  startDate = signal<string>('');
  endDate = signal<string>('');
  reason = signal<string>('');
  formError = signal<string>('');
  formSuccess = signal<string>('');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();

    this.leaveService.loadRequests(isHR ? undefined : empId).subscribe();
    if (empId) {
      this.leaveService.loadBalance(empId).subscribe();
    }
  }

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
    return role === UserRole.Admin || role === UserRole.HRManager;
  });

  // Retrieve current active user details
  activeUserId = computed<number>(() => {
    const user = this.authService.currentUser();
    return user ? (user.employeeId || user.id) : 1;
  });

  activeUserName = computed<string>(() => {
    const user = this.authService.currentUser();
    return user ? user.fullName : 'أحمد محمد العلي';
  });

  // Calculate dynamic active balance
  userBalance = computed(() => {
    const balance = this.leaveService.userBalance();
    if (balance) return balance;
    return {
      employeeId: this.activeUserId(),
      annual: 21,
      annualUsed: 0,
      sick: 14,
      sickUsed: 0,
      emergency: 5,
      emergencyUsed: 0
    };
  });

  // Compute calculated days for the leave request in progress
  requestedDays = computed<number>(() => {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate < startDate) return 0;

    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  });

  // Filter requests reactively
  filteredRequests = computed<LeaveRequest[]>(() => {
    let reqs = this.leaveService.requests();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();
    const isHR = this.isAdminOrHR();
    const empId = this.activeUserId();

    if (!isHR) {
      reqs = reqs.filter(r => r.employeeId === empId);
    }

    // 2. Apply status filter
    if (filter !== 'all') {
      reqs = reqs.filter(r => r.status.toLowerCase() === filter);
    }

    // 3. Apply search query
    if (query) {
      reqs = reqs.filter(r => 
        (r.employeeName || '').toLowerCase().includes(query) ||
        (r.reason || '').toLowerCase().includes(query)
      );
    }

    return reqs;
  });

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  // Toggle simulated role for testing (between HR Manager and Employee)
  toggleSimulatedRole(): void {
    if (!this.simulationActive()) {
      this.simulationActive.set(true);
      const realRole = this.authService.currentUser()?.role;
      if (realRole === UserRole.Admin || realRole === UserRole.HRManager) {
        this.simulatedRole.set(UserRole.Employee);
      } else {
        this.simulatedRole.set(UserRole.Admin);
      }
    } else {
      this.simulationActive.set(false);
      this.simulatedRole.set(null);
    }
    this.loadData();
  }

  // Reset form inputs
  resetForm(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.reason.set('');
    this.selectedLeaveType.set(LeaveType.Annual);
    this.formError.set('');
    this.formSuccess.set('');
  }

  openModal(): void {
    this.resetForm();
    this.showRequestModal.set(true);
  }

  closeModal(): void {
    this.showRequestModal.set(false);
  }

  // Submit request to API
  submitRequest(): void {
    this.formError.set('');
    this.formSuccess.set('');

    const start = this.startDate();
    const end = this.endDate();
    const type = this.selectedLeaveType();
    const rsn = this.reason().trim();

    if (!start || !end || !rsn) {
      this.formError.set('LEAVE.ERR_REQUIRED');
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (startDate < today) {
      this.formError.set('LEAVE.ERR_START_PAST');
      return;
    }

    if (endDate < startDate) {
      this.formError.set('LEAVE.ERR_END_BEFORE_START');
      return;
    }

    const days = this.requestedDays();
    const balance = this.userBalance();
    let available = 0;

    if (type === LeaveType.Annual) {
      available = balance.annual - balance.annualUsed;
    } else if (type === LeaveType.Sick) {
      available = balance.sick - balance.sickUsed;
    } else if (type === LeaveType.Emergency) {
      available = balance.emergency - balance.emergencyUsed;
    }

    if (days > available) {
      this.formError.set('LEAVE.ERR_INSUFFICIENT_BALANCE');
      return;
    }

    this.leaveService.createRequest({
      employeeId: this.activeUserId(),
      leaveType: type,
      startDate: start,
      endDate: end,
      reason: rsn
    }).subscribe({
      next: (success) => {
        if (success) {
          this.formSuccess.set('LEAVE.SUCCESS_CREATED');
          this.loadData();
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        } else {
          this.formError.set('LEAVE.ERR_INSUFFICIENT_BALANCE');
        }
      },
      error: () => {
        this.formError.set('LEAVE.ERR_INSUFFICIENT_BALANCE');
      }
    });
  }

  // Approve a request
  approveRequest(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    const adminUser = this.authService.currentUser();
    const adminId = adminUser ? adminUser.id : 1;
    
    this.leaveService.approveRequest(id, adminId).subscribe(success => {
      if (success) {
        this.loadData();
        alert(this.translateService.instant('LEAVE.SUCCESS_APPROVED'));
      }
    });
  }

  // Reject a request
  rejectRequest(id: number): void {
    if (!this.isAdminOrHR()) {
      alert('غير مصرح: هذه العملية لمدير الموارد البشرية فقط.');
      return;
    }
    this.leaveService.rejectRequest(id).subscribe(success => {
      if (success) {
        this.loadData();
        alert(this.translateService.instant('LEAVE.SUCCESS_REJECTED'));
      }
    });
  }

  // Cancel/delete request (local fallback)
  cancelRequest(id: number): void {
    if (confirm(this.translateService.instant('LEAVE.SUCCESS_CANCELED') + '?')) {
      // Since API might not support cancel, we just do local fallback
      this.leaveService.requests.update(reqs => reqs.filter(r => r.id !== id));
    }
  }

  // Formatting utilities
  getLeaveTypeLabel(type: LeaveType): string {
    switch (type) {
      case LeaveType.Annual: return 'LEAVE.ANNUAL';
      case LeaveType.Sick: return 'LEAVE.SICK';
      case LeaveType.Emergency: return 'LEAVE.EMERGENCY';
      default: return type;
    }
  }

  getLeaveTypeClass(type: LeaveType): string {
    switch (type) {
      case LeaveType.Annual: return 'type-annual';
      case LeaveType.Sick: return 'type-sick';
      case LeaveType.Emergency: return 'type-emergency';
      default: return '';
    }
  }

  getStatusClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.Pending: return 'status-pending';
      case LeaveStatus.Approved: return 'status-approved';
      case LeaveStatus.Rejected: return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.Pending: return 'LEAVE.PENDING_APPROVAL';
      case LeaveStatus.Approved: return 'LEAVE.APPROVED';
      case LeaveStatus.Rejected: return 'LEAVE.REJECTED';
      default: return status;
    }
  }
}
