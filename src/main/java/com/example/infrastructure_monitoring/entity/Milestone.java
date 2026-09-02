package com.example.infrastructure_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "milestone_id")
    private Integer milestoneId;

    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "milestone_name")
    private String milestoneName;

    @Column(name = "description")
    private String description;

    @Column(name = "planned_date")
    private LocalDate plannedDate;

    @Column(name = "actual_date")
    private LocalDate actualDate;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    protected Milestone() {
    }

    public Integer getMilestoneId() {
        return milestoneId;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public String getMilestoneName() {
        return milestoneName;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public LocalDate getActualDate() {
        return actualDate;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}