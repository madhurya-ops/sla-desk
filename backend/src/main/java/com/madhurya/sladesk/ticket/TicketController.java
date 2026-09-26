package com.madhurya.sladesk.ticket;

import com.madhurya.sladesk.ticket.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService service;

    @GetMapping
    public List<TicketSummaryDto> list(@RequestParam(required = false) TicketStatus status,
                                       @RequestParam(required = false) SlaState slaState,
                                       @RequestParam(required = false) Priority priority,
                                       @RequestParam(defaultValue = "false") boolean mine) {
        return service.list(status, slaState, priority, mine);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDetailDto create(@Valid @RequestBody CreateTicketRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public TicketDetailDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PatchMapping("/{id}/status")
    public TicketDetailDto changeStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest req) {
        return service.changeStatus(id, req);
    }

    @PatchMapping("/{id}/assignee")
    @PreAuthorize("hasAnyRole('LEAD','MANAGER')")
    public TicketDetailDto assign(@PathVariable Long id, @Valid @RequestBody AssignRequest req) {
        return service.assign(id, req.assigneeId());
    }

    @PostMapping("/{id}/comments")
    public TicketDetailDto comment(@PathVariable Long id, @Valid @RequestBody CommentRequest req) {
        return service.comment(id, req.message());
    }
}
