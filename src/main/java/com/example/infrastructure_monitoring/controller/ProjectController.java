package com.example.infrastructure_monitoring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final JdbcTemplate jdbcTemplate;

    public ProjectController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> getAllProjects() {
        return jdbcTemplate.queryForList(
                "SELECT * FROM projects ORDER BY project_id"
        );
    }

    @GetMapping("/{projectId}")
    public Map<String, Object> getProjectById(@PathVariable Integer projectId) {
        try {
            return jdbcTemplate.queryForMap(
                    "SELECT * FROM projects WHERE project_id = ?",
                    projectId
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }
    }

    @PatchMapping("/{projectId}/progress")
    public Map<String, Object> updateProjectProgress(
            @PathVariable Integer projectId,
            @RequestBody ProgressUpdate request
    ) {
        int rowsUpdated = jdbcTemplate.update(
                """
                UPDATE projects
                SET actual_progress = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE project_id = ?
                """,
                request.actualProgress(),
                request.status(),
                projectId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        return jdbcTemplate.queryForMap(
                "SELECT * FROM projects WHERE project_id = ?",
                projectId
        );
    }

    public record ProgressUpdate(
            BigDecimal actualProgress,
            String status
    ) {
    }
}