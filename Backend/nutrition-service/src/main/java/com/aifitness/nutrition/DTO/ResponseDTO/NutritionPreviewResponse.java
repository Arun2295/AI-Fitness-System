package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the live nutrition preview endpoint.
 * Used by the frontend to show auto-calculated values as the user types.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutritionPreviewResponse {

    private String foodName;
    private double weightInGrams;

    // All auto-calculated from API Ninjas
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private double fibre;

    private boolean found; // false if the food was not recognized by the API
}
