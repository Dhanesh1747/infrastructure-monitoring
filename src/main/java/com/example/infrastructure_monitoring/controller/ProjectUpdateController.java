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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/project-updates")
public class ProjectUpdateController {

    private final JdbcTemplate jdbcTemplate;

    public ProjectUpdateController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllUpdates() {
        return jdbcTemplate.queryForList(
                "SELECT * FROM project_updates ORDER BY update_id"
        );
    }

    @GetMapping("/{updateId}")
    public Map<String, Object> getUpdateById(
            @PathVariable Integer updateId
    ) {
        try {
            return jdbcTemplate.queryForMap(
                    "SELECT * FROM project_updates WHERE update_id = ?",
                    updateId
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project update not found"
            );
        }
    }

    @PostMapping
    public Map<String, Object> createUpdate(
            @RequestBody ProjectUpdateRequest request
    ) {
        int rowsInserted = jdbcTemplate.update(
                """
                INSERT INTO project_updates
                (project_id, update_date, physical_progress,
                 expenditure, remarks, submitted_by)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                request.projectId(),
                request.updateDate(),
                request.physicalProgress(),
                request.expenditure(),
                request.remarks(),
                request.submittedBy()
        );

        if (rowsInserted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project update could not be created"
            );
        }

        return jdbcTemplate.queryForMap(
                "SELECT * FROM project_updates WHERE update_id = LAST_INSERT_ID()"
        );
    }

    @PatchMapping("/{updateId}")
    public Map<String, Object> updateProjectUpdate(
            @PathVariable Integer updateId,
            @RequestBody ProjectUpdateRequest request
    ) {
        int rowsUpdated = jdbcTemplate.update(
                """
                UPDATE project_updates
                SET project_id = ?,
                    update_date = ?,
                    physical_progress = ?,
                    expenditure = ?,
                    remarks = ?,
                    submitted_by = ?
                WHERE update_id = ?
                """,
                request.projectId(),
                request.updateDate(),
                request.physicalProgress(),
                request.expenditure(),
                request.remarks(),
                request.submittedBy(),
                updateId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project update not found"
            );
        }

        return getUpdateById(updateId);
    }

    @DeleteMapping("/{updateId}")
    public Map<String, String> deleteUpdate(
            @PathVariable Integer updateId
    ) {
        int rowsDeleted = jdbcTemplate.update(
                "DELETE FROM project_updates WHERE update_id = ?",
                updateId
        );

        if (rowsDeleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project update not found"
            );
        }

        return Map.of("message", "Project update deleted successfully");
    }

    public record ProjectUpdateRequest(
            Integer projectId,
            LocalDate updateDate,
            BigDecimal physicalProgress,
            BigDecimal expenditure,
            String remarks,
            Integer submittedBy
    ) {
    }
}