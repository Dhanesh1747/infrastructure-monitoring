package com.example.infrastructure_monitoring.controller;

import com.example.infrastructure_monitoring.entity.User;
import com.example.infrastructure_monitoring.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public record UserResponse(
            Integer userId,
            String fullName,
            String email,
            String role,
            String department,
            String designation,
            Boolean active
    ) {
        static UserResponse from(User user) {
            return new UserResponse(
                    user.getUserId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getDepartment(),
                    user.getDesignation(),
                    user.getActive()
            );
        }
    }
}