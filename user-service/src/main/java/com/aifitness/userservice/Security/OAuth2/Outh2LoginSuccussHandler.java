package com.aifitness.userservice.Security.OAuth2;

import org.springframework.stereotype.Component;

import com.aifitness.userservice.Entity.Entity;
import com.aifitness.userservice.Security.JWT.JwtService;
import com.aifitness.userservice.Service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class Outh2LoginSuccussHandler implements AuthenticationSuccessHandler {
    private static final Logger logger = LoggerFactory.getLogger(Outh2LoginSuccussHandler.class);

    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String COOKIE_PATH = "/";

    @Autowired
    private JwtService jwtService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AuthService authService;

    @Value("${app.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        org.springframework.security.core.Authentication authentication)
            throws java.io.IOException, ServletException {

        CustomeOauth2User oauth2User = (CustomeOauth2User) authentication.getPrincipal();
        Entity user = oauth2User.getUser();
        logger.info("OAuth2 login process completed for User: {}", user.getEmail());
        
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        String refreshToken = authService.createRefreshToken(user.getId());

        ResponseCookie accessTokenCookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, accessToken)
                .httpOnly(false)
                .secure(false)
                .sameSite("Lax")
                .path(COOKIE_PATH)
                .maxAge(jwtService.getAccessTokenExpiration() / 1000)
                 // 1 hour
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        boolean profileComplete = checkProfileCompletion(user);

        String redirectUrl = frontendRedirectUrl
                + "?refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                + "&profileComplete=" + profileComplete;

        logger.info("Redirecting to frontend URL: {}", redirectUrl);
        response.sendRedirect(redirectUrl);

            
    }
    private boolean checkProfileCompletion(Entity user) {
        return user.getGender() != null
                && user.getHeight() != null
                && user.getWeight() != null
                && user.getAge() > 0
                && user.getActivityLevel() != null
                && user.getGoal() != null;

    }

}
