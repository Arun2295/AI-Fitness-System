package com.aifitness.userservice.Security.JWT;

import org.springframework.stereotype.Service;

import lombok.val;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import javax.crypto.SecretKey;
import java.util.function.Function;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.SecretKeySpec;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.accessTokenExpiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refreshTokenExpiration}")
    private long refreshTokenExpiration;


    //generate access token
    public String generateAccessToken(String userId, String email, String role){

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("tokenType", "ACCESS");
        return buildToken(claims, email, accessTokenExpiration);
    }

    //generate refresh token
    public String generateRefreshToken(String userId, String email){
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("tokenType", "REFRESH");
        return buildToken(claims, email, refreshTokenExpiration);   
    }

    // genrate token with claims
    private String buildToken(Map<String, Object> extractClaims, String subject,  long expiration){
        return Jwts.builder()
                .claims(extractClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    //token validation
    public boolean isTokenValid(String token, UserDetails userDetails){
        
        try{
            final String email = extractEmail(token);
            return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        }catch(Exception e){
            logger.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    //extract email from token
    public boolean validateToken(String token){
        try{
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        }catch(SignatureException e){
            logger.error("Invalid Jwt signature: {}", e.getMessage());
        }catch(MalformedJwtException e){
            logger.error("Invalid Jwt token: {}",e.getMessage());
        }catch(ExpiredJwtException e){
            logger.error("Jwt token is expired: {}", e.getMessage());
        }catch(UnsupportedJwtException e){
            logger.error("Unsupported Jwt token: {}", e.getMessage());
        }catch(IllegalArgumentException e){
            logger.error("Jwt token claim is empty: {}", e.getMessage());
        }
        return false;

    }

    //claims extraction
    public String extractEmail(String token){
        return extractClaim(token, Claims::getSubject);

    }

    public String extractUserId(String token){
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public String extractRole(String token){
        return extractClaim(token, claims -> claims.get("role", String.class));
    }
    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){

        final Claims claims =  extractAllClaims(token);
        return claimsResolver.apply(claims);

    }

    private Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    private SecretKey getSigningKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Long getAccessTokenExpiration(){
        return accessTokenExpiration;
    }

    private Long getRefreshTokenExpiration(){
        return refreshTokenExpiration;
    }

}
