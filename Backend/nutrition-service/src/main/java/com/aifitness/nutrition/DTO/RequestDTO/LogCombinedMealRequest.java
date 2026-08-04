package com.aifitness.nutrition.DTO.RequestDTO;

import com.aifitness.nutrition.Enum.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request for logging a combo/multi-food meal.
 * The user types the full meal description using "+" as separator:
 *
 *   "5 whole eggs + 200ml milk + 50gm oats"
 *   "100g rice + 150g dal + 30g paneer"
 *   "3 chapati + 1 cup curd"
 *
 * The backend parses each "+" separated part and fetches nutrition
 * for each item individually from API Ninjas, then sums the totals.
 */
@Data
public class LogCombinedMealRequest {

    @NotBlank(message = "Meal description is required. Example: 5 eggs + 200ml milk + 50g oats")
    private String mealDescription;   // full combo string

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    private LocalDate date;           // optional — defaults to today
}
