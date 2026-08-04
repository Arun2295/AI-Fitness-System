package com.aifitness.nutrition.DTO.RequestDTO;

import com.aifitness.nutrition.Enum.MealType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request body for logging a meal.
 * This is ALL the user needs to provide — nutrition is fetched automatically.
 */
@Data
public class LogMealRequest {

    @NotBlank(message = "Food name is required")
    private String foodName;          // e.g. "grilled chicken", "dal", "rice"

    @Min(value = 1, message = "Weight must be at least 1g")
    private double weightInGrams;     // e.g. 200

    @NotNull(message = "Meal type is required")
    private MealType mealType;        // BREAKFAST / LUNCH / DINNER / SNACK

    private LocalDate date;           // optional — defaults to today if null
}
