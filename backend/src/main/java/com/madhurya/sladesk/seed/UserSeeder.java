package com.madhurya.sladesk.seed;

import com.madhurya.sladesk.ticket.Category;
import com.madhurya.sladesk.user.Role;
import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        seed("agent.infra@sladesk.dev", "Arjun (Infra Agent)", Role.AGENT, Category.INFRA);
        seed("agent.app@sladesk.dev", "Priya (App Agent)", Role.AGENT, Category.APPLICATION);
        seed("lead@sladesk.dev", "Rahul (Team Lead)", Role.LEAD, null);
        seed("manager@sladesk.dev", "Sneha (Delivery Manager)", Role.MANAGER, null);
    }

    private void seed(String email, String name, Role role, Category team) {
        if (users.findByEmail(email).isPresent()) return;
        User u = new User();
        u.setEmail(email);
        u.setFullName(name);
        u.setRole(role);
        u.setTeam(team);
        u.setPasswordHash(encoder.encode("Demo@123"));
        users.save(u);
    }
}

