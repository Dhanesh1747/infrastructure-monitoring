package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Integer> {
}