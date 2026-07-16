package com.aifitness.userservice.Security.OAuth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import com.aifitness.userservice.Repository.Repo;
import com.aifitness.userservice.Entity.Entity;
import com.aifitness.userservice.Enum.AuthProvider;
import com.aifitness.userservice.Enum.Role;
import java.util.Optional;

@Service
public class CustomOauth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOauth2UserService.class);

    @Autowired
    private Repo repo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String providerId = oauth2User.getAttribute("sub");

        logger.info("OAuth2 login process initialized for User: {}", email);

        Optional<Entity> optionalUser = repo.findByAuthProviderAndEmail(AuthProvider.GOOGLE, email);
        Entity user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            boolean updated = false;

            if (name != null && !name.equals(user.getFirstName())) {
                String[] nameParts = name.split(" ", 2);
                user.setFirstName(nameParts[0]);
                user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
                updated = true;
            }

            if (providerId != null && !providerId.equals(user.getProviderId())) {
                user.setProviderId(providerId);
                updated = true;
            }

            if (updated) {
                user = repo.save(user);
                logger.info("User information updated for User: {}", email);
            }
        } else {
            // Account verification to prevent account collision hijacking
            Optional<Entity> existingUser = repo.findByEmail(email);
            if (existingUser.isPresent()) {
                logger.warn("Oauth2 sign in rejected : {} is already  registered via local credentials", email);
                throw new OAuth2AuthenticationException(
                        "An account with this email is already registered locally. Please log in with password.");
            }

            // Create new Google Auth user record
            user = new Entity();
            String[] nameParts = name != null ? name.split(" ", 2) : new String[] { "", "" };
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            user.setEmail(email);
            user.setPassword(null);
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            user.setRole(Role.USER);

            // fitness details
            user.setPhone(null);
            user.setGender(null);
            user.setHeight(null);
            user.setWeight(null);
            user.setAge(0);
            user.setActivityLevel(null);
            user.setGoal(null);

            user = repo.save(user);
            logger.info("New user created via OAuth2 login: {}", email);
        }

        return new CustomeOauth2User(oauth2User, user);
    }
}
