using Dawam.Application.Common;
using Dawam.Application.Features.Employees.DTOs;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Employees.Commands;

// --- Create ---
public record CreateEmployeeCommand(CreateEmployeeRequest Request) : IRequest<Result<int>>;

public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;
    public CreateEmployeeCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(CreateEmployeeCommand command, CancellationToken ct)
    {
        var req = command.Request;

        if (await _uow.Employees.EmployeeNumberExistsAsync(req.EmployeeNumber, ct))
            return Result<int>.Failure($"Employee number '{req.EmployeeNumber}' already exists.");

        var employee = new Employee
        {
            EmployeeNumber = req.EmployeeNumber,
            FullName = req.FullName,
            FullNameAr = req.FullNameAr,
            Email = req.Email,
            Phone = req.Phone,
            Address = req.Address,
            DateOfBirth = req.DateOfBirth,
            Gender = req.Gender,
            DepartmentId = req.DepartmentId,
            JobTitle = req.JobTitle,
            Salary = req.Salary,
            HireDate = req.HireDate,
            ContractType = req.ContractType,
            Status = EmployeeStatus.Active
        };

        await _uow.Employees.AddAsync(employee, ct);
        await _uow.SaveChangesAsync(ct);

        return Result<int>.Success(employee.Id);
    }
}

// --- Update ---
public record UpdateEmployeeCommand(int Id, UpdateEmployeeRequest Request) : IRequest<Result>;

public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public UpdateEmployeeCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(UpdateEmployeeCommand command, CancellationToken ct)
    {
        var employee = await _uow.Employees.GetByIdAsync(command.Id, ct);
        if (employee is null) return Result.Failure("Employee not found.");

        var req = command.Request;
        if (req.FullName is not null) employee.FullName = req.FullName;
        if (req.FullNameAr is not null) employee.FullNameAr = req.FullNameAr;
        if (req.Phone is not null) employee.Phone = req.Phone;
        if (req.Address is not null) employee.Address = req.Address;
        if (req.JobTitle is not null) employee.JobTitle = req.JobTitle;
        if (req.Salary.HasValue) employee.Salary = req.Salary.Value;
        if (req.DepartmentId.HasValue) employee.DepartmentId = req.DepartmentId.Value;
        if (req.ContractType.HasValue) employee.ContractType = req.ContractType.Value;
        if (req.Status.HasValue) employee.Status = req.Status.Value;
        if (req.Avatar is not null) employee.Avatar = req.Avatar;
        employee.UpdatedAt = DateTime.UtcNow;

        _uow.Employees.Update(employee);
        await _uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}

// --- Delete ---
public record DeleteEmployeeCommand(int Id) : IRequest<Result>;

public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public DeleteEmployeeCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(DeleteEmployeeCommand command, CancellationToken ct)
    {
        var employee = await _uow.Employees.GetByIdAsync(command.Id, ct);
        if (employee is null) return Result.Failure("Employee not found.");

        _uow.Employees.Delete(employee);
        await _uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}
