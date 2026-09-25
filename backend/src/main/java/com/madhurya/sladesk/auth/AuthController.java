package com.madhurya.sladesk.auth;

import com.madhurya.sladesk.auth.dto.LoginRequest;
import com.madhurya.sladesk.auth.dto.LoginResponse;
import com.madhurya.sladesk.security.CurrentUser;
import com.madhurya.sladesk.security.JwtService;
import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import com.madhurya.sladesk.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final JwtService jwtService;
    private final CurrentUser currentUser;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        // Throws BadCredentialsException if the password is wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = users.findByEmail(req.email()).orElseThrow();
        return new LoginResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @GetMapping("/me")
    public UserDto me() {
        return UserDto.from(currentUser.get());
    }
}
