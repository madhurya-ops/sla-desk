import { describe, expect, it } from 'vitest';
import { SlaClockInput, formatCountdown, formatElapsed, formatMinutes, slaDisplay } from './sla';

const NOW = Date.parse('2026-09-28T04:00:00Z');

function ticket(overrides: Partial<SlaClockInput> = {}): SlaClockInput {
  return {
    status: 'IN_PROGRESS',
    slaState: 'ON_TRACK',
    dueAt: '2026-09-28T05:00:00Z',
    pausedAt: null,
    ...overrides,
  };
}

describe('formatCountdown', () => {
  it('uses mm:ss under an hour', () => {
    expect(formatCountdown(598)).toBe('09:58');
    expect(formatCountdown(3599)).toBe('59:59');
  });

  it('uses hours and minutes from an hour up', () => {
    expect(formatCountdown(3600)).toBe('1h 0m');
    expect(formatCountdown(3 * 3600 + 12 * 60 + 40)).toBe('3h 12m');
  });
});

describe('formatElapsed', () => {
  it('picks the largest sensible units', () => {
    expect(formatElapsed(45)).toBe('45s');
    expect(formatElapsed(4 * 60 + 10)).toBe('4m');
    expect(formatElapsed(2 * 3600 + 5 * 60)).toBe('2h 5m');
    expect(formatElapsed(3 * 86400 + 4 * 3600)).toBe('3d 4h');
  });
});

describe('formatMinutes', () => {
  it('shows every non-zero unit', () => {
    expect(formatMinutes(2)).toBe('2m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(90)).toBe('1h 30m');
    expect(formatMinutes(1440)).toBe('1d');
    expect(formatMinutes(1500)).toBe('1d 1h');
    expect(formatMinutes(1441)).toBe('1d 1m');
    expect(formatMinutes(0)).toBe('0m');
  });
});

describe('slaDisplay', () => {
  it('counts down from dueAt', () => {
    expect(slaDisplay(ticket({ dueAt: '2026-09-28T04:09:58Z', slaState: 'AT_RISK' }), NOW)).toEqual(
      { tone: 'AT_RISK', text: '09:58' },
    );
  });

  it('shows breached time once past due, even before the next poll', () => {
    expect(slaDisplay(ticket({ dueAt: '2026-09-28T03:56:00Z', slaState: 'AT_RISK' }), NOW)).toEqual(
      { tone: 'BREACHED', text: 'Breached 4m ago' },
    );
  });

  it('freezes while paused', () => {
    expect(slaDisplay(ticket({ pausedAt: '2026-09-28T03:30:00Z' }), NOW)).toEqual({
      tone: 'PAUSED',
      text: 'Paused',
    });
  });

  it('is static once resolved', () => {
    expect(slaDisplay(ticket({ status: 'RESOLVED', slaState: 'MET' }), NOW).text).toBe('Met');
    expect(
      slaDisplay(
        ticket({ status: 'RESOLVED', slaState: 'BREACHED', dueAt: '2026-09-27T00:00:00Z' }),
        NOW,
      ),
    ).toEqual({ tone: 'BREACHED', text: 'Breached' });
  });
});
