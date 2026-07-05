using Dawam.Application.Common;
using Dawam.Application.Features.Auth.DTOs;
using Dawam.Application.Interfaces;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponse>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwtService;

    public LoginCommandHandler(IUnitOfWork uow, IJwtTokenService jwtService)
    {
        _uow = uow;
        _jwtService = jwtService;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByEmailAsync(request.Email, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result<LoginResponse>.Failure("Invalid email or password.");

        if (!user.IsActive)
            return Result<LoginResponse>.Failure("Account is disabled.");

        var token = _jwtService.GenerateToken(user);

        return Result<LoginResponse>.Success(new LoginResponse(
            token,
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.EmployeeId
        ));
    }
}
