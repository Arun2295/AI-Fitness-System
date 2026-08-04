package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresetMealItem {
    private String name;
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private double fibre;
    private String highInVitamin;
    private boolean antioxidant;
    private String antioxidantDescription;
}
