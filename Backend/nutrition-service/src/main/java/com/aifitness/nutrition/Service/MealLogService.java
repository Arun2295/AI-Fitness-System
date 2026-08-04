package com.aifitness.nutrition.Service;

import com.aifitness.nutrition.DTO.RequestDTO.LogCombinedMealRequest;
import com.aifitness.nutrition.DTO.RequestDTO.LogMealRequest;
import com.aifitness.nutrition.DTO.ResponseDTO.*;
import com.aifitness.nutrition.Entity.MealEntry;
import com.aifitness.nutrition.Exception.ResourceNotFoundException;
import com.aifitness.nutrition.ExternalApi.NutritionApiClient;
import com.aifitness.nutrition.ExternalApi.NutritionData;
import com.aifitness.nutrition.Repository.MealEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealLogService {

    private final MealEntryRepository mealEntryRepository;
    private final FoodCacheService foodCacheService;
    private final NutritionApiClient nutritionApiClient;

    // ── Simple Meal (single food + weight) ───────────────────────────────────

    /**
     * Previews nutrition for a food + weight WITHOUT saving.
     * Used by the frontend for live, real-time display as the user types.
     */
    public NutritionPreviewResponse previewNutrition(String foodName, double weightInGrams) {
        NutritionData data = foodCacheService.getNutrition(foodName, weightInGrams);

        if (data == null) {
            return NutritionPreviewResponse.builder()
                    .foodName(foodName)
                    .weightInGrams(weightInGrams)
                    .found(false)
                    .build();
        }

        return NutritionPreviewResponse.builder()
                .foodName(foodName)
                .weightInGrams(weightInGrams)
                .calories(data.getCalories())
                .protein(data.getProtein())
                .carbs(data.getCarbs())
                .fat(data.getFat())
                .fibre(data.getFibre())
                .found(true)
                .build();
    }

    /**
     * Logs a simple single-food meal.
     * User provides food name + weight — all nutrition auto-fetched.
     */
    public MealEntryResponse logMeal(String userId, LogMealRequest request) {
        NutritionData nutrition = foodCacheService.getNutrition(
                request.getFoodName(), request.getWeightInGrams()
        );

        if (nutrition == null) {
            throw new RuntimeException(
                    "Could not find nutrition data for '" + request.getFoodName() +
                    "'. Try a different spelling, e.g. 'chicken breast' instead of 'chkn'."
            );
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        MealEntry entry = new MealEntry();
        entry.setUserId(userId);
        entry.setFoodName(request.getFoodName().trim());
        entry.setWeightInGrams(request.getWeightInGrams());
        entry.setMealType(request.getMealType());
        entry.setDate(date);
        entry.setCalories(nutrition.getCalories());
        entry.setProtein(nutrition.getProtein());
        entry.setCarbs(nutrition.getCarbs());
        entry.setFat(nutrition.getFat());
        entry.setFibre(nutrition.getFibre());
        entry.setCreatedAt(LocalDateTime.now());

        MealEntry saved = mealEntryRepository.save(entry);
        log.info("Logged simple meal for user {}: {} {}g → {} kcal", userId,
                request.getFoodName(), request.getWeightInGrams(), nutrition.getCalories());
        return toResponse(saved);
    }

    // ── Combo Meal (multi-food, e.g. "5 eggs + 200ml milk + 50gm oats") ─────

    /**
     * Parses a combo meal description and fetches nutrition per item, WITHOUT saving.
     * Called by the frontend for live preview as the user types.
     *
     * Input:  "5 whole eggs + 200ml milk + 50gm oats"
     * Output: per-item preview list + summed totals
     */
    public CombinedMealPreviewResponse previewCombinedMeal(String mealDescription) {
        List<String> parts = parseMealItems(mealDescription);
        List<ComboItemPreview> previews = new ArrayList<>();
        boolean allFound = true;

        double totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;

        for (String part : parts) {
            NutritionData data = nutritionApiClient.fetchNutritionForQuery(part);

            if (data == null) {
                previews.add(ComboItemPreview.builder()
                        .query(part).found(false).build());
                allFound = false;
            } else {
                previews.add(ComboItemPreview.builder()
                        .query(part).found(true)
                        .calories(round(data.getCalories()))
                        .protein(round(data.getProtein()))
                        .carbs(round(data.getCarbs()))
                        .fat(round(data.getFat()))
                        .fibre(round(data.getFibre()))
                        .build());
                totalCal  += data.getCalories();
                totalPro  += data.getProtein();
                totalCarb += data.getCarbs();
                totalFat  += data.getFat();
                totalFib  += data.getFibre();
            }
        }

        return CombinedMealPreviewResponse.builder()
                .mealDescription(mealDescription)
                .items(previews)
                .totalCalories(round(totalCal))
                .totalProtein(round(totalPro))
                .totalCarbs(round(totalCarb))
                .totalFat(round(totalFat))
                .totalFibre(round(totalFib))
                .allFound(allFound)
                .build();
    }

    /**
     * Logs a combo meal as a SINGLE meal entry with summed nutrition.
     * The full description is stored in mealDescription for display.
     */
    public MealEntryResponse logCombinedMeal(String userId, LogCombinedMealRequest request) {
        List<String> parts = parseMealItems(request.getMealDescription());
        if (parts.isEmpty()) {
            throw new RuntimeException("Meal description is empty. Example: 5 eggs + 200ml milk + 50g oats");
        }

        double totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;
        List<String> notFound = new ArrayList<>();

        for (String part : parts) {
            NutritionData data = nutritionApiClient.fetchNutritionForQuery(part);
            if (data == null) {
                notFound.add(part);
            } else {
                totalCal  += data.getCalories();
                totalPro  += data.getProtein();
                totalCarb += data.getCarbs();
                totalFat  += data.getFat();
                totalFib  += data.getFibre();
            }
        }

        if (!notFound.isEmpty() && totalCal == 0) {
            throw new RuntimeException(
                    "Could not find nutrition data for: " + String.join(", ", notFound) +
                    ". Check spelling and try again."
            );
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        // Use the full description as the display name
        String displayName = request.getMealDescription().trim();

        MealEntry entry = new MealEntry();
        entry.setUserId(userId);
        entry.setFoodName(displayName);                            // full combo for display
        entry.setMealDescription(request.getMealDescription().trim()); // structured storage
        entry.setWeightInGrams(0);                                 // embedded in description
        entry.setMealType(request.getMealType());
        entry.setDate(date);
        entry.setCalories(round(totalCal));
        entry.setProtein(round(totalPro));
        entry.setCarbs(round(totalCarb));
        entry.setFat(round(totalFat));
        entry.setFibre(round(totalFib));
        entry.setCreatedAt(LocalDateTime.now());

        MealEntry saved = mealEntryRepository.save(entry);
        log.info("Logged combo meal for user {}: '{}' → {} kcal", userId, displayName, totalCal);
        return toResponse(saved);
    }

    // ── Shared endpoints ──────────────────────────────────────────────────────

    /**
     * Returns all meal entries for a user on a given date.
     */
    public List<MealEntryResponse> getDailyMeals(String userId, LocalDate date) {
        return mealEntryRepository.findByUserIdAndDate(userId, date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns aggregated daily nutrition summary for a user.
     */
    public DailySummaryResponse getDailySummary(String userId, LocalDate date) {
        List<MealEntry> entries = mealEntryRepository.findByUserIdAndDate(userId, date);

        double totalCalories = entries.stream().mapToDouble(MealEntry::getCalories).sum();
        double totalProtein  = entries.stream().mapToDouble(MealEntry::getProtein).sum();
        double totalCarbs    = entries.stream().mapToDouble(MealEntry::getCarbs).sum();
        double totalFat      = entries.stream().mapToDouble(MealEntry::getFat).sum();
        double totalFibre    = entries.stream().mapToDouble(MealEntry::getFibre).sum();

        return DailySummaryResponse.builder()
                .date(date)
                .mealCount(entries.size())
                .totalCalories(round(totalCalories))
                .totalProtein(round(totalProtein))
                .totalCarbs(round(totalCarbs))
                .totalFat(round(totalFat))
                .totalFibre(round(totalFibre))
                .meals(entries.stream().map(this::toResponse).toList())
                .build();
    }

    /**
     * Deletes a meal entry (only if it belongs to the given user).
     */
    public void deleteMeal(String userId, String mealId) {
        MealEntry entry = mealEntryRepository.findByIdAndUserId(mealId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal entry", mealId));
        mealEntryRepository.delete(entry);
        log.info("Deleted meal {} for user {}", mealId, userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Splits a meal description by "+" and returns cleaned individual item strings.
     * "5 whole eggs + 200ml milk + 50gm oats" → ["5 whole eggs", "200ml milk", "50gm oats"]
     */
    public List<String> parseMealItems(String description) {
        return Arrays.stream(description.split("\\+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private MealEntryResponse toResponse(MealEntry entry) {
        return MealEntryResponse.builder()
                .id(entry.getId())
                .foodName(entry.getFoodName())
                .mealDescription(entry.getMealDescription())
                .weightInGrams(entry.getWeightInGrams())
                .mealType(entry.getMealType())
                .date(entry.getDate())
                .calories(entry.getCalories())
                .protein(entry.getProtein())
                .carbs(entry.getCarbs())
                .fat(entry.getFat())
                .fibre(entry.getFibre())
                .createdAt(entry.getCreatedAt())
                .build();
    }

    public MealPresetResponse getMealPresets() {
        List<PresetMealItem> veg = new java.util.ArrayList<>();
        veg.add(new PresetMealItem("Oatmeal with Almonds & Banana", 380.0, 12.0, 55.0, 8.0, 9.0, "Vitamin B6 & Potassium", false, null));
        veg.add(new PresetMealItem("Paneer Tikka Salad (200g Paneer)", 540.0, 36.0, 8.0, 40.0, 3.0, "Calcium & Vitamin D", false, null));
        veg.add(new PresetMealItem("Lentil (Dal) Tadka & Brown Rice (1 cup)", 330.0, 14.0, 52.0, 6.0, 12.0, "Iron & Vitamin B9 (Folate)", false, null));
        veg.add(new PresetMealItem("Greek Yogurt with Berries & Honey", 240.0, 18.0, 28.0, 5.0, 4.0, "Vitamin B12 & Calcium", true, "Blueberries & Honey"));
        veg.add(new PresetMealItem("Quinoa Broccoli & Chickpea Bowl", 410.0, 16.0, 60.0, 9.0, 14.0, "Vitamin C & Vitamin K", true, "Broccoli & Peppers"));
        veg.add(new PresetMealItem("Tofu Stir-fry with Bell Peppers & Spinach", 290.0, 20.0, 15.0, 14.0, 6.0, "Vitamin A & Vitamin C", true, "Spinach & Peppers"));
        veg.add(new PresetMealItem("Soya Chunks Curry with Whole Wheat Chapati", 450.0, 35.0, 48.0, 10.0, 11.0, "Iron & Calcium", false, null));
        veg.add(new PresetMealItem("Chia Seed Pudding with Mango", 220.0, 6.0, 30.0, 8.0, 10.0, "Omega-3 & Vitamin A", true, "Chia Seeds & Mango"));
        veg.add(new PresetMealItem("Spinach & Cottage Cheese (Palak Paneer) Wrap", 380.0, 22.0, 32.0, 16.0, 5.0, "Vitamin A, Iron & Calcium", true, "Spinach"));
        veg.add(new PresetMealItem("Mixed Bean Salad with Lemon Dressing", 280.0, 15.0, 44.0, 3.0, 13.0, "Folate & Potassium", true, "Lemon Dressing"));

        List<PresetMealItem> nonVeg = new java.util.ArrayList<>();
        nonVeg.add(new PresetMealItem("Grilled Chicken Breast with Sweet Potato", 420.0, 45.0, 38.0, 7.0, 6.0, "Vitamin A & Vitamin B6", true, "Sweet Potato"));
        nonVeg.add(new PresetMealItem("Baked Salmon with Asparagus", 450.0, 38.0, 6.0, 28.0, 3.0, "Vitamin D, B12 & Omega-3", true, "Asparagus"));
        nonVeg.add(new PresetMealItem("Scrambled Eggs (3) with Whole Wheat Toast", 340.0, 24.0, 24.0, 15.0, 4.0, "Vitamin D, B12 & Choline", false, null));
        nonVeg.add(new PresetMealItem("Turkey & Avocado Wrap", 390.0, 28.0, 26.0, 16.0, 7.0, "Vitamin B3 (Niacin) & Potassium", false, null));
        nonVeg.add(new PresetMealItem("Tuna Salad with Olive Oil & Spinach", 310.0, 32.0, 4.0, 18.0, 2.0, "Vitamin D, B12 & Selenium", true, "Spinach"));
        nonVeg.add(new PresetMealItem("Grilled Shrimp & Quinoa Salad", 380.0, 28.0, 44.0, 8.0, 5.0, "Selenium & Vitamin B12", false, null));
        nonVeg.add(new PresetMealItem("Chicken Stir-fry with Broccoli & Mushrooms", 390.0, 38.0, 12.0, 18.0, 4.0, "Vitamin C, K & B3", true, "Broccoli & Mushrooms"));
        nonVeg.add(new PresetMealItem("Baked Cod (Fish) with Spinach & Lemon", 260.0, 30.0, 5.0, 12.0, 3.0, "Vitamin B12 & Vitamin A", true, "Spinach & Lemon"));
        nonVeg.add(new PresetMealItem("Beef & Broccoli with Brown Rice", 520.0, 36.0, 48.0, 18.0, 5.0, "Zinc, Iron & Vitamin K", false, null));
        nonVeg.add(new PresetMealItem("Chicken & Vegetable Soup", 210.0, 22.0, 14.0, 6.0, 3.0, "Vitamin A & Vitamin C", true, "Carrots & Celery"));

        List<PresetMealItem> preWorkout = new java.util.ArrayList<>();
        preWorkout.add(new PresetMealItem("Oatmeal with Honey & Sliced Banana", 320.0, 8.0, 65.0, 4.0, 6.0, "Vitamin B6 & Potassium", false, null));
        preWorkout.add(new PresetMealItem("Whole Wheat Toast with Peanut Butter", 280.0, 10.0, 35.0, 12.0, 5.0, "Vitamin E & Magnesium", false, null));
        preWorkout.add(new PresetMealItem("Fruit Smoothie with Whey Protein", 310.0, 26.0, 42.0, 3.0, 4.0, "Vitamin C & Calcium", true, "Mixed Berries"));
        preWorkout.add(new PresetMealItem("Rice Cakes with Banana & Honey", 190.0, 3.0, 45.0, 1.0, 2.0, "Potassium & Vitamin B6", false, null));
        preWorkout.add(new PresetMealItem("Baked Sweet Potato with Cinnamon", 160.0, 2.0, 37.0, 0.0, 4.0, "Vitamin A (Beta-carotene)", true, "Sweet Potato"));
        preWorkout.add(new PresetMealItem("Greek Yogurt with Blueberries", 180.0, 15.0, 22.0, 3.0, 2.0, "Calcium & Vitamin B12", true, "Blueberries"));
        preWorkout.add(new PresetMealItem("Apple Slices with Almond Butter", 210.0, 5.0, 24.0, 12.0, 5.0, "Vitamin E & Potassium", true, "Apple Skin"));
        preWorkout.add(new PresetMealItem("Dates (4) with Walnuts", 240.0, 4.0, 44.0, 8.0, 4.0, "Magnesium & Potassium", true, "Dates"));
        preWorkout.add(new PresetMealItem("Granola Bar & Orange Juice", 220.0, 4.0, 48.0, 3.0, 3.0, "Vitamin C & Folate", true, "Orange Juice"));
        preWorkout.add(new PresetMealItem("Cream of Rice with Maple Syrup", 250.0, 4.0, 58.0, 0.5, 1.0, "Iron & Vitamin B1", false, null));

        List<PresetMealItem> postWorkout = new java.util.ArrayList<>();
        postWorkout.add(new PresetMealItem("Grilled Chicken, White Rice & Broccoli", 480.0, 48.0, 50.0, 6.0, 4.0, "Vitamin B6 & Vitamin C", true, "Broccoli"));
        postWorkout.add(new PresetMealItem("Whey Protein Shake & Banana", 290.0, 30.0, 38.0, 2.0, 3.0, "Calcium & Vitamin B6", false, null));
        postWorkout.add(new PresetMealItem("Canned Tuna with Baked Potato & Spinach", 390.0, 35.0, 44.0, 8.0, 5.0, "Vitamin B12 & Vitamin A", true, "Spinach"));
        postWorkout.add(new PresetMealItem("Scrambled Egg Whites (5) & Bagel", 310.0, 28.0, 42.0, 2.0, 2.0, "Selenium & Riboflavin", false, null));
        postWorkout.add(new PresetMealItem("Salmon Fillet with Quinoa & Asparagus", 520.0, 42.0, 38.0, 22.0, 5.0, "Vitamin D, B12 & Omega-3", true, "Asparagus"));
        postWorkout.add(new PresetMealItem("Turkey Sandwich on Sourdough Bread", 360.0, 32.0, 40.0, 5.0, 3.0, "Niacin (B3) & Selenium", false, null));
        postWorkout.add(new PresetMealItem("Tofu Stir-fry with Jasmine Rice & Beans", 380.0, 20.0, 58.0, 8.0, 6.0, "Calcium & Iron", false, null));
        postWorkout.add(new PresetMealItem("Lean Beef Mince with Pasta & Tomato Sauce", 540.0, 38.0, 62.0, 14.0, 4.0, "Zinc & Iron", true, "Lycopene-rich Tomatoes"));
        postWorkout.add(new PresetMealItem("Low-Fat Cottage Cheese with Pineapple", 260.0, 24.0, 32.0, 2.0, 1.0, "Vitamin C & Calcium", false, null));
        postWorkout.add(new PresetMealItem("Protein Pancakes (Oats & Eggs)", 340.0, 28.0, 36.0, 6.0, 4.0, "Riboflavin (B2) & Iron", false, null));

        List<PresetMealItem> recovery = new java.util.ArrayList<>();
        recovery.add(new PresetMealItem("Salmon Salad with Avocado & Walnuts", 550.0, 36.0, 12.0, 42.0, 8.0, "Vitamin E & Omega-3 Fatty Acids", true, "Avocado & Walnuts"));
        recovery.add(new PresetMealItem("Mixed Berry Yogurt Bowl with Chia Seeds", 290.0, 14.0, 36.0, 10.0, 8.0, "Calcium & Vitamin C", true, "Mixed Berries"));
        recovery.add(new PresetMealItem("Turmeric Ginger Tofu & Vegetable Soup", 220.0, 16.0, 20.0, 8.0, 5.0, "Iron, Vitamin A & Curcumin", true, "Turmeric & Ginger"));
        recovery.add(new PresetMealItem("Spinach, Kale & Pineapple Smoothie", 210.0, 5.0, 38.0, 4.0, 6.0, "Vitamin C, K & Iron", true, "Spinach & Kale"));
        recovery.add(new PresetMealItem("Baked Mackerel with Roasted Beetroot", 480.0, 30.0, 18.0, 32.0, 4.0, "Omega-3 & Folate", true, "Beetroot (Nitrates)"));
        recovery.add(new PresetMealItem("Mixed Nuts & Dark Chocolate Bowl", 310.0, 8.0, 24.0, 22.0, 5.0, "Magnesium & Copper", true, "Dark Chocolate Flavonoids"));
        recovery.add(new PresetMealItem("Roasted Chickpea & Avocado Buddha Bowl", 440.0, 14.0, 48.0, 22.0, 12.0, "Folate & Potassium", true, "Avocado"));
        recovery.add(new PresetMealItem("Edamame Salad with Sesame Ginger Dressing", 260.0, 18.0, 22.0, 12.0, 7.0, "Vitamin K & Iron", false, null));
        recovery.add(new PresetMealItem("Steamed Sea Bass with Bok Choy & Garlic", 320.0, 34.0, 8.0, 14.0, 2.0, "Selenium & Vitamin A", true, "Bok Choy & Garlic"));
        recovery.add(new PresetMealItem("Quinoa, Black Bean & Sweet Corn Salad", 330.0, 11.0, 52.0, 6.0, 9.0, "Folate & Magnesium", true, "Black Beans"));

        List<PresetMealItem> injury = new java.util.ArrayList<>();
        injury.add(new PresetMealItem("Bone Broth Soup with Chicken & Carrots", 240.0, 28.0, 8.0, 10.0, 2.0, "Collagen & Vitamin A", true, "Carrots"));
        injury.add(new PresetMealItem("Citrus Chicken Salad with Oranges", 380.0, 36.0, 22.0, 14.0, 4.0, "Vitamin C & Iron", true, "Oranges & Spinach"));
        injury.add(new PresetMealItem("Baked Salmon with Broccoli & Lemon", 450.0, 38.0, 10.0, 28.0, 4.0, "Vitamin D, C & Omega-3", true, "Broccoli & Lemon"));
        injury.add(new PresetMealItem("Greek Yogurt with Kiwi & Pumpkin Seeds", 280.0, 20.0, 24.0, 10.0, 3.0, "Zinc & Vitamin C", true, "Kiwi"));
        injury.add(new PresetMealItem("Tofu & Spinach Scramble with Sesame", 310.0, 22.0, 12.0, 18.0, 5.0, "Zinc, Iron & Calcium", true, "Spinach"));
        injury.add(new PresetMealItem("Lean Beef Sirloin with Asparagus", 430.0, 42.0, 6.0, 24.0, 3.0, "Zinc, Iron & Vitamin K", true, "Asparagus"));
        injury.add(new PresetMealItem("Oysters (6) with Fresh Lemon Salad", 180.0, 16.0, 12.0, 5.0, 1.0, "Zinc, Vitamin B12 & Copper", false, null));
        injury.add(new PresetMealItem("Pumpkin Seed & Almond Crusted Fish Fillet", 350.0, 34.0, 8.0, 18.0, 3.0, "Zinc, Vitamin E & Magnesium", false, null));
        injury.add(new PresetMealItem("Papaya, Chia & Ginger Smoothie", 230.0, 6.0, 38.0, 6.0, 7.0, "Vitamin C & Potassium", true, "Papaya & Ginger"));
        injury.add(new PresetMealItem("Mixed Lentil Stew with Spinach & Lemon", 290.0, 16.0, 42.0, 4.0, 11.0, "Iron, Folate & Vitamin C", true, "Spinach"));

        return new MealPresetResponse(veg, nonVeg, preWorkout, postWorkout, recovery, injury);
    }

    public List<NutritionArticle> getNutritionArticles() {
        List<NutritionArticle> articles = new java.util.ArrayList<>();

        articles.add(NutritionArticle.builder()
            .id("1")
            .title("The Core Foundations of Macronutrients")
            .category("Macros")
            .readTime("5 min read")
            .summary("Learn about carbohydrates, proteins, fats, and how to balance them to maximize energy levels, muscle growth, and metabolic health.")
            .content("Macronutrients are the nutrients your body needs in large amounts to function, provide energy, and sustain life. They are divided into three primary categories:\n\n" +
                     "### 1. Proteins (4 Calories per Gram)\n" +
                     "Protein is the primary building block of the human body, composed of amino acids. It is responsible for tissue growth, muscle repair, enzyme production, and immune function. For active individuals, consuming enough protein is vital to recover from training and maintain lean muscle mass.\n\n" +
                     "- **Sources**: Chicken breast, eggs, tofu, fish, paneer, lentils, whey protein.\n\n" +
                     "### 2. Carbohydrates (4 Calories per Gram)\n" +
                     "Carbohydrates are your body's preferred source of energy. When consumed, carbs are broken down into glucose, which fuels muscular contraction and brain function. Extra glucose is stored in muscles and liver as glycogen.\n\n" +
                     "- **Simple Carbs** (quick energy): Fruits, honey, white rice.\n" +
                     "- **Complex Carbs** (sustained energy): Oats, brown rice, sweet potatoes, whole wheat.\n\n" +
                     "### 3. Fats (9 Calories per Gram)\n" +
                     "Fats are highly energy-dense and play critical roles in hormone production (including testosterone), cell membrane integrity, and the absorption of fat-soluble vitamins (A, D, E, K).\n\n" +
                     "- **Sources**: Avocado, almonds, walnuts, olive oil, pumpkin seeds.")
            .tags(java.util.List.of("macronutrients", "protein", "carbohydrates", "diet-basics"))
            .build());

        articles.add(NutritionArticle.builder()
            .id("2")
            .title("Micronutrients: The Unsung Heroes of Performance")
            .category("Vitamins & Minerals")
            .readTime("6 min read")
            .summary("An in-depth dive into essential vitamins and minerals that boost recovery, immunity, and bone density for active individuals.")
            .content("While macronutrients supply energy, micronutrients (vitamins and minerals) are essential for unlocking that energy and regulating biochemical pathways. Here are key micronutrients for fitness enthusiasts:\n\n" +
                     "### 1. Vitamin D & Calcium\n" +
                     "Working in synergy, Vitamin D and Calcium regulate bone density, joint health, and muscle contraction. Vitamin D also plays a significant role in hormone regulation and immune health.\n\n" +
                     "### 2. Zinc & Vitamin C\n" +
                     "Essential for tissue repair and collagen synthesis. Vitamin C is a powerful water-soluble antioxidant, while Zinc acts as a co-factor in muscle cell regeneration and protein synthesis.\n\n" +
                     "### 3. Magnesium & Potassium\n" +
                     "These key electrolytes prevent muscle cramps, maintain hydration levels, and facilitate neural signaling. Magnesium also promotes muscle relaxation and deep recovery sleep.")
            .tags(java.util.List.of("micronutrients", "vitamins", "minerals", "recovery"))
            .build());

        articles.add(NutritionArticle.builder()
            .id("3")
            .title("Understanding Antioxidants: Combatting Cellular Stress")
            .category("Recovery")
            .readTime("4 min read")
            .summary("Discover what antioxidants are, how free radicals induce muscle fatigue, and how anti-inflammatory foods accelerate muscle recovery.")
            .content("Intense training induces temporary cell damage and cellular oxidation. During this process, reactive molecules called **free radicals** are created. An excess of free radicals damages healthy tissue and prolongs muscle soreness. This is where antioxidants come to the rescue:\n\n" +
                     "### What are Antioxidants?\n" +
                     "Antioxidants are chemical substances that neutralize free radicals by donating an electron, preventing cell degradation. They help reduce systemic inflammation and speed up recovery times.\n\n" +
                     "### Top Anti-inflammatory & Antioxidant Superfoods:\n" +
                     "- **Berries**: Packed with anthocyanins that combat joint inflammation.\n" +
                     "- **Dark Chocolate**: Rich in flavonoids that improve blood flow.\n" +
                     "- **Spinach & Kale**: Loaded with lutein and Vitamin E.\n" +
                     "- **Turmeric & Ginger**: Curcumin in turmeric has potent anti-inflammatory properties similar to over-the-counter recovery aids.")
            .tags(java.util.List.of("antioxidants", "inflammation", "muscle-soreness", "superfoods"))
            .build());

        articles.add(NutritionArticle.builder()
            .id("4")
            .title("The Science of Hydration & Electrolytes")
            .category("Hydration")
            .readTime("4 min read")
            .summary("Why water alone isn't enough during intense exercise. Discover the importance of sodium, potassium, and magnesium for peak athletic output.")
            .content("Dehydration by even 2% of body weight can reduce physical performance by up to 10-20%. However, hydration is not just about drinking water; it's about fluid balance, which requires electrolytes:\n\n" +
                     "### Why Electrolytes Matter\n" +
                     "Electrolytes are minerals that carry an electric charge. They control osmotic pressure (fluid distribution) inside and outside your cells. Sweating causes you to lose water and vital minerals (predominantly Sodium and Potassium).\n\n" +
                     "### Core Electrolytes to Monitor:\n" +
                     "- **Sodium**: Retains fluid in the bloodstream, preventing drop-offs in blood volume.\n" +
                     "- **Potassium**: Works inside cells to regulate muscle contraction and prevent cramping.\n" +
                     "- **Magnesium**: Helps generate ATP (cellular energy) and relaxes skeletal muscles.")
            .tags(java.util.List.of("hydration", "electrolytes", "water-balance", "cramp-prevention"))
            .build());

        articles.add(NutritionArticle.builder()
            .id("5")
            .title("Designing a Sustainable Healthy Eating Pattern")
            .category("Lifestyle")
            .readTime("5 min read")
            .summary("Transition away from restrictive crash diets. Understand the principles of calorie balance, nutrient density, and behavior change.")
            .content("The best diet is the one you can sustain. Restrictive crash diets often trigger metabolic adaptations and strong hunger signals, leading to weight regain. Consider these rules for a sustainable diet:\n\n" +
                     "### 1. Calorie Balance\n" +
                     "Understand that weight management comes down to energy balance. To lose weight, you must be in a slight calorie deficit. To gain muscle, eat in a slight calorie surplus.\n\n" +
                     "### 2. The 80/20 Rule\n" +
                     "Aim for 80% of your daily intake to come from whole, nutrient-dense foods (lean protein, vegetables, complex carbs, healthy fats). Allow the remaining 20% for foods you enjoy to maintain psychological well-being.\n\n" +
                     "### 3. Mindful Eating Habits\n" +
                     "Eat slowly, chew thoroughly, and minimize distractions (like screens) to tune into your body's natural satiety signals.")
            .tags(java.util.List.of("lifestyle", "healthy-eating", "sustainability", "weight-loss"))
            .build());

        return articles;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
