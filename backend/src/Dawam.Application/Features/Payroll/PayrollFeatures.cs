using Dawam.Application.Common;
using Dawam.Domain.Entities;
using Dawam.Domain.Enums;
using Dawam.Domain.Interfaces;
using MediatR;

namespace Dawam.Application.Features.Payroll;

// DTOs
public record PayslipDto(
    int Id, int EmployeeId, string? EmployeeName,
    int Month, int Year,
    decimal BasicSalary, decimal Bonuses, decimal Deductions,
    decimal Overtime, decimal NetSalary,
    string Status, string GeneratedAt
);

public record GeneratePayslipRequest(int EmployeeId, int Month, int Year, decimal? Bonuses, decimal? Deductions);

// Queries
public record GetPayslipsQuery(int? EmployeeId = null) : IRequest<Result<IEnumerable<PayslipDto>>>;

public class GetPayslipsQueryHandler : IRequestHandler<GetPayslipsQuery, Result<IEnumerable<PayslipDto>>>
{
    private readonly IUnitOfWork _uow;
    public GetPayslipsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<IEnumerable<PayslipDto>>> Handle(GetPayslipsQuery request, CancellationToken ct)
    {
        var payslips = request.EmployeeId.HasValue
            ? await _uow.Payroll.GetByEmployeeAsync(request.EmployeeId.Value, ct)
            : await _uow.Payroll.GetAllAsync(ct);

        var dtos = payslips.Select(p => new PayslipDto(
            p.Id, p.EmployeeId, p.Employee?.FullName,
            p.Month, p.Year, p.BasicSalary, p.Bonuses,
            p.Deductions, p.Overtime, p.NetSalary,
            p.Status.ToString(), p.GeneratedAt.ToString("yyyy-MM-ddTHH:mm:ss")
        ));
        return Result<IEnumerable<PayslipDto>>.Success(dtos);
    }
}

public record GetPayslipByIdQuery(int Id) : IRequest<Result<PayslipDto>>;

public class GetPayslipByIdQueryHandler : IRequestHandler<GetPayslipByIdQuery, Result<PayslipDto>>
{
    private readonly IUnitOfWork _uow;
    public GetPayslipByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<PayslipDto>> Handle(GetPayslipByIdQuery request, CancellationToken ct)
    {
        var p = await _uow.Payroll.GetByIdAsync(request.Id, ct);
        if (p is null) return Result<PayslipDto>.Failure("Payslip not found.");
        return Result<PayslipDto>.Success(new PayslipDto(
            p.Id, p.EmployeeId, p.Employee?.FullName,
            p.Month, p.Year, p.BasicSalary, p.Bonuses,
            p.Deductions, p.Overtime, p.NetSalary,
            p.Status.ToString(), p.GeneratedAt.ToString("yyyy-MM-ddTHH:mm:ss")
        ));
    }
}

// Commands
public record GeneratePayslipCommand(GeneratePayslipRequest Request) : IRequest<Result<int>>;

public class GeneratePayslipCommandHandler : IRequestHandler<GeneratePayslipCommand, Result<int>>
{
    private readonly IUnitOfWork _uow;
    public GeneratePayslipCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result<int>> Handle(GeneratePayslipCommand command, CancellationToken ct)
    {
        var req = command.Request;
        var employee = await _uow.Employees.GetByIdAsync(req.EmployeeId, ct);
        if (employee is null) return Result<int>.Failure("Employee not found.");

        var existing = await _uow.Payroll.GetByEmployeeMonthYearAsync(req.EmployeeId, req.Month, req.Year, ct);
        if (existing is not null) return Result<int>.Failure("Payslip already exists for this month.");

        // Calculate overtime from attendance
        var attendance = await _uow.Attendance.GetByEmployeeAsync(req.EmployeeId, ct);
        var monthAttendance = attendance.Where(a => a.Date.Month == req.Month && a.Date.Year == req.Year);
        var overtimeHours = monthAttendance.Sum(a => a.OvertimeMinutes) / 60m;
        var hourlyRate = employee.Salary / 22 / 8; // 22 working days, 8h/day
        var overtimePay = overtimeHours * hourlyRate * 1.5m;

        var bonuses = req.Bonuses ?? 0m;
        var deductions = req.Deductions ?? 0m;
        var net = employee.Salary + bonuses + overtimePay - deductions;

        var payslip = new Payslip
        {
            EmployeeId = req.EmployeeId,
            Month = req.Month,
            Year = req.Year,
            BasicSalary = employee.Salary,
            Bonuses = bonuses,
            Deductions = deductions,
            Overtime = overtimePay,
            NetSalary = net,
            Status = PayslipStatus.Draft
        };

        await _uow.Payroll.AddAsync(payslip, ct);
        await _uow.SaveChangesAsync(ct);
        return Result<int>.Success(payslip.Id);
    }
}

public record ApprovePayslipCommand(int Id) : IRequest<Result>;

public class ApprovePayslipCommandHandler : IRequestHandler<ApprovePayslipCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public ApprovePayslipCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(ApprovePayslipCommand command, CancellationToken ct)
    {
        var payslip = await _uow.Payroll.GetByIdAsync(command.Id, ct);
        if (payslip is null) return Result.Failure("Payslip not found.");
        if (payslip.Status != PayslipStatus.Draft) return Result.Failure("Only draft payslips can be approved.");

        payslip.Status = PayslipStatus.Approved;
        payslip.UpdatedAt = DateTime.UtcNow;

        _uow.Payroll.Update(payslip);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public record MarkPayslipPaidCommand(int Id) : IRequest<Result>;

public class MarkPayslipPaidCommandHandler : IRequestHandler<MarkPayslipPaidCommand, Result>
{
    private readonly IUnitOfWork _uow;
    public MarkPayslipPaidCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(MarkPayslipPaidCommand command, CancellationToken ct)
    {
        var payslip = await _uow.Payroll.GetByIdAsync(command.Id, ct);
        if (payslip is null) return Result.Failure("Payslip not found.");
        if (payslip.Status != PayslipStatus.Approved) return Result.Failure("Only approved payslips can be marked as paid.");

        payslip.Status = PayslipStatus.Paid;
        payslip.UpdatedAt = DateTime.UtcNow;

        _uow.Payroll.Update(payslip);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
