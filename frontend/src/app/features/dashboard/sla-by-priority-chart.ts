import { Component, computed, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PriorityBreakdown } from '../../core/models';
import { PRIORITIES } from '../../shared/labels';

type SeriesKey = 'onTrack' | 'atRisk' | 'breached';

interface Series {
  key: SeriesKey;
  label: string;
  cssVar: string;
  hatched: boolean;
}

/**
 * Fixed order and status colours. Green and amber are close for protan vision, so at-risk also
 * carries a 45° hatch; the legend, bar order and table view back that up.
 */
const SERIES: Series[] = [
  { key: 'onTrack', label: 'On track', cssVar: '--sla-on-track', hatched: false },
  { key: 'atRisk', label: 'At risk', cssVar: '--sla-at-risk', hatched: true },
  { key: 'breached', label: 'Breached', cssVar: '--sla-breached', hatched: false },
];

/** Grouped bars: unresolved tickets per priority, split by SLA state. */
@Component({
  selector: 'app-sla-by-priority-chart',
  imports: [BaseChartDirective],
  template: `
    <div class="canvas-wrap">
      <canvas
        baseChart
        type="bar"
        [data]="data()"
        [options]="options"
        role="img"
        [attr.aria-label]="summaryText()"
      ></canvas>
    </div>
    <details>
      <summary>Show as table</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Priority</th>
            @for (s of series; track s.key) {
              <th scope="col">{{ s.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.priority) {
            <tr>
              <th scope="row">{{ row.priority }}</th>
              <td>{{ row.onTrack }}</td>
              <td>{{ row.atRisk }}</td>
              <td>{{ row.breached }}</td>
            </tr>
          }
        </tbody>
      </table>
    </details>
  `,
  styles: `
    :host {
      display: block;
    }
    .canvas-wrap {
      position: relative;
      height: 280px;
    }
    details {
      margin-top: 12px;
      font: var(--mat-sys-body-medium);
    }
    summary {
      cursor: pointer;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-label-large);
    }
    table {
      margin-top: 8px;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    th,
    td {
      padding: 4px 16px 4px 0;
      text-align: right;
    }
    th:first-child,
    th[scope='row'] {
      text-align: left;
    }
    thead th {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class SlaByPriorityChart {
  readonly byPriority = input.required<PriorityBreakdown[]>();

  protected readonly series = SERIES;

  /** Always P1..P4, even if the API leaves a priority out. */
  protected readonly rows = computed(() =>
    PRIORITIES.map(
      (priority) =>
        this.byPriority().find((r) => r.priority === priority) ?? {
          priority,
          onTrack: 0,
          atRisk: 0,
          breached: 0,
        },
    ),
  );

  private readonly surfaceColor = cssVar('--mat-sys-surface-container-lowest');

  private readonly fills = SERIES.map((s) => {
    const color = cssVar(s.cssVar);
    return s.hatched ? hatch(color) : color;
  });

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: PRIORITIES,
    datasets: SERIES.map((s, i) => ({
      label: s.label,
      data: this.rows().map((r) => r[s.key]),
      backgroundColor: this.fills[i],
      hoverBackgroundColor: this.fills[i],
      maxBarThickness: 24,
      borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
      // 1px of panel surface on each side = a 2px gap where neighbouring bars touch on narrow screens.
      borderWidth: { left: 1, right: 1, top: 0, bottom: 0 },
      borderColor: this.surfaceColor,
      borderSkipped: 'start',
      categoryPercentage: 0.7,
      barPercentage: 0.9,
    })),
  }));

  protected readonly summaryText = computed(
    () =>
      'Unresolved tickets by priority and SLA state. ' +
      this.rows()
        .map(
          (r) =>
            `${r.priority}: ${r.onTrack} on track, ${r.atRisk} at risk, ${r.breached} breached`,
        )
        .join('; '),
  );

  private readonly textColor = cssVar('--mat-sys-on-surface-variant');
  private readonly gridColor = cssVar('--mat-sys-outline-variant');

  protected readonly options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        border: { color: this.gridColor },
        ticks: { color: this.textColor, font: { weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: this.gridColor, lineWidth: 1 },
        border: { display: false },
        ticks: { color: this.textColor, precision: 0 },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: this.textColor,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 16,
        },
      },
      tooltip: { padding: 10, boxPadding: 4, usePointStyle: true },
    },
  };
}

/**
 * Resolves a CSS custom property to a colour the canvas understands. Material's system tokens are
 * light-dark() expressions, which Chart.js can't parse, so let the browser compute them on a probe.
 */
function cssVar(name: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Solid fill with light 45° lines, so at-risk reads differently from the others without colour. */
function hatch(color: string): CanvasPattern | string {
  const size = 8;
  const tile = document.createElement('canvas');
  tile.width = tile.height = size;
  const ctx = tile.getContext('2d');
  if (!ctx) return color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgb(255 255 255 / 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // One diagonal plus the two corner stubs so the pattern tiles seamlessly.
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.moveTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.moveTo(size / 2, size + size / 2);
  ctx.lineTo(size + size / 2, size / 2);
  ctx.stroke();
  return ctx.createPattern(tile, 'repeat') ?? color;
}
