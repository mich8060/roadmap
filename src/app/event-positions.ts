import {
  initialRoadmapData,
  RoadmapData,
  RoadmapEvent,
} from "./roadmap-data";

/** Vercel/production: set `VITE_EVENT_POSITIONS_API_BASE` to your Railway service URL (no `/api` path). */
function resolveEventPositionsApiUrl(): string {
  const base = import.meta.env.VITE_EVENT_POSITIONS_API_BASE?.trim() ?? "";
  if (!base) return "/api/event-positions";
  const normalized = base.replace(/\/$/, "");
  return `${normalized}/api/event-positions`;
}

export const EVENT_POSITIONS_API = resolveEventPositionsApiUrl();

/** Legacy layout patches merged into code-default events by id. */
export type EventPositionFields = Partial<
  Pick<
    RoadmapEvent,
    "left" | "width" | "top" | "track" | "title" | "description" | "color"
  >
>;

export interface EventPositionsFile {
  updatedAt: string | null;
  /** When set, restores swimlane count (must be >= 1). */
  trackCount?: number;
  title?: string;
  subtitle?: string;
  /**
   * Full roadmap events (preferred). When present, replaces the in-code event list
   * so titles, new cards, and layout all round-trip through the JSON file.
   */
  events?: RoadmapEvent[];
  /**
   * Legacy: per-id patches only. Used when `events` is absent (older `event-positions.json`).
   */
  positions?: Record<string, EventPositionFields>;
}

export function extractEventPositions(data: RoadmapData): EventPositionsFile {
  return {
    updatedAt: new Date().toISOString(),
    trackCount: data.trackCount,
    title: data.title,
    subtitle: data.subtitle,
    events: data.events,
  };
}

export function applyEventPositionsFile(
  base: RoadmapData,
  file: EventPositionsFile,
): RoadmapData {
  const trackCount =
    typeof file.trackCount === "number" && file.trackCount >= 1
      ? file.trackCount
      : base.trackCount;

  if (Array.isArray(file.events)) {
    return {
      ...base,
      title: file.title ?? base.title,
      subtitle: file.subtitle ?? base.subtitle,
      trackCount,
      events: file.events,
    };
  }

  let result = mergePositionsIntoRoadmap(base, file.positions ?? {});
  result = { ...result, trackCount };
  if (file.title !== undefined) result = { ...result, title: file.title };
  if (file.subtitle !== undefined) result = { ...result, subtitle: file.subtitle };
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
    if (!data || typeof data !== "object") return null;
    const hasEvents = Array.isArray(data.events);
    const hasPositions =
      data.positions != null && typeof data.positions === "object";
    const hasTrackCount =
      typeof data.trackCount === "number" && data.trackCount >= 1;
    const hasMeta =
      data.title !== undefined || data.subtitle !== undefined;
    if (
      !hasEvents &&
      !hasPositions &&
      !hasTrackCount &&
      !hasMeta
    ) {
      return null;
    }
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
