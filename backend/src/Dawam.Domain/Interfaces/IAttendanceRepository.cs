using Dawam.Domain.Entities;

namespace Dawam.Domain.Interfaces;

public interface IAttendanceRepository
{
    Task<IEnumerable<AttendanceRecord>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<AttendanceRecord>> GetByEmployeeAsync(int employeeId, CancellationToken ct = default);
    Task<AttendanceRecord?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<AttendanceRecord?> GetByEmployeeAndDateAsync(int employeeId, DateTime date, CancellationToken ct = default);
    Task AddAsync(AttendanceRecord record, CancellationToken ct = default);
    void Update(AttendanceRecord record);
}
