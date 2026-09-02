package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
}