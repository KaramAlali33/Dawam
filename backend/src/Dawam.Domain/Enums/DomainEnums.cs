namespace Dawam.Domain.Enums;

public enum Gender
{
    Male,
    Female
}

public enum ContractType
{
    FullTime,
    PartTime,
    Contract,
    Temporary
}

public enum EmployeeStatus
{
    Active,
    Inactive,
    Suspended,
    Terminated
}

public enum LeaveType
{
    Annual,
    Sick,
    Emergency
}

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected
}

public enum AttendanceStatus
{
    Present,
    Absent,
    Late,
    OnLeave,
    Holiday
}

public enum PayslipStatus
{
    Draft,
    Approved,
    Paid
}

public enum UserRole
{
    Admin,
    HRManager,
    Employee
}
