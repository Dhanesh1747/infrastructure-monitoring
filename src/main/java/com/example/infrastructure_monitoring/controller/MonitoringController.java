package com.example.infrastructure_monitoring.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MonitoringController {

    private final JdbcTemplate jdbcTemplate;

    public MonitoringController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/milestones")
    public List<Map<String, Object>> getMilestones() {
        return jdbcTemplate.queryForList("SELECT * FROM milestones");
    }

    @GetMapping("/project-updates")
    public List<Map<String, Object>> getProjectUpdates() {
        return jdbcTemplate.queryForList("SELECT * FROM project_updates");
    }

    @GetMapping("/alerts")
    public List<Map<String, Object>> getAlerts() {
        return jdbcTemplate.queryForList("SELECT * FROM alerts");
    }

    @GetMapping("/documents")
    public List<Map<String, Object>> getDocuments() {
        return jdbcTemplate.queryForList("SELECT * FROM documents");
    }

    @GetMapping("/dashboard/summary")
    public Map<String, Integer> getDashboardSummary() {
        Map<String, Integer> summary = new LinkedHashMap<>();

        summary.put("users", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class));
        summary.put("projects", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM projects", Integer.class));
        summary.put("milestones", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM milestones", Integer.class));
        summary.put("alerts", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM alerts", Integer.class));
        summary.put("documents", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM documents", Integer.class));

        return summary;
    }
}