package com.aifitness.nutrition.DTO.RequestDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request for live nutrition preview — used before the user clicks "Log Meal".
 * The frontend calls this as the user types to show real-time nutrition info.
 */
@Data
public class NutritionPreviewRequest {

    @NotBlank(message = "Food name is required")
    private String foodName;

    @Min(value = 1, message = "Weight must be at least 1g")
    private double weightInGrams;
}
