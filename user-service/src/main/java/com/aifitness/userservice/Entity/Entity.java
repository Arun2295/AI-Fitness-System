package com.aifitness.userservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import com.aifitness.userservice.Enum.Gender;
import com.aifitness.userservice.Enum.ActivityLevel;
import com.aifitness.userservice.Enum.Goal;
import com.aifitness.userservice.Enum.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Entity {

    @Id
    private String id;
    private String firstName;
    private String lastName;
    @Indexed(unique = true)
    private String email;
    private String password;
    private String phone;
    private Gender gender;

    //Authorization information
    private Role role;

    //Personal infomation

    private Double height;
    private Double weight;
    private int age;
    private ActivityLevel activityLevel;
    private Goal goal;



}
