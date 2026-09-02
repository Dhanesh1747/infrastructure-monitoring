package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, Integer> {
}