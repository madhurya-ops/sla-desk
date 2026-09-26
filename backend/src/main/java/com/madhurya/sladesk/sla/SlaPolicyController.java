package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.common.NotFoundException;
import com.madhurya.sladesk.sla.dto.SlaPolicyDto;
import com.madhurya.sladesk.sla.dto.UpdateSlaPolicyRequest;
import com.madhurya.sladesk.ticket.Priority;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/sla-policies")
@RequiredArgsConstructor
public class SlaPolicyController {
    private final SlaPolicyRepository repo;

    @GetMapping
    public List<SlaPolicyDto> list() {
        return repo.findAll(Sort.by("priority")).stream().map(SlaPolicyDto::from).toList();
    }

    @PutMapping("/{priority}")
    @PreAuthorize("hasRole('MANAGER')")
    public SlaPolicyDto update(@PathVariable Priority priority,
                               @Valid @RequestBody UpdateSlaPolicyRequest req) {
        SlaPolicy p = repo.findById(priority)
                .orElseThrow(() -> new NotFoundException("No policy for " + priority));
        p.setResolutionMinutes(req.resolutionMinutes());
        p.setAtRiskPercent(req.atRiskPercent());
        p.setUpdatedAt(Instant.now());
        return SlaPolicyDto.from(repo.save(p));
    }
}