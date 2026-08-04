package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Daily nutrition summary — aggregated totals for all meals logged on a given date.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryResponse {

    private LocalDate date;
    private int mealCount;

    // Aggregated daily totals
    private double totalCalories;
    private double totalProtein;
    private double totalCarbs;
    private double totalFat;
    private double totalFibre;

    // Individual meals grouped by type
    private List<MealEntryResponse> meals;
}
