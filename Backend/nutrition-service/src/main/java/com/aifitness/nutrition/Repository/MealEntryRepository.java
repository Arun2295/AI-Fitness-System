package com.aifitness.nutrition.Repository;

import com.aifitness.nutrition.Entity.MealEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealEntryRepository extends MongoRepository<MealEntry, String> {

    List<MealEntry> findByUserIdAndDate(String userId, LocalDate date);

    List<MealEntry> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);

    Optional<MealEntry> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
