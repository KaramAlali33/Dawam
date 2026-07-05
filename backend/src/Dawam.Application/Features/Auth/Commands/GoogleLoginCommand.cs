using Dawam.Application.Common;
using Dawam.Application.Features.Auth.DTOs;
using Dawam.Application.Interfaces;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using Google.Apis.Auth;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Dawam.Application.Features.Auth.Commands;

public record GoogleLoginRequest(string IdToken);

public record GoogleLoginCommand(GoogleLoginRequest Request) : IRequest<Result<LoginResponse>>;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, Result<LoginResponse>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwtService;
    private readonly IConfiguration _config;

    public GoogleLoginCommandHandler(IUnitOfWork uow, IJwtTokenService jwtService, IConfiguration config)
    {
        _uow = uow;
        _jwtService = jwtService;
        _config = config;
    }

    public async Task<Result<LoginResponse>> Handle(GoogleLoginCommand command, CancellationToken ct)
    {
        var idToken = command.Request.IdToken;

        try
        {
            var googleClientId = _config["Google:ClientId"];
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            
            if (!string.IsNullOrEmpty(googleClientId) && googleClientId != "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
            {
                settings.Audience = new[] { googleClientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (payload == null)
                return Result<LoginResponse>.Failure("Invalid Google token payload.");

            // Check if user exists
            var user = await _uow.Users.GetByEmailAsync(payload.Email, ct);
            if (user == null)
            {
                // Register user dynamically if first time logging in
                user = new ApplicationUser
                {
                    FullName = payload.Name ?? payload.Email,
                    Email = payload.Email,
                    PasswordHash = string.Empty, // External auth users don't have local password hash
                    Role = UserRole.Employee, // Default role for Google login users
                    IsActive = true
                };

                await _uow.Users.AddAsync(user, ct);
                await _uow.SaveChangesAsync(ct);
            }

            if (!user.IsActive)
                return Result<LoginResponse>.Failure("Account is disabled.");

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);

            var response = new LoginResponse(
                token,
                user.Id,
                user.FullName,
                user.Email,
                user.Role.ToString(),
                user.EmployeeId
            );

            return Result<LoginResponse>.Success(response);
        }
        catch (InvalidJwtException ex)
        {
            return Result<LoginResponse>.Failure($"Google token verification failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            return Result<LoginResponse>.Failure($"An error occurred during Google sign-in: {ex.Message}");
        }
    }
}
