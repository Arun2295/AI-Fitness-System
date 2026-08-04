package com.aifitness.nutrition.Repository;

import com.aifitness.nutrition.Entity.FoodItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends MongoRepository<FoodItem, String> {

    Optional<FoodItem> findByNameIgnoreCase(String name);

    List<FoodItem> findByNameContainingIgnoreCase(String query);
}
