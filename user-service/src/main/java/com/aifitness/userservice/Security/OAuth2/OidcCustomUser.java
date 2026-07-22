package com.aifitness.userservice.Security.OAuth2;

import com.aifitness.userservice.Entity.Entity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.Map;

/**
 * Combines OidcUser (required by Spring Security OIDC internals) with
 * our Entity reference (required by Outh2LoginSuccussHandler).
 */
public class OidcCustomUser implements OidcUser {

    private final OidcUser delegate;
    private final Entity entity;

    public OidcCustomUser(OidcUser delegate, Entity entity) {
        this.delegate = delegate;
        this.entity = entity;
    }

    // ── Entity access ─────────────────────────────────────────────────────────

    public Entity getUser() {
        return entity;
    }

    // ── OidcUser ──────────────────────────────────────────────────────────────

    @Override
    public Map<String, Object> getClaims() {
        return delegate.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return delegate.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return delegate.getIdToken();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return delegate.getName();
    }
}
