package com.example.infrastructure_monitoring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final JdbcTemplate jdbcTemplate;

    public AlertController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    
    @GetMapping
public List<Map<String, Object>> getAllAlerts() {
    return jdbcTemplate.queryForList(
            "SELECT * FROM alerts ORDER BY alert_id"
    );
}

    @GetMapping("/{alertId}")
    public Map<String, Object> getAlertById(@PathVariable Integer alertId) {
        try {
            return jdbcTemplate.queryForMap(
                    "SELECT * FROM alerts WHERE alert_id = ?",
                    alertId
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Alert not found"
            );
        }
    }

    @PostMapping
    public Map<String, Object> createAlert(
            @RequestBody AlertRequest request
    ) {
        String severity = request.severity() == null || request.severity().isBlank()
                ? "LOW"
                : request.severity();

        String alertType = request.alertType() == null || request.alertType().isBlank()
                ? "OTHER"
                : request.alertType();

        int rowsInserted = jdbcTemplate.update(
                """
                INSERT INTO alerts
                (project_id, alert_type, severity, title, message, is_resolved)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                request.projectId(),
                alertType,
                severity,
                request.title(),
                request.message(),
                request.resolved() == null ? false : request.resolved()
        );

        if (rowsInserted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Alert could not be created"
            );
        }

        return jdbcTemplate.queryForMap(
                "SELECT * FROM alerts WHERE alert_id = LAST_INSERT_ID()"
        );
    }

    @PatchMapping("/{alertId}")
    public Map<String, Object> updateAlert(
            @PathVariable Integer alertId,
            @RequestBody AlertRequest request
    ) {
        int rowsUpdated = jdbcTemplate.update(
                """
                UPDATE alerts
                SET project_id = ?,
                    alert_type = ?,
                    severity = ?,
                    title = ?,
                    message = ?,
                    is_resolved = ?,
                    resolved_at = CASE
                        WHEN ? = TRUE THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END
                WHERE alert_id = ?
                """,
                request.projectId(),
                request.alertType(),
                request.severity(),
                request.title(),
                request.message(),
                request.resolved(),
                request.resolved(),
                alertId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Alert not found"
            );
        }

        return getAlertById(alertId);
    }

    @DeleteMapping("/{alertId}")
    public Map<String, String> deleteAlert(
            @PathVariable Integer alertId
    ) {
        int rowsDeleted = jdbcTemplate.update(
                "DELETE FROM alerts WHERE alert_id = ?",
                alertId
        );

        if (rowsDeleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Alert not found"
            );
        }

        return Map.of("message", "Alert deleted successfully");
    }

    public record AlertRequest(
            Integer projectId,
            String alertType,
            String severity,
            String title,
            String message,
            Boolean resolved
    ) {}
}