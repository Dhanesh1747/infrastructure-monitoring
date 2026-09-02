package com.example.infrastructure_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "project_code")
    private String projectCode;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "description")
    private String description;

    @Column(name = "sector")
    private String sector;

    @Column(name = "location")
    private String location;

    @Column(name = "state")
    private String state;

    @Column(name = "district")
    private String district;

    @Column(name = "implementing_agency")
    private String implementingAgency;

    @Column(name = "approved_budget")
    private BigDecimal approvedBudget;

    @Column(name = "current_expenditure")
    private BigDecimal currentExpenditure;

    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "planned_progress")
    private BigDecimal plannedProgress;

    @Column(name = "actual_progress")
    private BigDecimal actualProgress;

    @Column(name = "status")
    private String status;

    @Column(name = "project_manager")
    private String projectManager;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    protected Project() {
    }

    public Integer getProjectId() {
        return projectId;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getDescription() {
        return description;
    }

    public String getSector() {
        return sector;
    }

    public String getLocation() {
        return location;
    }

    public String getState() {
        return state;
    }

    public String getDistrict() {
        return district;
    }

    public String getImplementingAgency() {
        return implementingAgency;
    }

    public BigDecimal getApprovedBudget() {
        return approvedBudget;
    }

    public BigDecimal getCurrentExpenditure() {
        return currentExpenditure;
    }

    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }

    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }

    public LocalDate getActualStartDate() {
        return actualStartDate;
    }

    public LocalDate getActualEndDate() {
        return actualEndDate;
    }

    public BigDecimal getPlannedProgress() {
        return plannedProgress;
    }

    public BigDecimal getActualProgress() {
        return actualProgress;
    }

    public String getStatus() {
        return status;
    }

    public String getProjectManager() {
        return projectManager;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}