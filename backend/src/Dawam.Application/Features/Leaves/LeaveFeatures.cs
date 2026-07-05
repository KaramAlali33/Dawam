using Dawam.Application.Common;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Leaves;

// DTOs
public record LeaveRequestDto(
    int Id, int EmployeeId, string? EmployeeName,
    string LeaveType, string StartDate, string EndDate,
    int TotalDays, string Reason, string Status,
    int? ApprovedById, string? ApprovedByName, string CreatedAt
);

public record LeaveBalanceDto(
    int EmployeeId,
    int Annual, int AnnualUsed,
    int Sick, int SickUsed,
    int Emergency, int EmergencyUsed
);

public record CreateLeaveRequestRequest(
    int EmployeeId, LeaveType LeaveType,
    DateTime StartDate, DateTime EndDate,
    string Reason
);

// Queries
public record GetLeaveRequestsQuery(int? EmployeeId = null) : IRequest<Result<IEnumerable<LeaveRequestDto>>>;

public class GetLeaveRequestsQueryHandler : IRequestHandler<GetLeaveRequestsQuery, Result<IEnumerable<LeaveRequestDto>>>
{
    private readonly IUnitOfWork _uow;
    public GetLeaveRequestsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<IEnumerable<LeaveRequestDto>>> Handle(GetLeaveRequestsQuery request, CancellationToken ct)
    {
        var leaves = request.EmployeeId.HasValue
            ? await _uow.Leaves.GetByEmployeeAsync(request.EmployeeId.Value, ct)
            : await _uow.Leaves.GetAllAsync(ct);

        var dtos = leaves.Select(l => new LeaveRequestDto(
            l.Id, l.EmployeeId, l.Employee?.FullName,
            l.LeaveType.ToString(),
            l.StartDate.ToString("yyyy-MM-dd"),
            l.EndDate.ToString("yyyy-MM-dd"),
            l.TotalDays, l.Reason, l.Status.ToString(),
            l.ApprovedById, l.ApprovedBy?.FullName,
            l.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
        ));
        return Result<IEnumerable<LeaveRequestDto>>.Success(dtos);
    }
}

public record GetLeaveBalanceQuery(int EmployeeId) : IRequest<Result<LeaveBalanceDto>>;

public class GetLeaveBalanceQueryHandler : IRequestHandler<GetLeaveBalanceQuery, Result<LeaveBalanceDto>>
{
    private readonly IUnitOfWork _uow;
    public GetLeaveBalanceQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<LeaveBalanceDto>> Handle(GetLeaveBalanceQuery request, CancellationToken ct)
    {
        var leaves = await _uow.Leaves.GetByEmployeeAsync(request.EmployeeId, ct);
        var approved = leaves.Where(l => l.Status == LeaveStatus.Approved).ToList();

        var dto = new LeaveBalanceDto(
            request.EmployeeId,
            Annual: 21, AnnualUsed: approved.Where(l => l.LeaveType == LeaveType.Annual).Sum(l => l.TotalDays),
            Sick: 14, SickUsed: approved.Where(l => l.LeaveType == LeaveType.Sick).Sum(l => l.TotalDays),
            Emergency: 5, EmergencyUsed: approved.Where(l => l.LeaveType == LeaveType.Emergency).Sum(l => l.TotalDays)
        );
        return Result<LeaveBalanceDto>.Success(dto);
    }
}

// Commands
public record CreateLeaveRequestCommand(CreateLeaveRequestRequest Request) : IRequest<Result<int>>;

public class CreateLeaveRequestCommandHandler : IRequestHandler<CreateLeaveRequestCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;
    public CreateLeaveRequestCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(CreateLeaveRequestCommand command, CancellationToken ct)
    {
        var req = command.Request;
        var totalDays = (int)(req.EndDate - req.StartDate).TotalDays + 1;

        var leave = new LeaveRequest
        {
            EmployeeId = req.EmployeeId,
            LeaveType = req.LeaveType,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            TotalDays = totalDays,
            Reason = req.Reason,
            Status = LeaveStatus.Pending
        };

        await _uow.Leaves.AddAsync(leave, ct);
        await _uow.SaveChangesAsync(ct);
        return Result<int>.Success(leave.Id);
    }
}

public record ApproveLeaveCommand(int Id, int ApproverId) : IRequest<Result>;

public class ApproveLeaveCommandHandler : IRequestHandler<ApproveLeaveCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public ApproveLeaveCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(ApproveLeaveCommand command, CancellationToken ct)
    {
        var leave = await _uow.Leaves.GetByIdAsync(command.Id, ct);
        if (leave is null) return Result.Failure("Leave request not found.");
        if (leave.Status != LeaveStatus.Pending) return Result.Failure("Only pending requests can be approved.");

        leave.Status = LeaveStatus.Approved;
        leave.ApprovedById = command.ApproverId;
        leave.UpdatedAt = DateTime.UtcNow;

        _uow.Leaves.Update(leave);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public record RejectLeaveCommand(int Id) : IRequest<Result>;

public class RejectLeaveCommandHandler : IRequestHandler<RejectLeaveCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public RejectLeaveCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(RejectLeaveCommand command, CancellationToken ct)
    {
        var leave = await _uow.Leaves.GetByIdAsync(command.Id, ct);
        if (leave is null) return Result.Failure("Leave request not found.");
        if (leave.Status != LeaveStatus.Pending) return Result.Failure("Only pending requests can be rejected.");

        leave.Status = LeaveStatus.Rejected;
        leave.UpdatedAt = DateTime.UtcNow;

        _uow.Leaves.Update(leave);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
