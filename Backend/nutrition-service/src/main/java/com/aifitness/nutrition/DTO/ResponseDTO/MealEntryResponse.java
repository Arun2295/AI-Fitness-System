package com.aifitness.nutrition.DTO.ResponseDTO;

import com.aifitness.nutrition.Enum.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealEntryResponse {

    private String id;
    private String foodName;
    private String mealDescription; // non-null for combo meals
    private double weightInGrams;
    private MealType mealType;
    private LocalDate date;

    // Auto-fetched nutrition values
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private double fibre;

    private LocalDateTime createdAt;
}
