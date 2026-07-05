using Dawam.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dawam.Infrastructure.Persistence;

public class DawamDbContext : DbContext
{
    public DawamDbContext(DbContextOptions<DawamDbContext> options) : base(options) { }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Dawam.Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Payslip> Payslips => Set<Payslip>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee
        modelBuilder.Entity<Employee>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EmployeeNumber).HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.EmployeeNumber).IsUnique();
            e.Property(x => x.FullName).HasMaxLength(150).IsRequired();
            e.Property(x => x.Email).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Gender).HasConversion<string>();
            e.Property(x => x.ContractType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();

            e.HasOne(x => x.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Department
        modelBuilder.Entity<Department>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.Name).HasMaxLength(100).IsRequired();
            d.Property(x => x.NameAr).HasMaxLength(100).IsRequired();

            d.HasOne(x => x.Manager)
             .WithMany()
             .HasForeignKey(x => x.ManagerId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ApplicationUser
        modelBuilder.Entity<ApplicationUser>(u =>
        {
            u.HasKey(x => x.Id);
            u.Property(x => x.Email).HasMaxLength(150).IsRequired();
            u.HasIndex(x => x.Email).IsUnique();
            u.Property(x => x.PasswordHash).IsRequired();
            u.Property(x => x.Role).HasConversion<string>();
        });

        // LeaveRequest
        modelBuilder.Entity<LeaveRequest>(l =>
        {
            l.HasKey(x => x.Id);
            l.Property(x => x.Reason).HasMaxLength(500);
            l.Property(x => x.LeaveType).HasConversion<string>();
            l.Property(x => x.Status).HasConversion<string>();

            l.HasOne(x => x.Employee)
             .WithMany(e => e.LeaveRequests)
             .HasForeignKey(x => x.EmployeeId)
             .OnDelete(DeleteBehavior.Restrict);

            l.HasOne(x => x.ApprovedBy)
             .WithMany()
             .HasForeignKey(x => x.ApprovedById)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // AttendanceRecord
        modelBuilder.Entity<AttendanceRecord>(a =>
        {
            a.HasKey(x => x.Id);
            a.Property(x => x.Status).HasConversion<string>();
            a.HasIndex(x => new { x.EmployeeId, x.Date }).IsUnique();

            a.HasOne(x => x.Employee)
             .WithMany(e => e.AttendanceRecords)
             .HasForeignKey(x => x.EmployeeId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Payslip
        modelBuilder.Entity<Payslip>(p =>
        {
            p.HasKey(x => x.Id);
            // SQLite handles decimal natively — no column type annotation needed
            p.Property(x => x.Status).HasConversion<string>();
            p.HasIndex(x => new { x.EmployeeId, x.Month, x.Year }).IsUnique();

            p.HasOne(x => x.Employee)
             .WithMany(e => e.Payslips)
             .HasForeignKey(x => x.EmployeeId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default departments
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "IT", NameAr = "تقنية المعلومات", Description = "Information Technology" },
            new Department { Id = 2, Name = "HR", NameAr = "الموارد البشرية", Description = "Human Resources" },
            new Department { Id = 3, Name = "Finance", NameAr = "المالية", Description = "Finance Department" },
            new Department { Id = 4, Name = "Marketing", NameAr = "التسويق", Description = "Marketing Department" },
            new Department { Id = 5, Name = "Sales", NameAr = "المبيعات", Description = "Sales Department" }
        );

        // Seed default admin user
        modelBuilder.Entity<ApplicationUser>().HasData(new ApplicationUser
        {
            Id = 1,
            Email = "admin@dawam.com",
            FullName = "System Admin",
            PasswordHash = "$2a$11$pheHBjPXPpkmi..c/vmVXeX8NW3g/N0rDb05rAbyNwI3st3z30XEy", // Admin@123
            Role = Domain.Enums.UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UnixEpoch
        });
    }
}
