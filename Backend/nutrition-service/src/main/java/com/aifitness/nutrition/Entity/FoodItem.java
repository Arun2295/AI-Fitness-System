package com.aifitness.nutrition.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Cache of nutrition data fetched from API Ninjas.
 * All values are stored per 100g so we can scale to any weight.
 * This entity is auto-populated by the FoodCacheService — users never touch it.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "foodItems")
public class FoodItem {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name; // normalized lowercase, e.g. "grilled chicken"

    // Nutritional values per 100g (fetched and stored from API Ninjas)
    private double caloriesPer100g;
    private double proteinPer100g;
    private double carbsPer100g;
    private double fatPer100g;
    private double fibrePer100g;

    private LocalDateTime cachedAt; // when this was fetched from the external API
}
