using Dawam.Application.Common;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Attendance;

// DTOs
public record AttendanceDto(
    int Id, int EmployeeId, string? EmployeeName,
    string Date, string? CheckIn, string? CheckOut,
    string Status, int LateMinutes, int OvertimeMinutes, string? Notes
);

public record CheckInRequest(int EmployeeId, string? Notes);
public record CheckOutRequest(int EmployeeId);

// Queries
public record GetAttendanceQuery(int? EmployeeId = null, DateTime? Date = null)
    : IRequest<Result<IEnumerable<AttendanceDto>>>;

public class GetAttendanceQueryHandler : IRequestHandler<GetAttendanceQuery, Result<IEnumerable<AttendanceDto>>>
{
    private readonly IUnitOfWork _uow;
    public GetAttendanceQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<IEnumerable<AttendanceDto>>> Handle(GetAttendanceQuery request, CancellationToken ct)
    {
        var records = request.EmployeeId.HasValue
            ? await _uow.Attendance.GetByEmployeeAsync(request.EmployeeId.Value, ct)
            : await _uow.Attendance.GetAllAsync(ct);

        if (request.Date.HasValue)
            records = records.Where(r => r.Date.Date == request.Date.Value.Date);

        var dtos = records.Select(r => new AttendanceDto(
            r.Id, r.EmployeeId, r.Employee?.FullName,
            r.Date.ToString("yyyy-MM-dd"),
            r.CheckIn?.ToString(@"hh\:mm"),
            r.CheckOut?.ToString(@"hh\:mm"),
            r.Status.ToString(), r.LateMinutes, r.OvertimeMinutes, r.Notes
        ));
        return Result<IEnumerable<AttendanceDto>>.Success(dtos);
    }
}

// Commands
public record CheckInCommand(CheckInRequest Request) : IRequest<Result<int>>;

public class CheckInCommandHandler : IRequestHandler<CheckInCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;
    public CheckInCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(CheckInCommand command, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var existing = await _uow.Attendance.GetByEmployeeAndDateAsync(command.Request.EmployeeId, today, ct);
        if (existing is not null) return Result<int>.Failure("Already checked in today.");

        var now = DateTime.UtcNow;
        var workStart = new TimeSpan(9, 0, 0);
        var checkIn = now.TimeOfDay;
        var lateMinutes = checkIn > workStart ? (int)(checkIn - workStart).TotalMinutes : 0;

        var record = new AttendanceRecord
        {
            EmployeeId = command.Request.EmployeeId,
            Date = today,
            CheckIn = checkIn,
            Status = lateMinutes > 0 ? AttendanceStatus.Late : AttendanceStatus.Present,
            LateMinutes = lateMinutes,
            OvertimeMinutes = 0,
            Notes = command.Request.Notes
        };

        await _uow.Attendance.AddAsync(record, ct);
        await _uow.SaveChangesAsync(ct);
        return Result<int>.Success(record.Id);
    }
}

public record CheckOutCommand(CheckOutRequest Request) : IRequest<Result>;

public class CheckOutCommandHandler : IRequestHandler<CheckOutCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public CheckOutCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(CheckOutCommand command, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var record = await _uow.Attendance.GetByEmployeeAndDateAsync(command.Request.EmployeeId, today, ct);
        if (record is null) return Result.Failure("No check-in found for today.");
        if (record.CheckOut.HasValue) return Result.Failure("Already checked out today.");

        var now = DateTime.UtcNow;
        var workEnd = new TimeSpan(17, 0, 0);
        var checkOut = now.TimeOfDay;
        var overtimeMinutes = checkOut > workEnd ? (int)(checkOut - workEnd).TotalMinutes : 0;

        record.CheckOut = checkOut;
        record.OvertimeMinutes = overtimeMinutes;
        record.UpdatedAt = DateTime.UtcNow;

        _uow.Attendance.Update(record);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
