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
public class NutritionArticle {
    private String id;
    private String title;
    private String category;
    private String readTime;
    private String summary;
    private String content;
    private List<String> tags;
}
