package com.aifitness.userservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aifitness.userservice.Service.Service;
import com.aifitness.userservice.Entity.Entity;

import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import com.aifitness.userservice.DTO.ResponseDTO.UserResponse;


@RestController
@RequestMapping("/api/users")
public class Controller {

    @Autowired
    private Service service;

    @GetMapping("/all")
    public ResponseEntity<List<Entity>> getAllUsers() {
        List<Entity> users = service.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entity> getUserById(@PathVariable String id) {
        Entity user = service.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/goal/{goal}")
    public ResponseEntity<?> getUsersByGoal(@PathVariable com.aifitness.userservice.Enum.Goal goal) {
        List<Entity> users = service.getByGoal(goal);
        if (users != null && !users.isEmpty()) {
            return ResponseEntity.ok(users);
        } else {
            return ResponseEntity.notFound().build();
        }
    } 

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        String email = authentication.getName();
        Entity user = service.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .name(user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : ""))
                .email(user.getEmail())
                .phoneNumber(user.getPhone())
                .role(user.getRole())
                .gender(user.getGender())
                .height(user.getHeight())
                .weight(user.getWeight())
                .age(user.getAge())
                .activityLevel(user.getActivityLevel())
                .goal(user.getGoal())
                .build();
        return ResponseEntity.ok(response);
    }
}
