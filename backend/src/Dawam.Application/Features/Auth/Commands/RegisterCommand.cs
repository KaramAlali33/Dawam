using Dawam.Application.Common;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Auth.Commands;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    UserRole Role
);

public record RegisterCommand(RegisterRequest Request) : IRequest<Result<int>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;

    public RegisterCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(RegisterCommand command, CancellationToken ct)
    {
        var req = command.Request;

        var existingUser = await _uow.Users.GetByEmailAsync(req.Email, ct);
        if (existingUser is not null)
            return Result<int>.Failure("Email address is already in use.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        var user = new ApplicationUser
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = passwordHash,
            Role = req.Role,
            IsActive = true
        };

        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return Result<int>.Success(user.Id);
    }
}
