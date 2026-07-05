using System;
using System.Collections.Generic;
using System.Linq;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;

namespace Dawam.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Seed(DawamDbContext context)
    {
        context.Database.EnsureCreated();

        // 1. Seed Employees if none exist
        if (!context.Employees.Any())
        {
            var employees = new List<Employee>
            {
                new Employee
                {
                    EmployeeNumber = "EMP-1001",
                    FullName = "أحمد محمد العلي",
                    FullNameAr = "أحمد محمد العلي",
                    Email = "employee@dawam.com",
                    Phone = "+962790000001",
                    Address = "عمان، الأردن",
                    DateOfBirth = new DateTime(1990, 5, 12),
                    Gender = Gender.Male,
                    DepartmentId = 1, // IT
                    JobTitle = "Senior Software Engineer",
                    Salary = 9500m,
                    HireDate = new DateTime(2023, 3, 1),
                    ContractType = ContractType.FullTime,
                    Status = EmployeeStatus.Active
                },
                new Employee
                {
                    EmployeeNumber = "EMP-1002",
                    FullName = "سارة خالد الحمد",
                    FullNameAr = "سارة خالد الحمد",
                    Email = "hr@dawam.com",
                    Phone = "+962790000002",
                    Address = "عمان، الأردن",
                    DateOfBirth = new DateTime(1994, 8, 22),
                    Gender = Gender.Female,
                    DepartmentId = 2, // HR
                    JobTitle = "HR Manager",
                    Salary = 7200m,
                    HireDate = new DateTime(2024, 1, 15),
                    ContractType = ContractType.FullTime,
                    Status = EmployeeStatus.Active
                },
                new Employee
                {
                    EmployeeNumber = "EMP-1003",
                    FullName = "فهد عبدالله النجار",
                    FullNameAr = "فهد عبدالله النجار",
                    Email = "manager@dawam.com",
                    Phone = "+962790000003",
                    Address = "إربد، الأردن",
                    DateOfBirth = new DateTime(1988, 11, 30),
                    Gender = Gender.Male,
                    DepartmentId = 1, // IT
                    JobTitle = "IT Manager",
                    Salary = 8000m,
                    HireDate = new DateTime(2022, 6, 1),
                    ContractType = ContractType.FullTime,
                    Status = EmployeeStatus.Active
                },
                new Employee
                {
                    EmployeeNumber = "EMP-1004",
                    FullName = "نورة سعد القحطاني",
                    FullNameAr = "نورة سعد القحطاني",
                    Email = "noura@dawam.com",
                    Phone = "+962790000004",
                    Address = "عمان، الأردن",
                    DateOfBirth = new DateTime(1996, 2, 14),
                    Gender = Gender.Female,
                    DepartmentId = 3, // Finance
                    JobTitle = "Financial Analyst",
                    Salary = 11000m,
                    HireDate = new DateTime(2025, 2, 1),
                    ContractType = ContractType.FullTime,
                    Status = EmployeeStatus.Active
                }
            };

            context.Employees.AddRange(employees);
            context.SaveChanges();

            // Retrieve generated employee IDs
            var empAhmad = context.Employees.First(e => e.EmployeeNumber == "EMP-1001");
            var empSara = context.Employees.First(e => e.EmployeeNumber == "EMP-1002");
            var empFahad = context.Employees.First(e => e.EmployeeNumber == "EMP-1003");
            var empNoura = context.Employees.First(e => e.EmployeeNumber == "EMP-1004");



            // 3. Seed Attendance Records for the last 5 days
            var today = DateTime.UtcNow.Date;
            var attendanceRecords = new List<AttendanceRecord>();

            for (int i = 5; i >= 1; i--)
            {
                var date = today.AddDays(-i);
                if (date.DayOfWeek == DayOfWeek.Friday || date.DayOfWeek == DayOfWeek.Saturday)
                    continue;

                // Ahmad - Present
                attendanceRecords.Add(new AttendanceRecord
                {
                    EmployeeId = empAhmad.Id,
                    Date = date,
                    CheckIn = new TimeSpan(7, 55, 0),
                    CheckOut = new TimeSpan(16, 2, 0),
                    Status = AttendanceStatus.Present,
                    LateMinutes = 0,
                    OvertimeMinutes = 2,
                    Notes = ""
                });

                // Sara - Present
                attendanceRecords.Add(new AttendanceRecord
                {
                    EmployeeId = empSara.Id,
                    Date = date,
                    CheckIn = new TimeSpan(8, 0, 0),
                    CheckOut = new TimeSpan(16, 0, 0),
                    Status = AttendanceStatus.Present,
                    LateMinutes = 0,
                    OvertimeMinutes = 0,
                    Notes = ""
                });

                // Fahad - Late (9:25 AM)
                attendanceRecords.Add(new AttendanceRecord
                {
                    EmployeeId = empFahad.Id,
                    Date = date,
                    CheckIn = new TimeSpan(9, 25, 0),
                    CheckOut = new TimeSpan(16, 10, 0),
                    Status = AttendanceStatus.Late,
                    LateMinutes = 25,
                    OvertimeMinutes = 10,
                    Notes = "Traffic"
                });

                // Noura - Present
                attendanceRecords.Add(new AttendanceRecord
                {
                    EmployeeId = empNoura.Id,
                    Date = date,
                    CheckIn = new TimeSpan(7, 50, 0),
                    CheckOut = new TimeSpan(16, 30, 0),
                    Status = AttendanceStatus.Present,
                    LateMinutes = 0,
                    OvertimeMinutes = 30,
                    Notes = ""
                });
            }

            // Today's attendance - partial
            // Ahmad - Checked in
            attendanceRecords.Add(new AttendanceRecord
            {
                EmployeeId = empAhmad.Id,
                Date = today,
                CheckIn = new TimeSpan(8, 15, 0),
                CheckOut = null,
                Status = AttendanceStatus.Late,
                LateMinutes = 15,
                OvertimeMinutes = 0,
                Notes = "Late checkin"
            });

            // Sara - Checked in
            attendanceRecords.Add(new AttendanceRecord
            {
                EmployeeId = empSara.Id,
                Date = today,
                CheckIn = new TimeSpan(7, 48, 0),
                CheckOut = null,
                Status = AttendanceStatus.Present,
                LateMinutes = 0,
                OvertimeMinutes = 0,
                Notes = ""
            });

            context.AttendanceRecords.AddRange(attendanceRecords);
            context.SaveChanges();

            // 4. Seed Leave Requests
            var leaveRequests = new List<LeaveRequest>
            {
                new LeaveRequest
                {
                    EmployeeId = empAhmad.Id,
                    LeaveType = LeaveType.Annual,
                    StartDate = today.AddDays(-20),
                    EndDate = today.AddDays(-16),
                    TotalDays = 5,
                    Reason = "إجازة سنوية للسفر مع العائلة",
                    Status = LeaveStatus.Approved,
                    ApprovedById = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new LeaveRequest
                {
                    EmployeeId = empSara.Id,
                    LeaveType = LeaveType.Sick,
                    StartDate = today.AddDays(-10),
                    EndDate = today.AddDays(-9),
                    TotalDays = 2,
                    Reason = "مراجعة طبية طارئة وراحة نقاهة",
                    Status = LeaveStatus.Approved,
                    ApprovedById = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-11)
                },
                new LeaveRequest
                {
                    EmployeeId = empFahad.Id,
                    LeaveType = LeaveType.Annual,
                    StartDate = today.AddDays(10),
                    EndDate = today.AddDays(25),
                    TotalDays = 16,
                    Reason = "إجازة زواج وتجهيز المسكن",
                    Status = LeaveStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new LeaveRequest
                {
                    EmployeeId = empNoura.Id,
                    LeaveType = LeaveType.Emergency,
                    StartDate = today.AddDays(-4),
                    EndDate = today.AddDays(-3),
                    TotalDays = 2,
                    Reason = "ظروف عائلية خاصة طارئة جداً",
                    Status = LeaveStatus.Approved,
                    ApprovedById = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            context.LeaveRequests.AddRange(leaveRequests);
            context.SaveChanges();

            // 5. Seed Payslips
            var payslips = new List<Payslip>
            {
                new Payslip
                {
                    EmployeeId = empAhmad.Id,
                    Month = 5,
                    Year = 2026,
                    BasicSalary = empAhmad.Salary,
                    Bonuses = 500m,
                    Deductions = 150m,
                    Overtime = 200m,
                    NetSalary = empAhmad.Salary + 500m - 150m + 200m,
                    Status = PayslipStatus.Paid,
                    GeneratedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Payslip
                {
                    EmployeeId = empSara.Id,
                    Month = 5,
                    Year = 2026,
                    BasicSalary = empSara.Salary,
                    Bonuses = 300m,
                    Deductions = 0m,
                    Overtime = 0m,
                    NetSalary = empSara.Salary + 300m,
                    Status = PayslipStatus.Paid,
                    GeneratedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Payslip
                {
                    EmployeeId = empFahad.Id,
                    Month = 5,
                    Year = 2026,
                    BasicSalary = empFahad.Salary,
                    Bonuses = 0m,
                    Deductions = 100m,
                    Overtime = 150m,
                    NetSalary = empFahad.Salary - 100m + 150m,
                    Status = PayslipStatus.Approved,
                    GeneratedAt = DateTime.UtcNow.AddDays(-30)
                }
            };

            context.Payslips.AddRange(payslips);
            context.SaveChanges();
        }
    }
}
