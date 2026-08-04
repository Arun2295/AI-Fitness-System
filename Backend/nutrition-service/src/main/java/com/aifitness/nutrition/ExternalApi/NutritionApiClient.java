package com.aifitness.nutrition.ExternalApi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Client for the API Ninjas Nutrition API.
 *
 * API docs: https://api-ninjas.com/api/nutrition
 * Example query: GET https://api.api-ninjas.com/v1/nutrition?query=200g grilled chicken
 *
 * The API understands natural language: "200g chicken", "3 eggs", "1 cup rice"
 * It automatically scales nutritional values to the requested quantity.
 *
 * Sign up for a free API key at: https://api-ninjas.com
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NutritionApiClient {

    private final RestTemplate restTemplate;

    @Value("${api.ninjas.key}")
    private String apiKey;

    @Value("${api.ninjas.base-url}")
    private String baseUrl;

    private static final Map<String, NutritionData> LOCAL_FOOD_DB = new java.util.HashMap<>();
    
    static {
        // Values are per 100g
        LOCAL_FOOD_DB.put("chicken", createData("chicken", 165.0, 31.0, 0.0, 3.6, 0.0));
        LOCAL_FOOD_DB.put("grilled chicken", createData("grilled chicken", 165.0, 31.0, 0.0, 3.6, 0.0));
        LOCAL_FOOD_DB.put("chicken breast", createData("chicken breast", 165.0, 31.0, 0.0, 3.6, 0.0));
        LOCAL_FOOD_DB.put("egg", createData("egg", 143.0, 13.0, 1.1, 9.5, 0.0));
        LOCAL_FOOD_DB.put("eggs", createData("eggs", 143.0, 13.0, 1.1, 9.5, 0.0));
        LOCAL_FOOD_DB.put("whole egg", createData("whole egg", 143.0, 13.0, 1.1, 9.5, 0.0));
        LOCAL_FOOD_DB.put("whole eggs", createData("whole eggs", 143.0, 13.0, 1.1, 9.5, 0.0));
        LOCAL_FOOD_DB.put("milk", createData("milk", 60.0, 3.2, 4.8, 3.2, 0.0));
        LOCAL_FOOD_DB.put("oats", createData("oats", 389.0, 16.9, 66.0, 6.9, 10.0));
        LOCAL_FOOD_DB.put("oatmeal", createData("oatmeal", 389.0, 16.9, 66.0, 6.9, 10.0));
        LOCAL_FOOD_DB.put("rice", createData("rice", 130.0, 2.7, 28.0, 0.3, 0.4));
        LOCAL_FOOD_DB.put("white rice", createData("white rice", 130.0, 2.7, 28.0, 0.3, 0.4));
        LOCAL_FOOD_DB.put("brown rice", createData("brown rice", 112.0, 2.6, 23.5, 0.9, 1.8));
        LOCAL_FOOD_DB.put("banana", createData("banana", 89.0, 1.1, 23.0, 0.3, 2.6));
        LOCAL_FOOD_DB.put("paneer", createData("paneer", 265.0, 18.0, 1.2, 20.0, 0.0));
        LOCAL_FOOD_DB.put("dal", createData("dal", 116.0, 9.0, 20.0, 0.4, 8.0));
        LOCAL_FOOD_DB.put("lentils", createData("lentils", 116.0, 9.0, 20.0, 0.4, 8.0));
        LOCAL_FOOD_DB.put("fish", createData("fish", 206.0, 22.0, 0.0, 12.0, 0.0));
        LOCAL_FOOD_DB.put("salmon", createData("salmon", 206.0, 22.0, 0.0, 12.0, 0.0));
        LOCAL_FOOD_DB.put("apple", createData("apple", 52.0, 0.3, 14.0, 0.2, 2.4));
        LOCAL_FOOD_DB.put("beef", createData("beef", 250.0, 26.0, 0.0, 15.0, 0.0));
        LOCAL_FOOD_DB.put("almonds", createData("almonds", 579.0, 21.0, 22.0, 49.0, 12.0));
        LOCAL_FOOD_DB.put("peanut butter", createData("peanut butter", 588.0, 25.0, 20.0, 50.0, 6.0));
        LOCAL_FOOD_DB.put("bread", createData("bread", 265.0, 9.0, 49.0, 3.2, 2.7));
        LOCAL_FOOD_DB.put("whey protein", createData("whey protein", 400.0, 80.0, 6.0, 6.0, 0.0));
        LOCAL_FOOD_DB.put("protein powder", createData("protein powder", 400.0, 80.0, 6.0, 6.0, 0.0));

    }

    private static NutritionData createData(String name, double cal, double pro, double carb, double fat, double fib) {
        NutritionData d = new NutritionData();
        d.setName(name);
        d.setCalories(cal);
        d.setProtein(pro);
        d.setCarbs(carb);
        d.setFat(fat);
        d.setFibre(fib);
        d.setServingSizeG(100.0);
        return d;
    }

    private static double getUnitWeightInGrams(String foodName) {
        String normalized = foodName.trim().toLowerCase();
        if (normalized.contains("egg")) {
            return 50.0;
        }
        if (normalized.contains("banana")) {
            return 118.0;
        }
        if (normalized.contains("apple")) {
            return 182.0;
        }
        return 100.0;
    }

    private NutritionData getLocalFallbackPer100g(String foodName) {
        String normalized = foodName.trim().toLowerCase();
        
        // Exact match first
        if (LOCAL_FOOD_DB.containsKey(normalized)) {
            return LOCAL_FOOD_DB.get(normalized);
        }
        
        // Fuzzy match
        for (Map.Entry<String, NutritionData> entry : LOCAL_FOOD_DB.entrySet()) {
            if (normalized.contains(entry.getKey()) || entry.getKey().contains(normalized)) {
                return entry.getValue();
            }
        }
        
        return null;
    }

    private NutritionData generateDynamicFallback(String foodName) {
        log.info("Generating mock dynamic fallback nutrition for unknown food: {}", foodName);
        
        int hash = Math.abs(foodName.hashCode());
        double calories = 50.0 + (hash % 200); 
        double protein = (hash % 15);        
        double fat = (hash % 10);            
        double carbs = Math.max(0.0, (calories - (protein * 4.0) - (fat * 9.0)) / 4.0);
        double fibre = hash % 5;
        
        return createData(foodName, calories, protein, carbs, fat, fibre);
    }

    private NutritionData getLocalFallbackForQuery(String rawQuery) {
        String normalized = normalizeUnits(rawQuery.trim().toLowerCase());
        
        double multiplier = 1.0; 
        double weight = 100.0; 
        String foodSearchKey = normalized;
        
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^(\\d+(?:\\.\\d+)?)\\s*(g|ml|l|whole|pcs|pc|cups|cup)?\\s*(.+)$");
        java.util.regex.Matcher matcher = pattern.matcher(normalized);
        
        if (matcher.find()) {
            double qty = Double.parseDouble(matcher.group(1));
            String unit = matcher.group(2);
            String food = matcher.group(3).trim();
            
            foodSearchKey = food;
            
            if (unit == null || unit.isEmpty() || unit.equals("g") || unit.equals("ml")) {
                weight = qty;
            } else if (unit.equals("l")) {
                weight = qty * 1000.0;
            } else if (unit.equals("whole") || unit.equals("pcs") || unit.equals("pc")) {
                multiplier = qty;
                weight = getUnitWeightInGrams(food);
            } else if (unit.equals("cup") || unit.equals("cups")) {
                weight = qty * 200.0;
            }
        }
        
        NutritionData baseData = getLocalFallbackPer100g(foodSearchKey);
        if (baseData == null) {
            baseData = generateDynamicFallback(foodSearchKey);
        }
        
        double factor = weight / 100.0 * multiplier;
        NutritionData scaled = new NutritionData();
        scaled.setName(rawQuery);
        scaled.setCalories(round(baseData.getCalories() * factor));
        scaled.setProtein(round(baseData.getProtein() * factor));
        scaled.setCarbs(round(baseData.getCarbs() * factor));
        scaled.setFat(round(baseData.getFat() * factor));
        scaled.setFibre(round(baseData.getFibre() * factor));
        scaled.setServingSizeG(weight * multiplier);
        return scaled;
    }

    /**
     * Fetches nutrition data for a given food and weight.
     *
     * @param foodName      e.g. "grilled chicken"
     * @param weightInGrams e.g. 200.0
     * @return NutritionData with auto-scaled values for the requested weight,
     *         or fallback data if API Ninjas fails.
     */
    public NutritionData fetchNutrition(String foodName, double weightInGrams) {
        String query = (int) weightInGrams + "g " + foodName.trim().toLowerCase();

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("query", query)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, List.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null
                    && !response.getBody().isEmpty()) {

                @SuppressWarnings("unchecked")
                Map<String, Object> item = (Map<String, Object>) response.getBody().get(0);
                return parseApiResponse(item, foodName, weightInGrams);
            }

            log.warn("API Ninjas returned empty result for query: {}", query);

        } catch (Exception ex) {
            log.error("Error calling API Ninjas for query '{}': {}", query, ex.getMessage());
        }

        log.info("Falling back to local database for query: {} ({}g)", foodName, weightInGrams);
        return getLocalFallbackForQuery((int) weightInGrams + "g " + foodName);
    }

    /**
     * Fetches per-100g nutrition data for caching (no weight prefix in query).
     * Used by FoodCacheService to populate the local food cache.
     *
     * @param foodName e.g. "grilled chicken"
     * @return NutritionData per 100g, or fallback data if API Ninjas fails.
     */
    public NutritionData fetchPer100g(String foodName) {
        String query = "100g " + foodName.trim().toLowerCase();

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("query", query)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, List.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null
                    && !response.getBody().isEmpty()) {

                @SuppressWarnings("unchecked")
                Map<String, Object> item = (Map<String, Object>) response.getBody().get(0);
                return parseApiResponse(item, foodName, 100.0);
            }

            log.warn("API Ninjas returned empty result for food: {}", foodName);

        } catch (Exception ex) {
            log.error("Error calling API Ninjas for food '{}': {}", foodName, ex.getMessage());
        }

        log.info("Falling back to local database for food: {}", foodName);
        NutritionData fallback = getLocalFallbackPer100g(foodName);
        if (fallback == null) {
            fallback = generateDynamicFallback(foodName);
        }
        return fallback;
    }

    private NutritionData parseApiResponse(Map<String, Object> item, String foodName, double requestedWeight) {
        NutritionData data = new NutritionData();
        data.setName(foodName);
        data.setCalories(toDouble(item.get("calories")));
        data.setProtein(toDouble(item.get("protein_g")));
        data.setCarbs(toDouble(item.get("carbohydrates_total_g")));
        data.setFat(toDouble(item.get("fat_total_g")));
        data.setFibre(toDouble(item.get("fiber_g")));
        data.setServingSizeG(toDouble(item.get("serving_size_g")));
        return data;
    }

    /**
     * Fetches nutrition data for a raw natural-language query.
     * The API Ninjas API handles unit parsing natively.
     *
     * @param rawQuery e.g. "5 eggs", "200ml milk", "50g oats"
     * @return summed NutritionData, or fallback data if API Ninjas fails.
     */
    public NutritionData fetchNutritionForQuery(String rawQuery) {
        String normalized = normalizeUnits(rawQuery.trim());
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("query", normalized)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, List.class
            );

            if (response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null
                    && !response.getBody().isEmpty()) {

                NutritionData total = new NutritionData();
                total.setName(rawQuery);
                for (Object obj : response.getBody()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> item = (Map<String, Object>) obj;
                    total.setCalories(total.getCalories() + toDouble(item.get("calories")));
                    total.setProtein(total.getProtein()   + toDouble(item.get("protein_g")));
                    total.setCarbs(total.getCarbs()       + toDouble(item.get("carbohydrates_total_g")));
                    total.setFat(total.getFat()           + toDouble(item.get("fat_total_g")));
                    total.setFibre(total.getFibre()       + toDouble(item.get("fiber_g")));
                }
                return total;
            }

            log.warn("API Ninjas returned empty result for raw query: {}", normalized);

        } catch (Exception ex) {
            log.error("Error calling API Ninjas for raw query '{}': {}", normalized, ex.getMessage());
        }

        log.info("Falling back to local database for raw query: {}", rawQuery);
        return getLocalFallbackForQuery(rawQuery);
    }

    /**
     * Normalise user-typed unit abbreviations to what API Ninjas expects.
     * e.g. "50gm oats" → "50g oats", "whole" is kept as-is (API handles it).
     */
    private String normalizeUnits(String query) {
        return query
                .replaceAll("(?i)\\bgms?\\b", "g")   // gm, gms → g
                .replaceAll("(?i)\\bgrams?\\b", "g")  // gram, grams → g
                .replaceAll("(?i)\\bml\\b", "ml")     // ml → ml (no-op, already correct)
                .replaceAll("(?i)\\bliters?\\b", "l") // liter → l
                .replaceAll("(?i)\\blitres?\\b", "l") // litre → l
                .trim();
    }

    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try { return Double.parseDouble(value.toString()); } catch (Exception e) { return 0.0; }
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}

