package com.madhurya.sladesk.ticket;

import com.madhurya.sladesk.user.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @EntityGraph(attributePaths = {"assignee"})     // loads assignees in the same query (avoids N+1)
    List<Ticket> findAll(Sort sort);
    List<Ticket> findByStatusInAndSlaStateIn(Collection<TicketStatus> statuses, Collection<SlaState> states);
    long countByAssigneeAndStatusNot(User assignee, TicketStatus status);
}
