package com.example.infrastructure_monitoring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final JdbcTemplate jdbcTemplate;

    public MilestoneController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllMilestones() {
        return jdbcTemplate.queryForList(
                "SELECT * FROM milestones ORDER BY milestone_id"
        );
    }

    @GetMapping("/{milestoneId}")
    public Map<String, Object> getMilestoneById(
            @PathVariable Integer milestoneId
    ) {
        try {
            return jdbcTemplate.queryForMap(
                    "SELECT * FROM milestones WHERE milestone_id = ?",
                    milestoneId
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Milestone not found"
            );
        }
    }

    @PostMapping
    public Map<String, Object> createMilestone(
            @RequestBody MilestoneRequest request
    ) {
        String status = request.status() == null || request.status().isBlank()
                ? "PENDING"
                : request.status();

        int rowsInserted = jdbcTemplate.update(
                """
                INSERT INTO milestones
                (project_id, milestone_name, description, planned_date,
                 actual_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                request.projectId(),
                request.milestoneName(),
                request.description(),
                request.plannedDate(),
                request.actualDate(),
                status
        );

        if (rowsInserted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Milestone could not be created"
            );
        }

        return jdbcTemplate.queryForMap(
                "SELECT * FROM milestones WHERE milestone_id = LAST_INSERT_ID()"
        );
    }

    @PatchMapping("/{milestoneId}")
    public Map<String, Object> updateMilestone(
            @PathVariable Integer milestoneId,
            @RequestBody MilestoneRequest request
    ) {
        int rowsUpdated = jdbcTemplate.update(
                """
                UPDATE milestones
                SET milestone_name = ?,
                    description = ?,
                    planned_date = ?,
                    actual_date = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE milestone_id = ?
                """,
                request.milestoneName(),
                request.description(),
                request.plannedDate(),
                request.actualDate(),
                request.status(),
                milestoneId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Milestone not found"
            );
        }

        return getMilestoneById(milestoneId);
    }

    @DeleteMapping("/{milestoneId}")
    public Map<String, String> deleteMilestone(
            @PathVariable Integer milestoneId
    ) {
        int rowsDeleted = jdbcTemplate.update(
                "DELETE FROM milestones WHERE milestone_id = ?",
                milestoneId
        );

        if (rowsDeleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Milestone not found"
            );
        }

        return Map.of("message", "Milestone deleted successfully");
    }

    public record MilestoneRequest(
            Integer projectId,
            String milestoneName,
            String description,
            LocalDate plannedDate,
            LocalDate actualDate,
            String status
    ) {
    }
}