import { useState, useEffect } from "react";
import { RoadmapViewer } from "./components/RoadmapViewer";
import { EventCreateModal } from "./components/EventCreateModal";
import { EventEditModal } from "./components/EventEditModal";
import { Switch } from "./components/ui/switch";
import { Save } from "lucide-react";
import {
  initialRoadmapData,
  RoadmapData,
  RoadmapEvent,
} from "./roadmap-data";
import {
  applyEventPositionsFile,
  fetchEventPositions,
  getInitialRoadmapDataFromCode,
  persistEventPositions,
} from "./event-positions";
import { insertTrackAfter } from "./utils/roadmap-layout";

export default function App() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData>(
    getInitialRoadmapDataFromCode,
  );
  const [canvasEditMode, setCanvasEditMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [persistFailed, setPersistFailed] = useState(false);
  const [positionsHydrated, setPositionsHydrated] = useState(false);
  const [inlineEditEventId, setInlineEditEventId] = useState<string | null>(
    null,
  );
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventTrackIndex, setCreateEventTrackIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const file = await fetchEventPositions();
      if (cancelled) return;
      if (file) {
        const hasEvents =
          Array.isArray(file.events) && file.events.length > 0;
        const hasPositions =
          file.positions && Object.keys(file.positions).length > 0;
        const hasTrackCount =
          typeof file.trackCount === "number" && file.trackCount >= 1;
        const hasMeta =
          file.title !== undefined || file.subtitle !== undefined;
        if (
          hasEvents ||
          hasPositions ||
          hasTrackCount ||
          hasMeta
        ) {
          setRoadmapData(applyEventPositionsFile(initialRoadmapData, file));
        }
      }
      setPositionsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to event-positions.json via dev server API (writable JSON file only)
  useEffect(() => {
    if (!positionsHydrated) return;

    const saveData = async () => {
      setIsSaving(true);
      setPersistFailed(false);
      const ok = await persistEventPositions(roadmapData);
      setIsSaving(false);
      if (ok) {
        setLastSaved(new Date());
      } else {
        setPersistFailed(true);
      }
    };

    const timeoutId = setTimeout(() => {
      void saveData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roadmapData, positionsHydrated]);

  const handleEventUpdate = (eventId: string, updates: Partial<RoadmapEvent>) => {
    setRoadmapData((prevData) => ({
      ...prevData,
      events: prevData.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    }));
  };

  const handleInsertTrackAfter = (afterTrackIndex: number) => {
    setRoadmapData((prev) => insertTrackAfter(prev, afterTrackIndex));
  };

  const handleAddEventInTrack = (trackIndex: number) => {
    setCreateEventTrackIndex(trackIndex);
    setCreateEventOpen(true);
  };

  const handleCreateEvent = (event: RoadmapEvent) => {
    setRoadmapData((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
  };

  const inlineEditEvent =
    inlineEditEventId === null
      ? null
      : (roadmapData.events.find((e) => e.id === inlineEditEventId) ?? null);

  useEffect(() => {
    if (
      inlineEditEventId !== null &&
      !roadmapData.events.some((e) => e.id === inlineEditEventId)
    ) {
      setInlineEditEventId(null);
    }
  }, [roadmapData.events, inlineEditEventId]);

  useEffect(() => {
    if (!canvasEditMode) {
      setInlineEditEventId(null);
      setCreateEventOpen(false);
    }
  }, [canvasEditMode]);

  const headerActions = (
    <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-white max-w-[min(100vw-8rem,20rem)] drop-shadow-sm">
        {isSaving ? (
          <>
            <Save
              size={16}
              className="shrink-0 animate-pulse text-white/90"
            />
            <span className="truncate text-white/95">Saving to file...</span>
          </>
        ) : persistFailed ? (
          <>
            <Save size={16} className="shrink-0 text-amber-200" />
            <span
              className="truncate text-xs leading-snug text-amber-100"
              title="Run npm run dev so the API can write event-positions.json"
            >
              Not saved — dev server / API required for JSON file
            </span>
          </>
        ) : (
          <>
            <Save size={16} className="shrink-0 text-white" />
            <span className="truncate text-white">
              {lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString()}`
                : "Loaded from code defaults"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 drop-shadow-sm">
        <label
          htmlFor="roadmap-edit-toggle"
          className="text-sm font-medium text-white select-none cursor-pointer"
        >
          Edit
        </label>
        <Switch
          id="roadmap-edit-toggle"
          checked={canvasEditMode}
          onCheckedChange={setCanvasEditMode}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/25 border border-white/20 shadow-md"
        />
      </div>
    </div>
  );

  return (
    <div className="size-full relative">
      <RoadmapViewer
        data={roadmapData}
        headerActions={headerActions}
        layoutEditMode={canvasEditMode}
        onEventClick={(event) => {
          console.log("Event clicked:", event);
        }}
        onEventDoubleClick={(event) => setInlineEditEventId(event.id)}
        onEventUpdate={handleEventUpdate}
        onInsertTrackAfter={
          canvasEditMode ? handleInsertTrackAfter : undefined
        }
        onAddEventInTrack={
          canvasEditMode ? handleAddEventInTrack : undefined
        }
      />

      <EventEditModal
        key={inlineEditEventId ?? "closed"}
        event={inlineEditEvent}
        open={canvasEditMode && inlineEditEvent !== null}
        onOpenChange={(open) => {
          if (!open) setInlineEditEventId(null);
        }}
        onUpdate={handleEventUpdate}
      />

      <EventCreateModal
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        trackIndex={createEventTrackIndex}
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
