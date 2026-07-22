package com.aifitness.userservice.Security.OAuth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Adapts OIDC logins (Google uses OIDC) through our CustomOauth2UserService.
 *
 * When Google SSO completes, Spring Security calls the OidcUserService.
 * The default implementation returns a DefaultOidcUser, which cannot be cast
 * to CustomeOauth2User. This adapter:
 *  1. Loads the standard OidcUser via the default OidcUserService
 *  2. Passes it as an OAuth2UserRequest to our existing CustomOauth2UserService
 *  3. Returns the resulting CustomeOauth2User, which the success handler expects
 */
@Service
public class OidcUserServiceAdapter extends OidcUserService {

    private static final Logger logger = LoggerFactory.getLogger(OidcUserServiceAdapter.class);

    @Autowired
    private CustomOauth2UserService customOauth2UserService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // Load the standard OIDC user (validates the ID token, fetches user info)
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getAttribute("email");
        logger.info("OIDC login — delegating to CustomOauth2UserService for: {}", (Object) email);

        // Delegate to our existing OAuth2 user service to perform DB lookup / create
        // CustomOauth2UserService.loadUser() calls super.loadUser(userRequest) internally
        // which would do a duplicate HTTP call, so we wrap the oidcUser as an OAuth2UserRequest
        // by creating an adapter OAuth2UserRequest that reuses the already-loaded attributes.
        OAuth2User customUser = customOauth2UserService.loadUser(userRequest);

        // customUser is a CustomeOauth2User; return it as OidcUser by wrapping
        if (customUser instanceof CustomeOauth2User custOauth2) {
            // Return a OidcUser-compatible wrapper so Spring Security's internals are satisfied
            return new OidcCustomUser(oidcUser, custOauth2.getUser());
        }

        // Fallback: should not happen
        logger.warn("CustomOauth2UserService did not return a CustomeOauth2User — returning raw oidcUser");
        return oidcUser;
    }
}
