using Dawam.Domain.Enums;

namespace Dawam.Application.Features.Employees.DTOs;

public record EmployeeDto(
    int Id,
    string EmployeeNumber,
    string FullName,
    string? FullNameAr,
    string Email,
    string Phone,
    string Address,
    string DateOfBirth,
    string Gender,
    int DepartmentId,
    string? DepartmentName,
    string JobTitle,
    decimal Salary,
    string HireDate,
    string ContractType,
    string Status,
    string? Avatar
);

public record CreateEmployeeRequest(
    string EmployeeNumber,
    string FullName,
    string? FullNameAr,
    string Email,
    string Phone,
    string Address,
    DateTime DateOfBirth,
    Gender Gender,
    int DepartmentId,
    string JobTitle,
    decimal Salary,
    DateTime HireDate,
    ContractType ContractType
);

public record UpdateEmployeeRequest(
    string? FullName,
    string? FullNameAr,
    string? Phone,
    string? Address,
    string? JobTitle,
    decimal? Salary,
    int? DepartmentId,
    ContractType? ContractType,
    EmployeeStatus? Status,
    string? Avatar
);
