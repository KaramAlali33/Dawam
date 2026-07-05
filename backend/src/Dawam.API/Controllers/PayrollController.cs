using Dawam.Application.Features.Payroll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dawam.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IMediator _mediator;
    public PayrollController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPayslipsQuery(employeeId), ct);
        return Ok(new { success = true, data = result.Value });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPayslipByIdQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { success = false, error = result.Error });
        return Ok(new { success = true, data = result.Value });
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Generate([FromBody] GeneratePayslipRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new GeneratePayslipCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true, data = result.Value });
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ApprovePayslipCommand(id), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }

    [HttpPost("{id:int}/mark-paid")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> MarkPaid(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new MarkPayslipPaidCommand(id), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }
}
