package com.aifitness.userservice.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.aifitness.userservice.Repository.Repo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import com.aifitness.userservice.Entity.Entity;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private Repo userRepo;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Entity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));  
                
                
                return new User(
                    user.getEmail(),
                    user.getPassword() != null ? user.getPassword() : "",
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                );
    }



}
