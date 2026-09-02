package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Integer> {
}
