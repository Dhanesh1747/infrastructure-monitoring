package com.example.infrastructure_monitoring.repository;

import com.example.infrastructure_monitoring.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}