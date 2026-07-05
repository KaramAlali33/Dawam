namespace Dawam.Domain.Interfaces;

public interface IUnitOfWork
{
    IEmployeeRepository Employees { get; }
    IDepartmentRepository Departments { get; }
    ILeaveRepository Leaves { get; }
    IAttendanceRepository Attendance { get; }
    IPayrollRepository Payroll { get; }
    IUserRepository Users { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
