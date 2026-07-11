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

}
