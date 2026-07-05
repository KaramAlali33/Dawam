using Dawam.Domain.Common;
using Dawam.Domain.Enums;

namespace Dawam.Domain.Entities;

public class Employee : BaseEntity
{
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? FullNameAr { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public int DepartmentId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public DateTime HireDate { get; set; }
    public ContractType ContractType { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public string? Avatar { get; set; }

    // Navigation
    public Department Department { get; set; } = null!;
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = [];
    public ICollection<Payslip> Payslips { get; set; } = [];
}
