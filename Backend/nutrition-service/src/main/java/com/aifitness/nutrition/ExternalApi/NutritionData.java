package com.aifitness.nutrition.ExternalApi;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal model representing nutrition data returned from the API Ninjas response.
 * Already scaled to the requested weight (API Ninjas auto-scales when you send "200g chicken").
 */
@Data
@NoArgsConstructor
public class NutritionData {

    private String name;
    private double calories;
    private double protein;       // grams
    private double carbs;         // grams (total carbohydrates)
    private double fat;           // grams (total fat)
    private double fibre;         // grams
    private double servingSizeG;  // actual serving size the API used

    public NutritionData(String name, double calories, double protein,
                         double carbs, double fat, double fibre, double servingSizeG) {
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.fibre = fibre;
        this.servingSizeG = servingSizeG;
    }
}
