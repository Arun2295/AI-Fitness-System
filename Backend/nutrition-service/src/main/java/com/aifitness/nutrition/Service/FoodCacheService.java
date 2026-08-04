package com.aifitness.nutrition.Service;

import com.aifitness.nutrition.Entity.FoodItem;
import com.aifitness.nutrition.ExternalApi.NutritionApiClient;
import com.aifitness.nutrition.ExternalApi.NutritionData;
import com.aifitness.nutrition.Repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Handles the local food nutrition cache backed by API Ninjas.
 *
 * Cache-first strategy:
 *   1. Check MongoDB for cached per-100g data
 *   2. If found → scale to requested weight and return
 *   3. If not found → call API Ninjas → cache per-100g values → return scaled result
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodCacheService {

    private final FoodItemRepository foodItemRepository;
    private final NutritionApiClient nutritionApiClient;

    /**
     * Returns nutrition data for a given food + weight.
     * Checks local cache first; calls API Ninjas on cache miss.
     *
     * @param foodName      e.g. "grilled chicken"
     * @param weightInGrams e.g. 200.0
     * @return NutritionData scaled to weightInGrams, or null if food not found
     */
    public NutritionData getNutrition(String foodName, double weightInGrams) {
        String normalizedName = foodName.trim().toLowerCase();

        // 1. Check local cache
        Optional<FoodItem> cached = foodItemRepository.findByNameIgnoreCase(normalizedName);

        if (cached.isPresent()) {
            log.info("Cache hit for food: {}", normalizedName);
            return scaleFromCache(cached.get(), normalizedName, weightInGrams);
        }

        // 2. Cache miss → call API Ninjas (with per-100g query for caching)
        log.info("Cache miss for food: {} — calling API Ninjas", normalizedName);
        NutritionData per100g = nutritionApiClient.fetchPer100g(normalizedName);

        if (per100g == null) {
            log.warn("API Ninjas could not find food: {}", normalizedName);
            return null;
        }

        // 3. Store in local cache
        FoodItem cacheEntry = new FoodItem();
        cacheEntry.setName(normalizedName);
        cacheEntry.setCaloriesPer100g(per100g.getCalories());
        cacheEntry.setProteinPer100g(per100g.getProtein());
        cacheEntry.setCarbsPer100g(per100g.getCarbs());
        cacheEntry.setFatPer100g(per100g.getFat());
        cacheEntry.setFibrePer100g(per100g.getFibre());
        cacheEntry.setCachedAt(LocalDateTime.now());
        foodItemRepository.save(cacheEntry);
        log.info("Cached nutrition data for food: {}", normalizedName);

        // 4. Return scaled result
        return scaleFromCache(cacheEntry, normalizedName, weightInGrams);
    }

    /**
     * Scales per-100g cached values to the requested weight.
     */
    private NutritionData scaleFromCache(FoodItem item, String foodName, double weightInGrams) {
        double factor = weightInGrams / 100.0;
        NutritionData result = new NutritionData();
        result.setName(foodName);
        result.setCalories(round(item.getCaloriesPer100g() * factor));
        result.setProtein(round(item.getProteinPer100g() * factor));
        result.setCarbs(round(item.getCarbsPer100g() * factor));
        result.setFat(round(item.getFatPer100g() * factor));
        result.setFibre(round(item.getFibrePer100g() * factor));
        result.setServingSizeG(weightInGrams);
        return result;
    }

    /**
     * Search cached food items by name (for autocomplete suggestions).
     */
    public List<FoodItem> searchCachedFoods(String query) {
        return foodItemRepository.findByNameContainingIgnoreCase(query);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
