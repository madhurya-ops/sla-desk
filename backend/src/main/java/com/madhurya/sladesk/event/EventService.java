package com.madhurya.sladesk.event;

import com.madhurya.sladesk.ticket.Ticket;
import com.madhurya.sladesk.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EventService {
    private final TicketEventRepository repo;

    /** actor == null means the system or the AI did it. */
    public void record(Ticket t, User actor, EventType type, String from, String to, String message) {
        TicketEvent e = new TicketEvent();
        e.setTicket(t);
        e.setActor(actor);
        e.setType(type);
        e.setFromValue(from);
        e.setToValue(to);
        e.setMessage(message);
        e.setCreatedAt(Instant.now());
        repo.save(e);
    }
}
