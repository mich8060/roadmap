import {
  initialRoadmapData,
  RoadmapData,
  RoadmapEvent,
} from "./roadmap-data";

/**
 * Vercel/production: set `VITE_EVENT_POSITIONS_API_BASE` to your Railway **root**
 * (e.g. https://xxxx.up.railway.app). If you paste the full `/api/event-positions` URL, it still works.
 */
function resolveEventPositionsApiUrl(): string {
  const raw = import.meta.env.VITE_EVENT_POSITIONS_API_BASE?.trim() ?? "";
  if (!raw) return "/api/event-positions";
  let base = raw.replace(/\/$/, "");
  if (base.endsWith("/api/event-positions")) {
    return base;
  }
  return `${base}/api/event-positions`;
}

export const EVENT_POSITIONS_API = resolveEventPositionsApiUrl();

/** True when the bundle calls an absolute URL (e.g. Railway) — set at build via VITE_EVENT_POSITIONS_API_BASE. */
export function usesRemoteEventPositionsApi(): boolean {
  return EVENT_POSITIONS_API.startsWith("http");
}

/** Legacy layout patches merged into code-default events by id. */
export type EventPositionFields = Partial<
  Pick<
    RoadmapEvent,
    | "left"
    | "width"
    | "top"
    | "track"
    | "title"
    | "description"
    | "color"
    | "status"
    | "riskIssue"
    | "riskMitigation"
    | "riskNeededToUnblock"
  >
>;

export interface EventPositionsFile {
  updatedAt: string | null;
  /** When set, restores swimlane count (must be >= 1). */
  trackCount?: number;
  title?: string;
  subtitle?: string;
  whyThisMatters?: string;
  valueSnapshot?: string;
  capacityBandExplanation?: string;
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
    whyThisMatters: data.whyThisMatters,
    valueSnapshot: data.valueSnapshot,
    capacityBandExplanation: data.capacityBandExplanation,
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
      whyThisMatters: file.whyThisMatters ?? base.whyThisMatters,
      valueSnapshot: file.valueSnapshot ?? base.valueSnapshot,
      capacityBandExplanation:
        file.capacityBandExplanation ?? base.capacityBandExplanation,
    };
  }

  let result = mergePositionsIntoRoadmap(base, file.positions ?? {});
  result = { ...result, trackCount };
  if (file.title !== undefined) result = { ...result, title: file.title };
  if (file.subtitle !== undefined) result = { ...result, subtitle: file.subtitle };
  if (file.whyThisMatters !== undefined) {
    result = { ...result, whyThisMatters: file.whyThisMatters };
  }
  if (file.valueSnapshot !== undefined) {
    result = { ...result, valueSnapshot: file.valueSnapshot };
  }
  if (file.capacityBandExplanation !== undefined) {
    result = {
      ...result,
      capacityBandExplanation: file.capacityBandExplanation,
    };
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
    if (!data || typeof data !== "object") return null;
    const hasEvents = Array.isArray(data.events);
    const hasPositions =
      data.positions != null && typeof data.positions === "object";
    const hasTrackCount =
      typeof data.trackCount === "number" && data.trackCount >= 1;
    const hasMeta =
      data.title !== undefined ||
      data.subtitle !== undefined ||
      data.whyThisMatters !== undefined ||
      data.valueSnapshot !== undefined ||
      data.capacityBandExplanation !== undefined;
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
