using Dawam.Domain.Entities;

namespace Dawam.Domain.Interfaces;

public interface ILeaveRepository
{
    Task<IEnumerable<LeaveRequest>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<LeaveRequest>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<LeaveRequest?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(LeaveRequest leave, CancellationToken ct = default);
    void Update(LeaveRequest leave);
    void Delete(LeaveRequest leave);
}
