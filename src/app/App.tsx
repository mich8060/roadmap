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
  EVENT_POSITIONS_API,
  fetchEventPositions,
  getInitialRoadmapDataFromCode,
  persistEventPositions,
  usesRemoteEventPositionsApi,
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
  /** Save line + Edit toggle; reveal with ⌘E (Mac) or Ctrl+E (Windows/Linux). */
  const [editorChromeVisible, setEditorChromeVisible] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key.toLowerCase() !== "e") return;
      e.preventDefault();
      setEditorChromeVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!editorChromeVisible) {
      setCanvasEditMode(false);
      setInlineEditEventId(null);
      setCreateEventOpen(false);
    }
  }, [editorChromeVisible]);

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
              title={
                import.meta.env.DEV
                  ? "Run npm run dev so Vite proxies /api to the local Express API on port 3040."
                  : usesRemoteEventPositionsApi()
                    ? `PUT target: ${EVENT_POSITIONS_API}. In DevTools → Network, check status (expect 200). Verify Railway service is running, public URL enabled, and CORS_ORIGIN includes your Vercel origin if not using *.`
                    : "This build has no Railway URL. In Vercel → Project → Settings → Environment Variables, add VITE_EVENT_POSITIONS_API_BASE=https://your-service.up.railway.app (no trailing slash), then redeploy."
              }
            >
              {import.meta.env.DEV
                ? "Not saved — run npm run dev (API + Vite)"
                : usesRemoteEventPositionsApi()
                  ? "Not saved — Railway request failed (see Network tab)"
                  : "Not saved — add VITE_EVENT_POSITIONS_API_BASE on Vercel + redeploy"}
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
        headerActions={editorChromeVisible ? headerActions : undefined}
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
