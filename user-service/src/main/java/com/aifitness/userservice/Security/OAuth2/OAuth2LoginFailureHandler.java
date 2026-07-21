package com.aifitness.userservice.Security.OAuth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginFailureHandler.class);

    @Value("${app.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        logger.error("OAuth2 authentication pipeline failed: {}", exception.getMessage());

        String errorMessage = exception.getMessage() != null
                ? exception.getMessage()
                : "OAuth2 authentication failed";

        String redirectUrl = frontendRedirectUrl
                + "?error=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}
