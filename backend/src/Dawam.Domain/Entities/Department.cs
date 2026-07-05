using Dawam.Domain.Common;

namespace Dawam.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public int? ManagerId { get; set; }
    public string? Description { get; set; }

    // Navigation
    public Employee? Manager { get; set; }
    public ICollection<Employee> Employees { get; set; } = [];
}
