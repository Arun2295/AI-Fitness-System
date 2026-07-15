package com.aifitness.userservice.DTO.RequestDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotNull
    private Gender gender;

    @NotNull
    private Double height;

    @NotNull
    private Double weight;

    @NotNull
    @Min(value = 1, message = "Age must be a positive number")
    private Integer age;

    @NotNull
    private ActivityLevel activityLevel;

    @NotNull
    private Goal goal;




}
