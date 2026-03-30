import {
  initialRoadmapData,
  RoadmapData,
  RoadmapEvent,
} from "./roadmap-data";

export const EVENT_POSITIONS_API = "/api/event-positions";

export type EventPositionFields = Pick<
  RoadmapEvent,
  "left" | "width" | "top" | "track"
>;

export interface EventPositionsFile {
  updatedAt: string | null;
  /** When set, restores swimlane count (must be >= 1). */
  trackCount?: number;
  positions: Record<string, EventPositionFields>;
}

export function extractEventPositions(data: RoadmapData): EventPositionsFile {
  const positions: Record<string, EventPositionFields> = {};
  for (const e of data.events) {
    positions[e.id] = {
      left: e.left,
      width: e.width,
      top: e.top,
      track: e.track,
    };
  }
  return {
    updatedAt: new Date().toISOString(),
    trackCount: data.trackCount,
    positions,
  };
}

export function applyEventPositionsFile(
  base: RoadmapData,
  file: EventPositionsFile,
): RoadmapData {
  let result = mergePositionsIntoRoadmap(base, file.positions ?? {});
  if (typeof file.trackCount === "number" && file.trackCount >= 1) {
    result = { ...result, trackCount: file.trackCount };
  }
  return result;
}

export function mergePositionsIntoRoadmap(
  base: RoadmapData,
  positions: Record<string, Partial<EventPositionFields>>,
): RoadmapData {
  return {
    ...base,
    events: base.events.map((event) => ({
      ...event,
      ...(positions[event.id] ?? {}),
    })),
  };
}

/** In-memory default only; hydrated from `event-positions.json` via the dev API. */
export function getInitialRoadmapDataFromCode(): RoadmapData {
  return initialRoadmapData;
}

export async function fetchEventPositions(): Promise<EventPositionsFile | null> {
  try {
    const res = await fetch(EVENT_POSITIONS_API);
    if (!res.ok) return null;
    const data = (await res.json()) as EventPositionsFile;
    if (!data || typeof data.positions !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

/** Persists to `event-positions.json` through the Vite dev middleware only (no localStorage). */
export async function persistEventPositions(
  data: RoadmapData,
): Promise<boolean> {
  const file = extractEventPositions(data);
  try {
    const res = await fetch(EVENT_POSITIONS_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(file),
    });
    return res.ok;
  } catch {
    return false;
  }
}
