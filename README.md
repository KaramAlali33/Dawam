# دوام - نظام إدارة الموارد البشرية | Dawam HR Management System

**Dawam (دوام)** is a modern, enterprise-ready Human Resources (HR) and workforce management platform. Built with a clean architecture on the backend and a reactive, signals-based architecture on the frontend, it empowers organizations to manage employee lifecycles, attendance tracking, leaves, and payroll processing.

---

## 🌟 Key Features

- **📊 Dynamic Dashboard**: Role-based views displaying aggregate stats (working days, present, late, on leave) for Admins/HR Managers, or personal attendance summaries and leave balances for regular Employees.
- **👥 Employee Directory & Profiles**: Comprehensive employee profiles featuring basic details, job contracts, visual avatar support, and strict role-based access control protecting sensitive information like salaries.
- **🕒 Attendance Tracking (Check-In/Out)**: Real-time attendance logging. Regular employees can Check-In and Check-Out directly from the web client. System automatically calculates late minutes (against a 9:00 AM start) and overtime.
- **✈️ Leave Management**: Request submission (Annual, Sick, Emergency) for employees with live-computed remaining balances. HR Managers can approve/reject requests directly in-app.
- **💵 Payroll Processing**: Automatic payslip generation. HR can calculate net salary based on basic salary, dynamic overtime hours, bonuses, and deductions, followed by approval and payment workflows.
- **🌐 Multilingual & RTL Support**: Localized in **Arabic (العربية)** and **English** with custom-made RTL/LTR responsive layouts.

---

## 🛠️ Tech Stack

### Backend
- **Core**: C# / .NET 10.0 Web API
- **Architecture**: Clean Architecture / Clean Domain / CQRS Pattern (via MediatR)
- **Database Access**: Entity Framework Core with Repository & Unit of Work Patterns
- **Database**: SQLite (automatic migration & initial data seeding)
- **Authentication**: JWT (JSON Web Tokens) with secure password hashing (BCrypt)

### Frontend
- **Framework**: Angular 18 (Standalone Components, signals-based state management)
- **Styling**: Vanilla CSS custom variables design system (supporting dark/light theme properties)
- **Localization**: `@ngx-translate/core` for runtime language switching
- **Client routing**: Component-based Guards (checking Auth and Roles)

---

## 🚀 Setup & Installation

### Prerequisites
- [.NET SDK 10.0](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

### 1. Running the Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run the project:
   ```bash
   dotnet run --project src/Dawam.API
   ```
   *Note: On startup, the system automatically creates the SQLite database (`dawam.db`), applies Entity Framework migrations, and seeds the database with initial department, employee, attendance, and payroll records.*
   - API URL: `http://localhost:5116`
   - Default Administrator Credentials: `admin@dawam.com` / `Admin@123`

### 2. Running the Frontend Angular Application
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   - App URL: `http://localhost:4200`
