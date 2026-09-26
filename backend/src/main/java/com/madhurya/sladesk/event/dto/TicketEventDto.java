package com.madhurya.sladesk.event.dto;

import com.madhurya.sladesk.event.EventType;
import com.madhurya.sladesk.event.TicketEvent;

import java.time.Instant;

public record TicketEventDto(Long id, EventType type, String actorName, String fromValue,
                             String toValue, String message, Instant createdAt) {
    public static TicketEventDto from(TicketEvent e) {
        String actor = e.getActor() == null ? "System" : e.getActor().getFullName();
        return new TicketEventDto(e.getId(), e.getType(), actor, e.getFromValue(),
                e.getToValue(), e.getMessage(), e.getCreatedAt());
    }
}
