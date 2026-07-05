using Dawam.Domain.Interfaces;
using Dawam.Infrastructure.Persistence;
using Dawam.Infrastructure.Repositories;

namespace Dawam.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly DawamDbContext _ctx;

    public IEmployeeRepository Employees { get; }
    public IDepartmentRepository Departments { get; }
    public ILeaveRepository Leaves { get; }
    public IAttendanceRepository Attendance { get; }
    public IPayrollRepository Payroll { get; }
    public IUserRepository Users { get; }

    public UnitOfWork(DawamDbContext ctx)
    {
        _ctx = ctx;
        Employees = new EmployeeRepository(ctx);
        Departments = new DepartmentRepository(ctx);
        Leaves = new LeaveRepository(ctx);
        Attendance = new AttendanceRepository(ctx);
        Payroll = new PayrollRepository(ctx);
        Users = new UserRepository(ctx);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _ctx.SaveChangesAsync(ct);
}
