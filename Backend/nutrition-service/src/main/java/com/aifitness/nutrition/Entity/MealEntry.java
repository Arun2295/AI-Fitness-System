package com.aifitness.nutrition.Entity;

import com.aifitness.nutrition.Enum.MealType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a single food item logged by the user.
 * User only provides: foodName, weightInGrams, mealType, date.
 * All nutritional values are auto-fetched from the API Ninjas Nutrition API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mealEntries")
public class MealEntry {

    @Id
    private String id;

    private String userId;        // from X-User-Id header (set by API Gateway)

    // What the user entered
    private String foodName;      // e.g. "grilled chicken" OR combined "5 eggs + 200ml milk"
    private String mealDescription; // full original combo description (null for simple meals)
    private double weightInGrams; // e.g. 200 (0 for combo meals — quantity is embedded in description)

    private MealType mealType;    // BREAKFAST / LUNCH / DINNER / SNACK
    private LocalDate date;

    // Auto-fetched and calculated by the system (user never sets these)
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private double fibre;

    private LocalDateTime createdAt;
}
