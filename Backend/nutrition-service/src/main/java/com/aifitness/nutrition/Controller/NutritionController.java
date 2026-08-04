package com.aifitness.nutrition.Controller;

import com.aifitness.nutrition.DTO.RequestDTO.LogCombinedMealRequest;
import com.aifitness.nutrition.DTO.RequestDTO.LogMealRequest;
import com.aifitness.nutrition.DTO.RequestDTO.NutritionPreviewRequest;
import com.aifitness.nutrition.DTO.ResponseDTO.CombinedMealPreviewResponse;
import com.aifitness.nutrition.DTO.ResponseDTO.DailySummaryResponse;
import com.aifitness.nutrition.DTO.ResponseDTO.MealEntryResponse;
import com.aifitness.nutrition.DTO.ResponseDTO.NutritionPreviewResponse;
import com.aifitness.nutrition.DTO.ResponseDTO.MealPresetResponse;
import com.aifitness.nutrition.DTO.ResponseDTO.NutritionArticle;
import com.aifitness.nutrition.Entity.FoodItem;
import com.aifitness.nutrition.Service.FoodCacheService;
import com.aifitness.nutrition.Service.MealLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NutritionController {

    private final MealLogService mealLogService;
    private final FoodCacheService foodCacheService;

    // ── Simple Meal Preview ──────────────────────────────────────────────────

    /**
     * POST /api/nutrition/preview
     * Live nutrition preview for a single food + weight (no save).
     * Body: { "foodName": "grilled chicken", "weightInGrams": 200 }
     */
    @PostMapping("/preview")
    public ResponseEntity<NutritionPreviewResponse> previewNutrition(
            @RequestBody @Valid NutritionPreviewRequest request) {
        NutritionPreviewResponse response = mealLogService.previewNutrition(
                request.getFoodName(), request.getWeightInGrams()
        );
        return ResponseEntity.ok(response);
    }

    // ── Combo Meal Preview ───────────────────────────────────────────────────

    /**
     * POST /api/nutrition/preview/combined
     * Live nutrition preview for a combo meal description (no save).
     * Body: { "mealDescription": "5 whole eggs + 200ml milk + 50gm oats" }
     * Returns per-item breakdown + grand totals.
     */
    @PostMapping("/preview/combined")
    public ResponseEntity<CombinedMealPreviewResponse> previewCombinedMeal(
            @RequestBody java.util.Map<String, String> body) {
        String desc = body.getOrDefault("mealDescription", "");
        if (desc.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(mealLogService.previewCombinedMeal(desc));
    }

    // ── Simple Meal Logging ──────────────────────────────────────────────────

    /**
     * POST /api/nutrition/meals
     * Log a meal. User provides ONLY: foodName, weightInGrams, mealType.
     * All nutrition data is fetched automatically.
     *
     * Header: X-User-Id (set by API Gateway from JWT)
     * Body: { "foodName": "grilled chicken", "weightInGrams": 200, "mealType": "LUNCH" }
     */
    @PostMapping("/meals")
    public ResponseEntity<MealEntryResponse> logMeal(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid LogMealRequest request) {

        MealEntryResponse response = mealLogService.logMeal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── Combo Meal Logging ───────────────────────────────────────────────────

    /**
     * POST /api/nutrition/meals/combined
     * Log a multi-food combo meal. User types the full description:
     *   "5 whole eggs + 200ml milk + 50gm oats"
     *   "100g rice + 150g dal + 30g paneer"
     *
     * System parses each "+" item, fetches nutrition separately, and stores
     * a single meal entry with summed nutrition values.
     *
     * Header: X-User-Id (set by API Gateway from JWT)
     * Body: { "mealDescription": "5 whole eggs + 200ml milk + 50gm oats", "mealType": "BREAKFAST" }
     */
    @PostMapping("/meals/combined")
    public ResponseEntity<MealEntryResponse> logCombinedMeal(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid LogCombinedMealRequest request) {

        MealEntryResponse response = mealLogService.logCombinedMeal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/nutrition/meals?date=2026-08-01
     * Get all meal entries for the authenticated user on a specific date.
     */
    @GetMapping("/meals")
    public ResponseEntity<List<MealEntryResponse>> getDailyMeals(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(mealLogService.getDailyMeals(userId, targetDate));
    }

    /**
     * GET /api/nutrition/meals/summary?date=2026-08-01
     * Get daily nutrition totals (calories, protein, carbs, fat, fibre) for a date.
     */
    @GetMapping("/meals/summary")
    public ResponseEntity<DailySummaryResponse> getDailySummary(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(mealLogService.getDailySummary(userId, targetDate));
    }

    /**
     * DELETE /api/nutrition/meals/{id}
     * Delete a meal entry (only the owner can delete it).
     */
    @DeleteMapping("/meals/{id}")
    public ResponseEntity<Void> deleteMeal(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id) {

        mealLogService.deleteMeal(userId, id);
        return ResponseEntity.noContent().build();
    }

    // ── Food Cache Search ────────────────────────────────────────────────────

    /**
     * GET /api/nutrition/meals/presets
     * Get Veg & Non-Veg preset meal sheets with macros, vitamins, and antioxidants.
     */
    @GetMapping("/meals/presets")
    public ResponseEntity<MealPresetResponse> getMealPresets() {
        return ResponseEntity.ok(mealLogService.getMealPresets());
    }

    /**
     * GET /api/nutrition/articles
     * Get educational articles about nutrition diet, macros, vitamins, and recovery.
     */
    @GetMapping("/articles")
    public ResponseEntity<List<NutritionArticle>> getNutritionArticles() {
        return ResponseEntity.ok(mealLogService.getNutritionArticles());
    }

    /**
     * GET /api/nutrition/foods/search?query=chicken
     * Search cached food items (previously looked up foods).
     * Useful for autocomplete suggestions in the UI.
     */
    @GetMapping("/foods/search")
    public ResponseEntity<List<FoodItem>> searchFoods(@RequestParam String query) {
        return ResponseEntity.ok(foodCacheService.searchCachedFoods(query));
    }
}
