using Dawam.Application.Common;
using Dawam.Application.Features.Employees.DTOs;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Employees.Queries;

// --- Get All ---
public record GetEmployeesQuery : IRequest<Result<IEnumerable<EmployeeDto>>>;

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, Result<IEnumerable<EmployeeDto>>>
{
    private readonly IUnitOfWork _uow;
    public GetEmployeesQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<IEnumerable<EmployeeDto>>> Handle(GetEmployeesQuery request, CancellationToken ct)
    {
        var employees = await _uow.Employees.GetAllAsync(ct);
        var dtos = employees.Select(e => new EmployeeDto(
            e.Id, e.EmployeeNumber, e.FullName, e.FullNameAr,
            e.Email, e.Phone, e.Address,
            e.DateOfBirth.ToString("yyyy-MM-dd"),
            e.Gender.ToString(),
            e.DepartmentId, e.Department?.Name,
            e.JobTitle, e.Salary,
            e.HireDate.ToString("yyyy-MM-dd"),
            e.ContractType.ToString(), e.Status.ToString(), e.Avatar
        ));
        return Result<IEnumerable<EmployeeDto>>.Success(dtos);
    }
}

// --- Get By Id ---
public record GetEmployeeByIdQuery(int Id) : IRequest<Result<EmployeeDto>>;

public class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, Result<EmployeeDto>>
{
    private readonly IUnitOfWork _uow;
    public GetEmployeeByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<EmployeeDto>> Handle(GetEmployeeByIdQuery request, CancellationToken ct)
    {
        var e = await _uow.Employees.GetByIdAsync(request.Id, ct);
        if (e is null) return Result<EmployeeDto>.Failure("Employee not found.");

        return Result<EmployeeDto>.Success(new EmployeeDto(
            e.Id, e.EmployeeNumber, e.FullName, e.FullNameAr,
            e.Email, e.Phone, e.Address,
            e.DateOfBirth.ToString("yyyy-MM-dd"),
            e.Gender.ToString(),
            e.DepartmentId, e.Department?.Name,
            e.JobTitle, e.Salary,
            e.HireDate.ToString("yyyy-MM-dd"),
            e.ContractType.ToString(), e.Status.ToString(), e.Avatar
        ));
    }
}
