using Dawam.Application.Features.Leaves;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dawam.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeavesController : ControllerBase
{
    private readonly IMediator _mediator;
    public LeavesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetLeaveRequestsQuery(employeeId), ct);
        return Ok(new { success = true, data = result.Value });
    }

    [HttpGet("balance/{employeeId:int}")]
    public async Task<IActionResult> GetBalance(int employeeId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetLeaveBalanceQuery(employeeId), ct);
        if (!result.IsSuccess) return NotFound(new { success = false, error = result.Error });
        return Ok(new { success = true, data = result.Value });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequestRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateLeaveRequestCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true, data = result.Value });
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Approve(int id, [FromQuery] int approverId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ApproveLeaveCommand(id, approverId), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Reject(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new RejectLeaveCommand(id), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }
}
