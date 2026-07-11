using Dawam.Application.Common;
using Dawam.Domain.Interfaces;
using Dawam.Application.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Auth.Commands;

public record UpdateProfileRequest(
    string FullName,
    string Email,
    string? NewPassword
);

public record UpdateProfileCommand(UpdateProfileRequest Request) : IRequest<Result<bool>>;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<bool>>
{
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProfileCommandHandler(IUnitOfWork uow, ICurrentUserService currentUserService)
    {
        _uow = uow;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(UpdateProfileCommand command, CancellationToken ct)
    {
        var req = command.Request;
        var userId = _currentUserService.UserId;

        if (userId <= 0)
            return Result<bool>.Failure("User is not authenticated.");

        var user = await _uow.Users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<bool>.Failure("User not found.");

        if (user.Email != req.Email)
        {
            var existingUser = await _uow.Users.GetByEmailAsync(req.Email, ct);
            if (existingUser is not null)
                return Result<bool>.Failure("Email address is already in use.");
        }

        user.FullName = req.FullName;
        user.Email = req.Email;

        if (!string.IsNullOrWhiteSpace(req.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        }

        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
