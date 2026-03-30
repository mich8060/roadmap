/** Month columns on the roadmap (200px each), matching quarter layout in the viewer. */
const TIMELINE_MONTH_SPECS = [
  { id: "2026-01", label: "January 2026", weekCount: 4 },
  { id: "2026-02", label: "February 2026", weekCount: 4 },
  { id: "2026-03", label: "March 2026", weekCount: 5 },
  { id: "2026-04", label: "April 2026", weekCount: 4 },
  { id: "2026-05", label: "May 2026", weekCount: 4 },
  { id: "2026-06", label: "June 2026", weekCount: 4 },
  { id: "2026-07", label: "July 2026", weekCount: 5 },
  { id: "2026-08", label: "August 2026", weekCount: 4 },
  { id: "2026-09", label: "September 2026", weekCount: 4 },
  { id: "2026-10", label: "October 2026", weekCount: 5 },
  { id: "2026-11", label: "November 2026", weekCount: 4 },
  { id: "2026-12", label: "December 2026", weekCount: 4 },
  { id: "2027-01", label: "January 2027", weekCount: 4 },
  { id: "2027-02", label: "February 2027", weekCount: 4 },
  { id: "2027-03", label: "March 2027", weekCount: 5 },
] as const;

let _acc = 0;
export const TIMELINE_MONTH_BLOCKS: ReadonlyArray<{
  id: string;
  label: string;
  startX: number;
  weekCount: number;
}> = TIMELINE_MONTH_SPECS.map((s) => {
  const b = { ...s, startX: _acc };
  _acc += 200;
  return b;
});

const MONTH_WIDTH_PX = 200;

/**
 * Map starting month (block index), 1-based week within that month, and duration in weeks
 * to `{ left, width }` in roadmap pixels. Spans month boundaries using each month’s week width.
 */
export function eventRectFromTimelineWeeks(
  monthIndex: number,
  startWeek1Based: number,
  durationWeeks: number,
): { left: number; width: number } {
  const blocks = TIMELINE_MONTH_BLOCKS;
  if (blocks.length === 0) return { left: 0, width: MONTH_WIDTH_PX };

  let mi = Math.max(0, Math.min(monthIndex, blocks.length - 1));
  const wc0 = blocks[mi]!.weekCount;
  let wk = Math.max(1, Math.floor(startWeek1Based));
  wk = Math.min(wk, wc0);
  let dur = Math.max(1, Math.floor(durationWeeks));

  const weekPx0 = MONTH_WIDTH_PX / blocks[mi]!.weekCount;
  const left = Math.round(blocks[mi]!.startX + (wk - 1) * weekPx0);

  let widthPx = 0;
  while (dur > 0 && mi < blocks.length) {
    const wc = blocks[mi]!.weekCount;
    const weekPx = MONTH_WIDTH_PX / wc;
    const weeksLeftInMonth = wc - wk + 1;
    const take = Math.min(dur, weeksLeftInMonth);
    widthPx += take * weekPx;
    dur -= take;
    if (dur > 0) {
      mi += 1;
      wk = 1;
    }
  }

  return { left, width: Math.max(50, Math.round(widthPx)) };
}

// Calculate all week boundary positions for snapping
export function calculateWeekPositions(): number[] {
  const positions: number[] = [];

  for (const block of TIMELINE_MONTH_BLOCKS) {
    const { startX, weekCount } = block;
    const weekWidth = MONTH_WIDTH_PX / weekCount;
    positions.push(startX);
    for (let i = 1; i <= weekCount; i++) {
      positions.push(startX + i * weekWidth);
    }
  }

  return [...new Set(positions)].sort((a, b) => a - b);
}

// Snap a value to the nearest week position
export function snapToWeek(value: number, weekPositions: number[]): number {
  if (weekPositions.length === 0) return value;

  let closest = weekPositions[0]!;
  let minDiff = Math.abs(value - closest);

  for (const pos of weekPositions) {
    const diff = Math.abs(value - pos);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pos;
    }
  }

  return closest;
}
