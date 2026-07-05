using Dawam.Domain.Entities;
using Dawam.Domain.Interfaces;
using Dawam.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Dawam.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly DawamDbContext _ctx;
    public EmployeeRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken ct = default) =>
        await _ctx.Employees.Include(e => e.Department).ToListAsync(ct);

    public async Task<Employee?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.Employees.Include(e => e.Department).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _ctx.Employees.FirstOrDefaultAsync(e => e.Email == email, ct);

    public async Task<bool> EmployeeNumberExistsAsync(string number, CancellationToken ct = default) =>
        await _ctx.Employees.AnyAsync(e => e.EmployeeNumber == number, ct);

    public async Task AddAsync(Employee employee, CancellationToken ct = default) =>
        await _ctx.Employees.AddAsync(employee, ct);

    public void Update(Employee employee) => _ctx.Employees.Update(employee);

    public void Delete(Employee employee) => _ctx.Employees.Remove(employee);
}

public class DepartmentRepository : IDepartmentRepository
{
    private readonly DawamDbContext _ctx;
    public DepartmentRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Department>> GetAllAsync(CancellationToken ct = default) =>
        await _ctx.Departments
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .ToListAsync(ct);

    public async Task<Department?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.Departments
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task AddAsync(Department department, CancellationToken ct = default) =>
        await _ctx.Departments.AddAsync(department, ct);

    public void Update(Department department) => _ctx.Departments.Update(department);

    public void Delete(Department department) => _ctx.Departments.Remove(department);
}

public class LeaveRepository : ILeaveRepository
{
    private readonly DawamDbContext _ctx;
    public LeaveRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<LeaveRequest>> GetAllAsync(CancellationToken ct = default) =>
        await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .Include(l => l.ApprovedBy)
            .ToListAsync(ct);

    public async Task<IEnumerable<LeaveRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default) =>
        await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .Include(l => l.ApprovedBy)
            .Where(l => l.EmployeeId == employeeId)
            .ToListAsync(ct);

    public async Task<LeaveRequest?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .Include(l => l.ApprovedBy)
            .FirstOrDefaultAsync(l => l.Id == id, ct);

    public async Task AddAsync(LeaveRequest leave, CancellationToken ct = default) =>
        await _ctx.LeaveRequests.AddAsync(leave, ct);

    public void Update(LeaveRequest leave) => _ctx.LeaveRequests.Update(leave);

    public void Delete(LeaveRequest leave) => _ctx.LeaveRequests.Remove(leave);
}

public class AttendanceRepository : IAttendanceRepository
{
    private readonly DawamDbContext _ctx;
    public AttendanceRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<AttendanceRecord>> GetAllAsync(CancellationToken ct = default) =>
        await _ctx.AttendanceRecords.Include(a => a.Employee).ToListAsync(ct);

    public async Task<IEnumerable<AttendanceRecord>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default) =>
        await _ctx.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employeeId)
            .ToListAsync(ct);

    public async Task<AttendanceRecord?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.AttendanceRecords.Include(a => a.Employee).FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<AttendanceRecord?> GetByEmployeeAndDateAsync(int employeeId, DateTime date, CancellationToken ct = default) =>
        await _ctx.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date.Date == date.Date, ct);

    public async Task AddAsync(AttendanceRecord record, CancellationToken ct = default) =>
        await _ctx.AttendanceRecords.AddAsync(record, ct);

    public void Update(AttendanceRecord record) => _ctx.AttendanceRecords.Update(record);
}

public class PayrollRepository : IPayrollRepository
{
    private readonly DawamDbContext _ctx;
    public PayrollRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Payslip>> GetAllAsync(CancellationToken ct = default) =>
        await _ctx.Payslips.Include(p => p.Employee).ToListAsync(ct);

    public async Task<IEnumerable<Payslip>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default) =>
        await _ctx.Payslips
            .Include(p => p.Employee)
            .Where(p => p.EmployeeId == employeeId)
            .ToListAsync(ct);

    public async Task<Payslip?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.Payslips.Include(p => p.Employee).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Payslip?> GetByEmployeeMonthYearAsync(int employeeId, int month, int year, CancellationToken ct = default) =>
        await _ctx.Payslips.FirstOrDefaultAsync(p =>
            p.EmployeeId == employeeId && p.Month == month && p.Year == year, ct);

    public async Task AddAsync(Payslip payslip, CancellationToken ct = default) =>
        await _ctx.Payslips.AddAsync(payslip, ct);

    public void Update(Payslip payslip) => _ctx.Payslips.Update(payslip);
}

public class UserRepository : IUserRepository
{
    private readonly DawamDbContext _ctx;
    public UserRepository(DawamDbContext ctx) => _ctx = ctx;

    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _ctx.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<ApplicationUser?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _ctx.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task AddAsync(ApplicationUser user, CancellationToken ct = default) =>
        await _ctx.Users.AddAsync(user, ct);

    public void Update(ApplicationUser user) => _ctx.Users.Update(user);
}
