using Dawam.Domain.Common;
using Dawam.Domain.Enums;

namespace Dawam.Domain.Entities;

public class LeaveRequest : BaseEntity
{
    public int EmployeeId { get; set; }
    public LeaveType LeaveType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public int? ApprovedById { get; set; }

    // Navigation
    public Employee Employee { get; set; } = null!;
    public Employee? ApprovedBy { get; set; }
}
