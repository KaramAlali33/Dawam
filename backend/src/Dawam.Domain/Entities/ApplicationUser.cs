using Dawam.Domain.Common;
using Dawam.Domain.Enums;

namespace Dawam.Domain.Entities;

public class ApplicationUser : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Avatar { get; set; }
    public int? EmployeeId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Employee? Employee { get; set; }
}
