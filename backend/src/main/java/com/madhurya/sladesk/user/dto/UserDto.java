package com.madhurya.sladesk.user.dto;

import com.madhurya.sladesk.user.Role;
import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.ticket.Category;

public record UserDto(Long id, String email, String fullName, Role role, Category team) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getTeam());
    }
}
