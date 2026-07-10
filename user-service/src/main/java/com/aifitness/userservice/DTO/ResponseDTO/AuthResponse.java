package com.aifitness.userservice.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {

    private String accesstoken;
    private String refreshToken;
    private String tokenType;
    private Long accessTokenExpiry;
    private Long refreshTokenExpiry;
    private UserResponse user;


}
