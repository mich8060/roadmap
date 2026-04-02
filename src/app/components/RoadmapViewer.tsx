import { RoadmapEvent, RoadmapData } from "../roadmap-data";
import { QuarterlyTimeline } from "./QuarterlyTimeline";
import { Track } from "./Track";
import {
  STATUS_BADGE_CLASS,
  STATUS_BORDER,
  STATUS_LABEL,
  eventEffectiveStatus,
} from "../roadmap-status";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Plus } from "lucide-react";
import { calculateWeekPositions, snapToWeek } from "../utils/timeline-grid";
import {
  BLUE_SWIMLANE_BG,
  FIRST_BLUE_TRACK_INDEX,
  TRACK_BAND_TOP_OFFSET,
  TRACK_EVENT_TOP_BASE,
  TRACK_HEIGHT_PX,
  RESOURCE_STRIP_HEIGHT_PX,
  trackBoundaryTopPx,
  trackBandTopPx,
  trackIndexFromContentY,
  resourceStripTopPx,
} from "../utils/roadmap-layout";

interface RoadmapViewerProps {
  data: RoadmapData;
  /** Right side of the fixed header (e.g. save status + edit toggle); row uses items-center. */
  headerActions?: ReactNode;
  /** When false, track hover, add-track bands, drag, resize, and double-click edit are disabled. */
  layoutEditMode?: boolean;
  onEventClick?: (event: RoadmapEvent) => void;
  onEventDoubleClick?: (event: RoadmapEvent) => void;
  onEventUpdate?: (eventId: string, updates: Partial<RoadmapEvent>) => void;
  /** Insert a swimlane after `afterTrackIndex` (between that row and the next). */
  onInsertTrackAfter?: (afterTrackIndex: number) => void;
  /** Create a new event on the given swimlane (edit mode). */
  onAddEventInTrack?: (trackIndex: number) => void;
}

/** Taller hit band so reaching the fixed left button doesn’t drop hover. */
const INSERT_HIT_PX = 40;
/** Add Track / add-event controls stay viewport-fixed at these horizontal insets. */
const VIEWPORT_FIXED_LEFT_PX = 24;
const VIEWPORT_FIXED_RIGHT_PX = 24;
const RESOURCE_LABEL_CONTENT_LEFT_PX = 24;
/** Fixed “Additional Capacity” callout; inline CSS so width always applies (Tailwind min() arbitrary values can drop). */
const ADDITIONAL_CAPACITY_BOX_WIDTH = "min(36rem, calc(100vw - 48px))";
const DRAG_THRESHOLD_PX = 6;

export function RoadmapViewer({
  data,
  headerActions,
  layoutEditMode = false,
  onEventClick,
  onEventDoubleClick,
  onEventUpdate,
  onInsertTrackAfter,
  onAddEventInTrack,
}: RoadmapViewerProps) {
  const TOTAL_WIDTH = 3000; // Full calendar width
  /** Bottom Y of the last swimlane: no extra slack below tracks. */
  const tracksContentHeightPx =
    data.trackCount > 0
      ? trackBandTopPx(data.trackCount - 1) + TRACK_HEIGHT_PX
      : TRACK_BAND_TOP_OFFSET;
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const insertStripRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [insertLineViewportCenters, setInsertLineViewportCenters] = useState<
    number[]
  >([]);
  /** Viewport Y of each swimlane vertical center (for fixed right “add event” control). */
  const [trackBandViewportCenters, setTrackBandViewportCenters] = useState<
    number[]
  >([]);

  const syncViewportOverlayPositions = useCallback(() => {
    const canvas = canvasScrollRef.current;
    setInsertLineViewportCenters(
      Array.from({ length: data.trackCount }, (_, i) => {
        const el = insertStripRefs.current[i];
        if (!el) return Number.NaN;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      }),
    );
    if (!canvas) {
      setTrackBandViewportCenters([]);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scrollTop = canvas.scrollTop;
    setTrackBandViewportCenters(
      Array.from({ length: data.trackCount }, (_, i) => {
        const centerContentY = trackBandTopPx(i) + TRACK_HEIGHT_PX / 2;
        return rect.top + centerContentY - scrollTop;
      }),
    );
  }, [data.trackCount]);

  useLayoutEffect(() => {
    syncViewportOverlayPositions();
  }, [syncViewportOverlayPositions]);

  useEffect(() => {
    if (!layoutEditMode) {
      setResizing(null);
      setDragging(null);
      setDragIntent(null);
      setHoveredTrackIndex(null);
    }
  }, [layoutEditMode]);

  useEffect(() => {
    const canvas = canvasScrollRef.current;
    if (!canvas) return;
    syncViewportOverlayPositions();
    canvas.addEventListener("scroll", syncViewportOverlayPositions, {
      passive: true,
    });
    window.addEventListener("resize", syncViewportOverlayPositions);
    return () => {
      canvas.removeEventListener("scroll", syncViewportOverlayPositions);
      window.removeEventListener("resize", syncViewportOverlayPositions);
    };
  }, [syncViewportOverlayPositions]);

  const [resizing, setResizing] = useState<{
    eventId: string;
    edge: "left" | "right";
    startX: number;
    startLeft: number;
    startWidth: number;
  } | null>(null);

  const [dragging, setDragging] = useState<{
    eventId: string;
  } | null>(null);

  const [dragIntent, setDragIntent] = useState<{
    eventId: string;
    startX: number;
    startY: number;
  } | null>(null);

  const [hoveredTrackIndex, setHoveredTrackIndex] = useState<number | null>(
    null,
  );

  const weekPositions = useRef(calculateWeekPositions());

  const updateHoveredTrack = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasScrollRef.current;
      if (!canvas) {
        setHoveredTrackIndex(null);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        setHoveredTrackIndex(null);
        return;
      }
      const y = e.clientY - rect.top + canvas.scrollTop;
      let found: number | null = null;
      for (let i = 0; i < data.trackCount; i++) {
        const top = trackBandTopPx(i);
        if (y >= top && y < top + TRACK_HEIGHT_PX) {
          found = i;
          break;
        }
      }
      setHoveredTrackIndex(found);
    },
    [data.trackCount],
  );

  const handleResizeStart = (
    e: React.MouseEvent,
    event: RoadmapEvent,
    edge: "left" | "right",
  ) => {
    if (!layoutEditMode) return;
    e.stopPropagation();
    setResizing({
      eventId: event.id,
      edge,
      startX: e.clientX,
      startLeft: event.left,
      startWidth: event.width,
    });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizing.startX;
    const event = data.events.find((e) => e.id === resizing.eventId);
    if (!event) return;

    if (resizing.edge === "right") {
      // Resize from right edge
      const newWidth = resizing.startWidth + deltaX;
      const newRight = resizing.startLeft + newWidth;
      const snappedRight = snapToWeek(newRight, weekPositions.current);
      const snappedWidth = snappedRight - resizing.startLeft;

      if (snappedWidth >= 50) {
        // Minimum width
        onEventUpdate?.(resizing.eventId, { width: snappedWidth });
      }
    } else {
      // Resize from left edge
      const newLeft = resizing.startLeft + deltaX;
      const snappedLeft = snapToWeek(newLeft, weekPositions.current);
      const newWidth = resizing.startWidth + (resizing.startLeft - snappedLeft);

      if (newWidth >= 50) {
        // Minimum width
        onEventUpdate?.(resizing.eventId, {
          left: snappedLeft,
          width: newWidth,
        });
      }
    }
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const handleDragStart = (e: React.MouseEvent, event: RoadmapEvent) => {
    if (!layoutEditMode) return;
    e.stopPropagation();
    setDragIntent({
      eventId: event.id,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const canvas = canvasScrollRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top + canvas.scrollTop;
    const clampedTrackIndex = trackIndexFromContentY(y, data.trackCount);
    const snappedTop =
      TRACK_EVENT_TOP_BASE + clampedTrackIndex * TRACK_HEIGHT_PX;

    onEventUpdate?.(dragging.eventId, {
      top: snappedTop,
      track: clampedTrackIndex,
    });
  };

  const handleDragEnd = () => {
    setDragging(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (layoutEditMode) {
      updateHoveredTrack(e);
    }
    if (resizing) {
      handleResizeMove(e);
      return;
    }
    if (dragging) {
      handleDragMove(e);
      return;
    }
    if (dragIntent) {
      const dx = e.clientX - dragIntent.startX;
      const dy = e.clientY - dragIntent.startY;
      if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        setDragging({ eventId: dragIntent.eventId });
        setDragIntent(null);
      }
    }
  };

  const handleMouseUp = () => {
    handleResizeEnd();
    handleDragEnd();
    setDragIntent(null);
  };

  return (
    <div
      className="w-full h-full overflow-auto bg-gray-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoveredTrackIndex(null);
      }}
    >
      {/* Title Section */}
      <div
        className="bg-[#202938] text-white px-6 py-6 fixed top-0 left-0 right-0 z-10 flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between min-[720px]:gap-6"
        data-roadmap-header
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          <p className="text-sm font-normal leading-relaxed opacity-90">
            {data.subtitle}
          </p>
        </div>
        {headerActions ? (
          <div className="flex shrink-0 items-center justify-start min-[720px]:justify-end">
            {headerActions}
          </div>
        ) : null}
      </div>

      {/* Roadmap Canvas */}
      <div
        id="roadmap-canvas"
        ref={canvasScrollRef}
        className="fixed top-[100px] left-0 right-0 overflow-auto"
        style={{
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <div
          className="relative min-h-full"
          data-roadmap-capture
          style={{
            width: `${TOTAL_WIDTH}px`,
            minHeight: tracksContentHeightPx,
          }}
        >
          {/* Timeline Grid - Quarterly dividers behind events */}
          <QuarterlyTimeline />

          {data.trackCount > FIRST_BLUE_TRACK_INDEX && (
            <div
              className="absolute left-0 z-[12] pointer-events-none"
              style={{
                top: `${resourceStripTopPx()}px`,
                width: `${TOTAL_WIDTH}px`,
                height: `${RESOURCE_STRIP_HEIGHT_PX}px`,
                backgroundColor: BLUE_SWIMLANE_BG,
              }}
            />
          )}

          {/* Tracks - invisible by default, visible with debug mode */}
          {Array.from({ length: data.trackCount }).map(
            (_, index) => (
              <Track
                key={index}
                trackIndex={index}
                trackHeight={TRACK_HEIGHT_PX}
                totalWidth={TOTAL_WIDTH}
                highlighted={
                  layoutEditMode && hoveredTrackIndex === index
                }
              />
            ),
          )}

          {layoutEditMode &&
            hoveredTrackIndex !== null &&
            onAddEventInTrack && (
              <button
                type="button"
                aria-label="Add event to this track"
                className="fixed z-[45] flex size-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-700 shadow-md transition hover:bg-emerald-50 hover:shadow-lg -translate-y-1/2"
                style={{
                  right: VIEWPORT_FIXED_RIGHT_PX,
                  top:
                    Number.isFinite(
                      trackBandViewportCenters[hoveredTrackIndex] ?? Number.NaN,
                    )
                      ? trackBandViewportCenters[hoveredTrackIndex]!
                      : -9999,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddEventInTrack(hoveredTrackIndex);
                }}
              >
                <Plus className="size-5" strokeWidth={2.5} />
              </button>
            )}

          {onInsertTrackAfter &&
            Array.from({ length: data.trackCount }).map((_, afterIndex) => {
              const lineY = trackBoundaryTopPx(afterIndex);
              const centerY =
                insertLineViewportCenters[afterIndex] ?? Number.NaN;
              return (
                <div
                  key={`track-insert-${afterIndex}`}
                  ref={(el) => {
                    insertStripRefs.current[afterIndex] = el;
                  }}
                  className="absolute left-0 z-30 flex flex-col items-center justify-center gap-0 group/ins"
                  style={{
                    top: `${lineY - INSERT_HIT_PX / 2}px`,
                    width: `${TOTAL_WIDTH}px`,
                    height: `${INSERT_HIT_PX}px`,
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div
                    className="pointer-events-none absolute left-8 right-8 top-1/2 h-px -translate-y-1/2 bg-sky-500/0 transition-colors group-hover/ins:bg-sky-500/45"
                    aria-hidden
                  />
                  <button
                    type="button"
                    className="pointer-events-none group-hover/ins:pointer-events-auto opacity-0 shadow-md transition-all group-hover/ins:opacity-100 rounded-full border-2 border-sky-600 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50 fixed z-40 -translate-y-1/2"
                    style={{
                      left: VIEWPORT_FIXED_LEFT_PX,
                      top: Number.isFinite(centerY) ? centerY : -9999,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertTrackAfter(afterIndex);
                    }}
                  >
                    Add Track
                  </button>
                </div>
              );
            })}

          {/* Events */}
          {data.events.map((event) => {
            const st = eventEffectiveStatus(event);
            return (
              <div
                key={event.id}
                className={`absolute z-20 -translate-y-1/2 border border-slate-200 bg-white shadow-lg transition-shadow group box-border overflow-hidden ${
                  layoutEditMode
                    ? "cursor-grab active:cursor-grabbing hover:shadow-xl"
                    : "cursor-default hover:shadow-lg"
                }`}
                style={{
                  left: `${event.left}px`,
                  width: `${event.width}px`,
                  top: `${trackBandTopPx(event.track) + TRACK_HEIGHT_PX / 2}px`,
                  borderLeftWidth: 4,
                  borderLeftStyle: "solid",
                  borderLeftColor: STATUS_BORDER[st],
                }}
                onClick={() => onEventClick?.(event)}
                onDoubleClick={(e) => {
                  if (!layoutEditMode) return;
                  e.stopPropagation();
                  onEventDoubleClick?.(event);
                }}
                onMouseDown={(e) => handleDragStart(e, event)}
              >
                {/* Left resize handle */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-2 transition-opacity z-10 ${
                    layoutEditMode
                      ? "cursor-ew-resize hover:bg-slate-900/10 opacity-0 group-hover:opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                  onMouseDown={(e) => handleResizeStart(e, event, "left")}
                />

                <div className="flex flex-col gap-0.5 px-3 py-2 pr-2 text-slate-900">
                  <span
                    className={`self-start inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide ${STATUS_BADGE_CLASS[st]}`}
                    title={STATUS_LABEL[st]}
                  >
                    {STATUS_LABEL[st]}
                  </span>
                  <h3 className="text-sm font-semibold min-w-0 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-tight">
                    {event.description}
                  </p>
                </div>

                {/* Right resize handle */}
                <div
                  className={`absolute right-0 top-0 bottom-0 w-2 transition-opacity z-10 ${
                    layoutEditMode
                      ? "cursor-ew-resize hover:bg-slate-900/10 opacity-0 group-hover:opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                  onMouseDown={(e) => handleResizeStart(e, event, "right")}
                />
              </div>
            );
          })}
        </div>
      </div>

      {data.trackCount > FIRST_BLUE_TRACK_INDEX ? (
        <div
          className="fixed z-[35] box-border rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md text-slate-700 max-w-[300px]"
          style={{
            left: RESOURCE_LABEL_CONTENT_LEFT_PX,
            bottom: RESOURCE_LABEL_CONTENT_LEFT_PX,
            width: ADDITIONAL_CAPACITY_BOX_WIDTH,
          }}
        >
          <p className="text-sm font-semibold tracking-wide text-slate-800">
            Additional Capacity
          </p>
          <p className="text-xs font-normal leading-snug text-slate-600">
            {(
              data.capacityBandExplanation?.trim() ||
              "Stretch work we can’t staff yet—not the same as Blocked on a card."
            ).trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}