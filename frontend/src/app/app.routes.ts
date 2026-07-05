import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (no sidebar)
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent)
      }
    ]
  },

  // Main app routes (with sidebar + header)
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/employees/employee-list/employee-list').then(m => m.EmployeeListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/employees/employee-form/employee-form').then(m => m.EmployeeFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/employees/employee-profile/employee-profile').then(m => m.EmployeeProfileComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/employees/employee-form/employee-form').then(m => m.EmployeeFormComponent)
          }
        ]
      },
      {
        path: 'departments',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/departments/department-list/department-list').then(m => m.DepartmentListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/departments/department-form/department-form').then(m => m.DepartmentFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/departments/department-form/department-form').then(m => m.DepartmentFormComponent)
          }
        ]
      },
      {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance').then(m => m.AttendanceComponent)
      },
      {
        path: 'leaves',
        loadComponent: () => import('./pages/leaves/leaves').then(m => m.LeavesComponent)
      },
      {
        path: 'payroll',
        loadComponent: () => import('./pages/payroll/payroll').then(m => m.PayrollComponent)
      },
      {
        path: 'recruitment',
        loadComponent: () => import('./pages/recruitment/recruitment').then(m => m.RecruitmentComponent)
      },
      {
        path: 'performance',
        loadComponent: () => import('./pages/performance/performance').then(m => m.PerformanceComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/coming-soon/coming-soon').then(m => m.ComingSoonComponent)
      }
    ]
  },

  // Default redirects
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
