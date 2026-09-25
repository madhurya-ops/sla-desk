package com.madhurya.sladesk.auth.dto;

import com.madhurya.sladesk.user.dto.UserDto;

public record LoginResponse(String token, UserDto user) {}
