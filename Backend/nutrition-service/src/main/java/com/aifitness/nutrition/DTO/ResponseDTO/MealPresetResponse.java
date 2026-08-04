package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPresetResponse {
    private List<PresetMealItem> veg;
    private List<PresetMealItem> nonVeg;
    private List<PresetMealItem> preWorkout;
    private List<PresetMealItem> postWorkout;
    private List<PresetMealItem> recovery;
    private List<PresetMealItem> injury;
}
