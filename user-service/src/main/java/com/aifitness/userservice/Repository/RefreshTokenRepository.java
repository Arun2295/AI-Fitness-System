package com.aifitness.userservice.Repository;

import com.aifitness.userservice.Entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;     
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String>{

    Optional<RefreshToken>  findByToken(String token);
    void deleteByToken(String token);
    void deleteByUserId(String userId);


}
