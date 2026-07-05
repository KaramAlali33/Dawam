using Dawam.Domain.Enums;

namespace Dawam.Application.Features.Auth.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    int UserId,
    string FullName,
    string Email,
    string Role,
    int? EmployeeId
);
