package com.madhurya.sladesk.triage;

import com.madhurya.sladesk.triage.dto.TriageRequest;
import com.madhurya.sladesk.triage.dto.TriageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/triage")
@RequiredArgsConstructor
public class TriageController {
    private final TriageService triage;

    @PostMapping("/preview")
    public TriageResult preview(@Valid @RequestBody TriageRequest req) {
        return triage.triage(req.title(), req.description());
    }
}