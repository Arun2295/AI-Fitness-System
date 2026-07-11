package com.aifitness.userservice.DTO.ResponseDTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)

public class AuthResponse {

    private String accesstoken;
    private String refreshToken;
    private String tokenType;
    private Long accessTokenExpiry;
    private Long refreshTokenExpiry;
    private UserResponse user;


}
