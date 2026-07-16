package com.aifitness.userservice.Security.OAuth2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.aifitness.userservice.Entity.Entity;
import java.util.Collection;
import java.util.Map;

public class CustomeOauth2User implements OAuth2User {
        private final OAuth2User oauth2User;
        private final Entity entity;

        public CustomeOauth2User(OAuth2User oauth2User, Entity entity) {
            this.oauth2User = oauth2User;
            this.entity = entity;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return oauth2User.getAttributes();
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return oauth2User.getAuthorities();
        }

        @Override
        public String getName() {
            return oauth2User.getAttribute("sub");
        }

        public String getEmail() {
            return oauth2User.getAttribute("email");
        }

        public Entity getUser(){
            return entity;
        }
}
