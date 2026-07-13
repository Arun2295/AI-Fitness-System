package com.aifitness.userservice.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.aifitness.userservice.Service.AuthService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import com.aifitness.userservice.DTO.RequestDTO.LoginRequest;
import com.aifitness.userservice.DTO.RequestDTO.RefreshTokenRequest;
import com.aifitness.userservice.DTO.RequestDTO.RegisterRequest;
import com.aifitness.userservice.DTO.ResponseDTO.AuthResponse;
import com.aifitness.userservice.Security.JWT.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import org.springframework.http.HttpHeaders;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String COOKIE_PATH = "/";

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {

        AuthResponse authResponse = authService.register(request);

        addAccessTokenCookie(response, authResponse.getAccessToken(), jwtService.getAccessTokenExpiration());

        authResponse.setAccessToken(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        addAccessTokenCookie(response, authResponse.getAccessToken(), jwtService.getAccessTokenExpiration());

        authResponse.setAccessToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.refreshToken(request);

        addAccessTokenCookie(response, authResponse.getAccessToken(), jwtService.getAccessTokenExpiration());

        authResponse.setAccessToken(null);
        return ResponseEntity.ok(authResponse);
    }

    // logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = ACCESS_TOKEN_COOKIE, required = false) String cookieToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {

        String token = cookieToken;
        if (token == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

        }
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not Authenticatio token provided"));

        }

        String userId = jwtService.extractUserId(token);
        authService.logout(userId);

        clearAccessTokenCookie(response);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

    }

    // add add accessToken to cookies
    private void addAccessTokenCookie(HttpServletResponse response, String token, long expirationMs) {

        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
                .httpOnly(false)
                .secure(false)
                .sameSite("strict")
                .path(COOKIE_PATH)
                .maxAge(expirationMs / 1000)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

    }

    // clear access token

    private void clearAccessTokenCookie(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, " ")
                .httpOnly(false)
                .secure(false)
                .sameSite("strict")
                .path(COOKIE_PATH)
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
