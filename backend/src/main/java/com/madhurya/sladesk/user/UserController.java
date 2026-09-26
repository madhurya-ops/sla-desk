package com.madhurya.sladesk.user;

import com.madhurya.sladesk.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository users;

    @GetMapping
    @PreAuthorize("hasAnyRole('LEAD','MANAGER')")
    public List<UserDto> list(@RequestParam(required = false) Role role) {
        List<User> result = role == null ? users.findAll() : users.findByRole(role);
        return result.stream().map(UserDto::from).toList();
    }
}
