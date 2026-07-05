using Dawam.Domain.Entities;

namespace Dawam.Domain.Interfaces;

public interface IUserRepository
{
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<ApplicationUser?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(ApplicationUser user, CancellationToken ct = default);
    void Update(ApplicationUser user);
}
