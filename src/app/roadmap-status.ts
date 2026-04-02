import type { RoadmapEvent, RoadmapEventStatus } from "./roadmap-data";

/** Order used in status dropdowns */
export const ROADMAP_STATUS_OPTIONS = [
  "pending",
  "on_track",
  "at_risk",
  "blocked",
] as const satisfies readonly RoadmapEventStatus[];

export const STATUS_LABEL: Record<RoadmapEventStatus, string> = {
  pending: "Pending",
  on_track: "On Track",
  at_risk: "At Risk",
  blocked: "Blocked",
};

/** Left accent on event cards */
export const STATUS_BORDER: Record<RoadmapEventStatus, string> = {
  pending: "#64748b",
  on_track: "#22c55e",
  at_risk: "#eab308",
  blocked: "#ef4444",
};

/** Badges on white cards */
export const STATUS_BADGE_CLASS: Record<RoadmapEventStatus, string> = {
  pending: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/90",
  on_track: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80",
  at_risk: "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80",
  blocked: "bg-red-100 text-red-900 ring-1 ring-red-200/80",
};

export function eventEffectiveStatus(
  event: Pick<RoadmapEvent, "status">,
): RoadmapEventStatus {
  return event.status ?? "on_track";
}