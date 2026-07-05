using Dawam.Application.Common;
using Dawam.Domain.Entities;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Departments;

// DTOs
public record DepartmentDto(int Id, string Name, string NameAr, int? ManagerId, string? ManagerName, int EmployeeCount, string? Description);
public record CreateDepartmentRequest(string Name, string NameAr, int? ManagerId, string? Description);
public record UpdateDepartmentRequest(string? Name, string? NameAr, int? ManagerId, string? Description);

// Queries
public record GetDepartmentsQuery : IRequest<Result<IEnumerable<DepartmentDto>>>;

public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, Result<IEnumerable<DepartmentDto>>>
{
    private readonly IUnitOfWork _uow;
    public GetDepartmentsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<IEnumerable<DepartmentDto>>> Handle(GetDepartmentsQuery request, CancellationToken ct)
    {
        var depts = await _uow.Departments.GetAllAsync(ct);
        var dtos = depts.Select(d => new DepartmentDto(
            d.Id, d.Name, d.NameAr, d.ManagerId,
            d.Manager?.FullName, d.Employees.Count, d.Description));
        return Result<IEnumerable<DepartmentDto>>.Success(dtos);
    }
}

public record GetDepartmentByIdQuery(int Id) : IRequest<Result<DepartmentDto>>;

public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Result<DepartmentDto>>
{
    private readonly IUnitOfWork _uow;
    public GetDepartmentByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<DepartmentDto>> Handle(GetDepartmentByIdQuery request, CancellationToken ct)
    {
        var d = await _uow.Departments.GetByIdAsync(request.Id, ct);
        if (d is null) return Result<DepartmentDto>.Failure("Department not found.");
        return Result<DepartmentDto>.Success(new DepartmentDto(
            d.Id, d.Name, d.NameAr, d.ManagerId,
            d.Manager?.FullName, d.Employees.Count, d.Description));
    }
}

// Commands
public record CreateDepartmentCommand(CreateDepartmentRequest Request) : IRequest<Result<int>>;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;
    public CreateDepartmentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(CreateDepartmentCommand command, CancellationToken ct)
    {
        var dept = new Department
        {
            Name = command.Request.Name,
            NameAr = command.Request.NameAr,
            ManagerId = command.Request.ManagerId,
            Description = command.Request.Description
        };
        await _uow.Departments.AddAsync(dept, ct);
        await _uow.SaveChangesAsync(ct);
        return Result<int>.Success(dept.Id);
    }
}

public record UpdateDepartmentCommand(int Id, UpdateDepartmentRequest Request) : IRequest<Result>;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public UpdateDepartmentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(UpdateDepartmentCommand command, CancellationToken ct)
    {
        var dept = await _uow.Departments.GetByIdAsync(command.Id, ct);
        if (dept is null) return Result.Failure("Department not found.");

        var req = command.Request;
        if (req.Name is not null) dept.Name = req.Name;
        if (req.NameAr is not null) dept.NameAr = req.NameAr;
        if (req.ManagerId.HasValue) dept.ManagerId = req.ManagerId.Value;
        if (req.Description is not null) dept.Description = req.Description;
        dept.UpdatedAt = DateTime.UtcNow;

        _uow.Departments.Update(dept);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public record DeleteDepartmentCommand(int Id) : IRequest<Result>;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public DeleteDepartmentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(DeleteDepartmentCommand command, CancellationToken ct)
    {
        var dept = await _uow.Departments.GetByIdAsync(command.Id, ct);
        if (dept is null) return Result.Failure("Department not found.");
        _uow.Departments.Delete(dept);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
