package com.aifitness.userservice.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.aifitness.userservice.Enum.Role;
import com.aifitness.userservice.Enum.ActivityLevel;
import com.aifitness.userservice.Enum.Goal;
import com.aifitness.userservice.Enum.Gender;



@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private Role role;
    private Gender gender;
    private Double height;
    private Double weight;
    private int age;
    private ActivityLevel activityLevel;
    private Goal goal;


}
