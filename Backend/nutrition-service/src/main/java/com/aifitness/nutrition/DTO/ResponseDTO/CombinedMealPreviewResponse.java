package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Live preview response for a combo meal.
 * Shows per-item breakdown + grand totals.
 *
 * Example for "5 whole eggs + 200ml milk + 50gm oats":
 *   items: [
 *     { query: "5 whole eggs", calories: 350, protein: 30, ... },
 *     { query: "200ml milk",   calories: 122, protein: 6,  ... },
 *     { query: "50gm oats",    calories: 189, protein: 8,  ... }
 *   ]
 *   totalCalories: 661, totalProtein: 44, ...
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CombinedMealPreviewResponse {

    private String mealDescription;       // original input string
    private List<ComboItemPreview> items; // per-item breakdown

    // Grand totals (sum of all items)
    private double totalCalories;
    private double totalProtein;
    private double totalCarbs;
    private double totalFat;
    private double totalFibre;

    private boolean allFound;  // false if any item was unrecognised
}
