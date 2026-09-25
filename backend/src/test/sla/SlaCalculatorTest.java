class SlaCalculatorTest {
    private final SlaCalculator sla = new SlaCalculator();
    private final Instant t0 = Instant.parse("2026-09-26T10:00:00Z");

    private Ticket ticket(int slaMinutes) {
        Ticket t = new Ticket();
        t.setCreatedAt(t0);
        t.setSlaMinutes(slaMinutes);
        t.setAtRiskPercent(80);
        return t;
    }

    @Test void onTrackBelowEightyPercent() {
        assertEquals(SlaState.ON_TRACK, sla.evaluate(ticket(10), t0.plusSeconds(7 * 60)));
    }

    @Test void atRiskAtEightyPercent() {
        assertEquals(SlaState.AT_RISK, sla.evaluate(ticket(10), t0.plusSeconds(8 * 60)));
    }

    @Test void breachedAtDeadline() {
        assertEquals(SlaState.BREACHED, sla.evaluate(ticket(10), t0.plusSeconds(10 * 60)));
    }

    @Test void timeOnHoldDoesNotCount() {
        Ticket t = ticket(10);
        t.setPausedSeconds(5 * 60);                     // 5 minutes on hold
        // 12 minutes passed, only 7 count: 70%
        assertEquals(SlaState.ON_TRACK, sla.evaluate(t, t0.plusSeconds(12 * 60)));
    }

    @Test void dueAtMovesBackByPausedTime() {
        Ticket t = ticket(10);
        t.setPausedSeconds(120);
        assertEquals(t0.plusSeconds(12 * 60), sla.dueAt(t));
    }
}