package com.madhurya.sladesk.triage.dto;

import com.madhurya.sladesk.ticket.Category;
import com.madhurya.sladesk.ticket.Priority;

public record TriageResult(boolean available, Priority priority, Double priorityConfidence,
                           Category category, Double categoryConfidence,
                           Double businessImpact, Double frustration, boolean needsTriage) {

    /** Used when Jev is off or unreachable: no suggestion, flag for manual triage. */
    public static TriageResult unavailable() {
        return new TriageResult(false, null, null, null, null, null, null, true);
    }

    /** One-line text for the ticket's audit timeline. */
    public String summary() {
        return String.format("Jev suggested %s (%.0f%%) for the %s team (%.0f%%), business impact %.2f",
                priority, priorityConfidence * 100, category, categoryConfidence * 100, businessImpact);
    }
}