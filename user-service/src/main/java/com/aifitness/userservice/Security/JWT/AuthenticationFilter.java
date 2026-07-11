package com.aifitness.userservice.Security.JWT;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class AuthenticationFilter extends OncePerRequestFilter{

}
