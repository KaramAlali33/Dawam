using Dawam.Domain.Entities;

namespace Dawam.Domain.Interfaces;

public interface IPayrollRepository
{
    Task<IEnumerable<Payslip>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<Payslip>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<Payslip?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Payslip?> GetByEmployeeMonthYearAsync(int employeeId, int month, int year, CancellationToken ct = default);
    Task AddAsync(Payslip payslip, CancellationToken ct = default);
    void Update(Payslip payslip);
}
