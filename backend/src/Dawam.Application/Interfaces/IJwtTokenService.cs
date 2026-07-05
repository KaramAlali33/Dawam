using Dawam.Domain.Entities;

namespace Dawam.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(ApplicationUser user);
}
