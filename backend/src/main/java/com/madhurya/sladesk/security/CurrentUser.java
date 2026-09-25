package com.madhurya.sladesk.security;

import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {
    private final UserRepository users;

    public User get() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow();
    }
}
