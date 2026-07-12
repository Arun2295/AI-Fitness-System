package com.aifitness.userservice.Security.JWT;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import jakarta.servlet.http.Cookie;
import com.aifitness.userservice.Security.CustomUserDetailService;



@Component
public class AuthenticationFilter extends OncePerRequestFilter{
    
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    private static final String Access_Token_Cookie = "access_token";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try{
            String jwt = extractJwtFromRequest(request);
            if(jwt != null && jwtService.validateToken(jwt)){

                String email = jwtService.extractEmail(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if(jwtService.isTokenValid(email, userDetails)){

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);



                }

            }
        }catch(Exception e){
            logger.error("Could not set user authentication in security context", e);
        }
        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request){

        Cookie[] cookies = request.getCookies();

        if(cookies != null){
            for(Cookie cookie : cookies){
                if(Access_Token_Cookie.equals(cookie.getName())){
                    String token  = cookie.getValue();
                    if(StringUtils.hasText(token)){
                        return token;
                    }
                }
            }

        }
        

        //for postman testing
        String bearerToken = request.getHeader("Authorization");
        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }


}
