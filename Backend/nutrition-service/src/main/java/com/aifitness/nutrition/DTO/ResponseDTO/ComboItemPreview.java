package com.aifitness.nutrition.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single parsed item from a combo meal, shown in the live preview.
 * e.g. from "5 whole eggs + 200ml milk" we get two of these.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboItemPreview {

    private String query;        // the raw item string, e.g. "5 whole eggs"
    private boolean found;       // false if API Ninjas couldn't recognise it
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private double fibre;
}
