package com.madhurya.sladesk.ticket.dto;

import com.madhurya.sladesk.ticket.Category;
import com.madhurya.sladesk.ticket.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(@NotBlank @Size(max = 200) String title,
                                  @NotBlank String description,
                                  Priority priority, Category category) {}
