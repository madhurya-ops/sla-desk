package com.madhurya.sladesk.event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
    List<TicketEvent> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}