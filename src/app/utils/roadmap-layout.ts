import { RoadmapData } from "../roadmap-data";

export const TRACK_HEIGHT_PX = 88;
export const TRACK_EVENT_TOP_BASE = 128;
/** Top offset for swimlane bands; matches `Track.tsx`. */
export const TRACK_BAND_TOP_OFFSET = 116;

/** First swimlane index that uses the blue tint (rows below this are “with additional resources”). */
export const FIRST_BLUE_TRACK_INDEX = 5;

/** Same fill as blue swimlanes (`Track.tsx`) for the resource strip row. */
export const BLUE_SWIMLANE_BG = "rgba(186, 231, 254, 0.40)";

/** Clearance above and below the fixed white label box within the resource strip. */
export const RESOURCE_STRIP_LABEL_GAP_PX = 24;

/** Vertical space reserved for the one-line label control inside the strip. */
export const RESOURCE_STRIP_LABEL_CORE_PX = 40;

/**
 * Height of the band between the last white row and the first blue row:
 * gap + label block + gap. Not stored in event `top`; applied for track >= FIRST_BLUE_TRACK_INDEX.
 */
export const RESOURCE_STRIP_HEIGHT_PX =
  RESOURCE_STRIP_LABEL_GAP_PX * 2 + RESOURCE_STRIP_LABEL_CORE_PX;

/** Vertical offset applied to swimlanes and events for tracks in the blue section. */
export function trackLayoutOffsetY(trackIndex: number): number {
  return trackIndex >= FIRST_BLUE_TRACK_INDEX ? RESOURCE_STRIP_HEIGHT_PX : 0;
}

/** Top edge (px) of swimlane `trackIndex` within the roadmap content. */
export function trackBandTopPx(trackIndex: number): number {
  return (
    TRACK_BAND_TOP_OFFSET +
    trackIndex * TRACK_HEIGHT_PX +
    trackLayoutOffsetY(trackIndex)
  );
}

/**
 * Swimlane index for a Y in roadmap content space (e.g. pointer).
 * Y inside the resource strip (between bands) snaps to the nearest track center.
 */
export function trackIndexFromContentY(y: number, trackCount: number): number {
  if (trackCount <= 0) return 0;
  for (let i = 0; i < trackCount; i++) {
    const top = trackBandTopPx(i);
    if (y >= top && y < top + TRACK_HEIGHT_PX) return i;
  }
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < trackCount; i++) {
    const center = trackBandTopPx(i) + TRACK_HEIGHT_PX / 2;
    const d = Math.abs(y - center);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * Top Y of the seam below swimlane `afterTrackIndex` (same as top of swimlane `afterTrackIndex + 1`).
 * Used for “Add track” hit bands.
 */
export function trackBoundaryTopPx(afterTrackIndex: number): number {
  return trackBandTopPx(afterTrackIndex + 1);
}

/** Top Y of the “With Additional Resources” band (between white and blue tracks). */
export function resourceStripTopPx(): number {
  return TRACK_BAND_TOP_OFFSET + FIRST_BLUE_TRACK_INDEX * TRACK_HEIGHT_PX;
}

/**
 * Inserts an empty swimlane after the given track. Events on lower tracks stay put;
 * events strictly below shift down one row (track + 1, top recalculated).
 */
export function insertTrackAfter(
  data: RoadmapData,
  afterTrackIndex: number,
): RoadmapData {
  if (
    afterTrackIndex < 0 ||
    afterTrackIndex >= data.trackCount ||
    data.trackCount <= 0
  ) {
    return data;
  }

  const nextCount = data.trackCount + 1;
  const events = data.events.map((event) => {
    if (event.track <= afterTrackIndex) return event;
    const newTrack = event.track + 1;
    return {
      ...event,
      track: newTrack,
      top: TRACK_EVENT_TOP_BASE + newTrack * TRACK_HEIGHT_PX,
    };
  });

  return { ...data, trackCount: nextCount, events };
}
