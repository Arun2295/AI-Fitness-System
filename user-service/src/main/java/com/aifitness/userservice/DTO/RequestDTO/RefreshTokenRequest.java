package com.aifitness.userservice.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")

    private String refreshToken;

}
