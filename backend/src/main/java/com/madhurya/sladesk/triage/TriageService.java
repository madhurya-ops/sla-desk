package com.madhurya.sladesk.triage;

import com.madhurya.sladesk.ticket.Category;
import com.madhurya.sladesk.ticket.Priority;
import com.madhurya.sladesk.triage.dto.JevAnswer;
import com.madhurya.sladesk.triage.dto.JevResponse;
import com.madhurya.sladesk.triage.dto.TriageResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TriageService {
    private static final double MIN_CONFIDENCE = 0.6;
    private final JevClient jev;

    public TriageResult triage(String title, String description) {
        Map<String, Object> state = Map.of("title", title, "description", description);
        Map<String, Object> questions = Map.of(
                "priority", Map.of(
                        "type", "choice",
                        "instructions", "What priority should this IT support ticket get?",
                        "criteria", Map.of(
                                "P1", "Production outage, or many users completely blocked",
                                "P2", "Major feature broken for some users; the workaround is hard",
                                "P3", "Minor problem; a workaround exists",
                                "P4", "Question, request or cosmetic issue")),
                "category", Map.of(
                        "type", "choice",
                        "instructions", "Which support team should handle this ticket?",
                        "criteria", Map.of(
                                "INFRA", "Servers, network, cloud, deployments, outages",
                                "APPLICATION", "Bugs or errors inside a business application",
                                "ACCESS", "Logins, passwords, permissions, user accounts",
                                "BILLING", "Invoices, payments, licences, charges")),
                "business_impact", Map.of(
                        "type", "noul",
                        "instructions", "Does this ticket describe significant business impact, such as an "
                                + "outage, many affected users, lost revenue or a blocked release?"),
                "frustration", Map.of(
                        "type", "score",
                        "instructions", "How frustrated is the person who raised this ticket?",
                        "criteria", List.of("Calm", "Mildly annoyed", "Frustrated", "Very angry")));

        return jev.evaluate(state, questions).map(this::toResult).orElse(TriageResult.unavailable());
    }

    private TriageResult toResult(JevResponse r) {
        try {
            JevAnswer p = r.answers().get("priority");
            JevAnswer c = r.answers().get("category");
            boolean unsure = p.confidence() < MIN_CONFIDENCE || c.confidence() < MIN_CONFIDENCE;
            return new TriageResult(true,
                    Priority.valueOf(p.choice()), p.confidence(),
                    Category.valueOf(c.choice()), c.confidence(),
                    r.answers().get("business_impact").noul(),
                    r.answers().get("frustration").score(),
                    unsure);
        } catch (RuntimeException e) {             // missing field or unexpected value
            log.warn("Could not read Jev response: {}", e.getMessage());
            return TriageResult.unavailable();
        }
    }
}
