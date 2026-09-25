package com.madhurya.sladesk.security;

import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // Spring's own User class, written in full to avoid clashing with our entity
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPasswordHash())
                .roles(u.getRole().name())       // becomes authority ROLE_AGENT etc.
                .build();
    }
}
