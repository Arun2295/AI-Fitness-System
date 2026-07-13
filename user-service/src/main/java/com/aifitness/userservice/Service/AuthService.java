package com.aifitness.userservice.Service;


import com.aifitness.userservice.DTO.RequestDTO.LoginRequest;
import com.aifitness.userservice.DTO.RequestDTO.RefreshTokenRequest;
import com.aifitness.userservice.DTO.RequestDTO.RegisterRequest;
import com.aifitness.userservice.DTO.ResponseDTO.AuthResponse;
import com.aifitness.userservice.DTO.ResponseDTO.UserResponse;
import com.aifitness.userservice.Entity.Entity;
import com.aifitness.userservice.Entity.RefreshToken;
import com.aifitness.userservice.Enum.Role;
import com.aifitness.userservice.Repository.RefreshTokenRepository;
import com.aifitness.userservice.Repository.Repo;
import com.aifitness.userservice.Security.JWT.JwtService;

//import org.hibernate.validator.internal.util.logging.Log_.logger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;
import java.util.Optional;
import java.util.Date;






@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

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

    //login user

    public AuthResponse login(LoginRequest request){

        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        }catch(BadCredentialsException e){
            throw new RuntimeException("Invalid email or password");
        }

        Entity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));


        refreshTokenRepository.deleteByUserId(user.getId());
        
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = createRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .accessTokenExpiration(jwtService.getAccessTokenExpiration())
                .refreshTokenExpiration(jwtService.getRefreshTokenExpiration())
                .user(mapToUserResponse(user))
                .build();

    }


    //REfresh TOKen
    
    public AuthResponse refreshToken(RefreshTokenRequest request){

        RefreshToken token  = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));


        //check refresh token isvalid
        if(token.isExpired()){
            refreshTokenRepository.deleteByToken(token.getToken());
            throw new RuntimeException("Refresh token expired");
        }

        Entity user  = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));


                String newaccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        logger.info("New access token generated for user: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newaccessToken)
                .refreshToken(token.getToken())
                .tokenType("Bearer")
                .accessTokenExpiration(jwtService.getAccessTokenExpiration())
                .refreshTokenExpiration(token.getExpiresAt().toEpochMilli()-Instant.now().toEpochMilli())
                .user(mapToUserResponse(user))
                .build();
    }



    //logout
    public void logout(String userId){
        
        refreshTokenRepository.deleteByUserId(userId);
        logger.info("User with ID {} logged out successfully", userId);
    }

    //create and stored refresh token in db

    private String createRefreshToken(String userId){

        String tokenValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(tokenValue)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()))
                .createdAt(Instant.now())
                .build();


            refreshTokenRepository.save(refreshToken);
            return tokenValue;



    }

    private UserResponse mapToUserResponse(Entity user){
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhone())
                .role(user.getRole())
                .gender(user.getGender())
                .height(user.getHeight())
                .weight(user.getWeight())
                .age(user.getAge())
                .activityLevel(user.getActivityLevel())
                .goal(user.getGoal())
                .build();
    }
        







}
