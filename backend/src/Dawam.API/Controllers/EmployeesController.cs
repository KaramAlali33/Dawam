using Dawam.Application.Features.Employees.Commands;
using Dawam.Application.Features.Employees.DTOs;
using Dawam.Application.Features.Employees.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dawam.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IMediator _mediator;
    public EmployeesController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get all employees</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEmployeesQuery(), ct);
        return Ok(new { success = true, data = result.Value });
    }

    /// <summary>Get employee by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEmployeeByIdQuery(id), ct);
        if (!result.IsSuccess) return NotFound(new { success = false, error = result.Error });
        return Ok(new { success = true, data = result.Value });
    }

    /// <summary>Create a new employee</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateEmployeeCommand(request), ct);
        if (!result.IsSuccess) return BadRequest(new { success = false, error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value }, new { success = true, data = result.Value });
    }

    /// <summary>Update an employee</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,HRManager")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateEmployeeCommand(id, request), ct);
        if (!result.IsSuccess) return NotFound(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }

    /// <summary>Delete an employee</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteEmployeeCommand(id), ct);
        if (!result.IsSuccess) return NotFound(new { success = false, error = result.Error });
        return Ok(new { success = true });
    }
}
