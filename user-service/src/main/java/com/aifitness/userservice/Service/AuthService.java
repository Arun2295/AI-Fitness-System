package com.aifitness.userservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.aifitness.userservice.Repository.Repo;
import com.aifitness.userservice.DTO.RequestDTO.RegisterRequest;
import com.aifitness.userservice.Repository.RefreshTokenRepository;
import com.aifitness.userservice.Security.JWT.JwtService;

import ch.qos.logback.classic.Logger;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import com.aifitness.userservice.DTO.ResponseDTO.AuthResponse;
import com.aifitness.userservice.Entity.Entity;
import com.aifitness.userservice.Enum.Role;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;





@Service
public class AuthService {

    @Autowired
    private Repo userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;


    //register user

    public AuthResponse  register(RegisterRequest request){

        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        Entity user = new Entity();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setRole(Role.USER); // Set default role
        user.setHeight(request.getHeight());
        user.setWeight(request.getWeight());
        user.setAge(request.getAge());
        user.setActivityLevel(request.getActivityLevel());
        user.setGoal(request.getGoal());

        Entity savedUser = userRepository.save(user);
        

        //gen accss token
        String accessToken = jwtService.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        String refreshToken = createRefreshToken(savedUser.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .accessTokenExpiration(jwtService.getAccessTokenExpiration())
                .refreshTokenExpiration(jwtService.getRefreshTokenExpiration())
                .user(mapToUserResponse(savedUser))
                .build();





        
        
    }


}
