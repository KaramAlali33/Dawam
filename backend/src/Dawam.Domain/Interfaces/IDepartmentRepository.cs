using Dawam.Domain.Entities;

namespace Dawam.Domain.Interfaces;

public interface IDepartmentRepository
{
    Task<IEnumerable<Department>> GetAllAsync(CancellationToken ct = default);
    Task<Department?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Department department, CancellationToken ct = default);
    void Update(Department department);
    void Delete(Department department);
}
