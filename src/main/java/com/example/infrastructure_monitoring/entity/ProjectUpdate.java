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
@Table(name = "project_updates")
public class ProjectUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "update_id")
    private Integer updateId;

    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "update_date")
    private LocalDate updateDate;

    @Column(name = "physical_progress")
    private BigDecimal physicalProgress;

    @Column(name = "expenditure")
    private BigDecimal expenditure;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "submitted_by")
    private Integer submittedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    protected ProjectUpdate() {
    }

    public Integer getUpdateId() {
        return updateId;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public LocalDate getUpdateDate() {
        return updateDate;
    }

    public BigDecimal getPhysicalProgress() {
        return physicalProgress;
    }

    public BigDecimal getExpenditure() {
        return expenditure;
    }

    public String getRemarks() {
        return remarks;
    }

    public Integer getSubmittedBy() {
        return submittedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}