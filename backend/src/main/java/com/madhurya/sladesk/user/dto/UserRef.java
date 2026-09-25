package com.madhurya.sladesk.user.dto;

import com.madhurya.sladesk.user.User;

public record UserRef(Long id, String fullName) {
    public static UserRef from(User u) {
        return u == null ? null : new UserRef(u.getId(), u.getFullName());
    }
}
