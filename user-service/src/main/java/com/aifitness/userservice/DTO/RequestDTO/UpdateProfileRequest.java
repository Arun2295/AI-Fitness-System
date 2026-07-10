package com.aifitness.userservice.DTO.RequestDTO;

import lombok.Data;
import com.aifitness.userservice.Enum.ActivityLevel;
import com.aifitness.userservice.Enum.Goal;


@Data
public class UpdateProfileRequest {

    private Double height;
    private Double weight;
    private Integer age;
    private ActivityLevel activityLevel;
    private Goal goal;

}
