package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.ProjectUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectUpdateRepository extends JpaRepository<ProjectUpdate, Integer> {
}