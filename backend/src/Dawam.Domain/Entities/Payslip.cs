using Dawam.Domain.Common;
using Dawam.Domain.Enums;

namespace Dawam.Domain.Entities;

public class Payslip : BaseEntity
{
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Bonuses { get; set; }
    public decimal Deductions { get; set; }
    public decimal Overtime { get; set; }
    public decimal NetSalary { get; set; }
    public PayslipStatus Status { get; set; } = PayslipStatus.Draft;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Employee Employee { get; set; } = null!;
}
