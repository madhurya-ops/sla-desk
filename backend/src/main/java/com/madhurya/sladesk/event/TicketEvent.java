package com.madhurya.sladesk.event;

import com.madhurya.sladesk.ticket.Ticket;
import com.madhurya.sladesk.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ticket_events")
@Getter
@Setter
@NoArgsConstructor
public class TicketEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "ticket_id") private Ticket ticket;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "actor_id") private User actor;  // null = System
    @Enumerated(EnumType.STRING) @Column(nullable = false) private EventType type;
    @Column(name = "from_value") private String fromValue;
    @Column(name = "to_value") private String toValue;
    @Column(columnDefinition = "TEXT") private String message;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
}
