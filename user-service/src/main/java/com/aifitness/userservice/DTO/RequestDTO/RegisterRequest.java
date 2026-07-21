package com.aifitness.userservice.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.aifitness.userservice.Enum.Gender;
import com.aifitness.userservice.Enum.ActivityLevel;
import com.aifitness.userservice.Enum.Goal;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String firstName;

    private String lastName;

    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank
    private String phone;

    @NotBlank
    private Gender gender;

    @NotBlank
    private Double height;

    @NotBlank
    private Double weight;

    @NotBlank
    private int age;

    @NotBlank
    private ActivityLevel activityLevel;

    @NotBlank
    private Goal goal;




}
