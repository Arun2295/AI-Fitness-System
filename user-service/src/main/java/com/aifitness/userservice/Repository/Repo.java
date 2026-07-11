package com.aifitness.userservice.Repository;

import com.aifitness.userservice.Entity.Entity;
import com.aifitness.userservice.Enum.Goal;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface Repo extends MongoRepository<Entity, String> {

    // Find user by email (unique field)
    Optional<Entity> findByEmail(String email);

    // Check if email already exists
    boolean existsByEmail(String email);

    // Find users by first name
    List<Entity> findByFirstName(String firstName);

    // Find users by last name
    List<Entity> findByLastName(String lastName);


    // Find users by gender
    List<Entity> findByGender(com.aifitness.userservice.Enum.Gender gender);

    // Find users by goal
    List<Entity> findByGoal(com.aifitness.userservice.Enum.Goal goal);

    // Find users by activity level
    List<Entity> findByActivityLevel(com.aifitness.userservice.Enum.ActivityLevel activityLevel);

    // Find users by role
    List<Entity> findByRole(com.aifitness.userservice.Enum.Role role);

}
