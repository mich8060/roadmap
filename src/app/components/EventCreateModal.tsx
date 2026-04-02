import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { RoadmapEvent, RoadmapEventStatus } from "../roadmap-data";
import { ROADMAP_STATUS_OPTIONS, STATUS_LABEL } from "../roadmap-status";
import { TRACK_EVENT_TOP_BASE, TRACK_HEIGHT_PX } from "../utils/roadmap-layout";
import {
  TIMELINE_MONTH_BLOCKS,
  eventRectFromTimelineWeeks,
} from "../utils/timeline-grid";

export interface EventCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackIndex: number;
  onCreate: (event: RoadmapEvent) => void;
}

export function EventCreateModal({
  open,
  onOpenChange,
  trackIndex,
  onCreate,
}: EventCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RoadmapEventStatus>("on_track");
  const [riskIssue, setRiskIssue] = useState("");
  const [riskMitigation, setRiskMitigation] = useState("");
  const [riskNeededToUnblock, setRiskNeededToUnblock] = useState("");
  const [monthIndex, setMonthIndex] = useState(0);
  const [startWeek, setStartWeek] = useState(1);
  const [durationWeeks, setDurationWeeks] = useState(4);

  const monthBlock = TIMELINE_MONTH_BLOCKS[monthIndex];
  const maxWeekInMonth = monthBlock?.weekCount ?? 4;

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setStatus("on_track");
    setRiskIssue("");
    setRiskMitigation("");
    setRiskNeededToUnblock("");
    setMonthIndex(0);
    setStartWeek(1);
    setDurationWeeks(4);
  }, [open, trackIndex]);

  useEffect(() => {
    setStartWeek((w) => Math.min(Math.max(1, w), maxWeekInMonth));
  }, [maxWeekInMonth, monthIndex]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const { left, width } = eventRectFromTimelineWeeks(
      monthIndex,
      startWeek,
      durationWeeks,
    );
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const top = TRACK_EVENT_TOP_BASE + trackIndex * TRACK_HEIGHT_PX;
    const st = status;
    const payload: RoadmapEvent = {
      id,
      title: t,
      description: description.trim(),
      left,
      width,
      top,
      color: "#ffffff",
      track: trackIndex,
      status: st,
    };
    if (st === "at_risk" || st === "blocked") {
      if (riskIssue.trim()) payload.riskIssue = riskIssue.trim();
      if (riskMitigation.trim()) payload.riskMitigation = riskMitigation.trim();
      if (riskNeededToUnblock.trim()) {
        payload.riskNeededToUnblock = riskNeededToUnblock.trim();
      }
    }
    onCreate(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Add an event to swimlane {trackIndex + 1}. It is saved with your
            roadmap file.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label
              htmlFor="event-create-status"
              className="block text-sm font-medium mb-1.5"
            >
              Roadmap status
            </label>
            <select
              id="event-create-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as RoadmapEventStatus)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ROADMAP_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {STATUS_LABEL[v]}
                </option>
              ))}
            </select>
          </div>
          {(status === "at_risk" || status === "blocked") && (
            <div className="space-y-3 rounded-md border border-amber-200/80 bg-amber-50/50 px-3 py-3">
              <p className="text-xs font-medium text-amber-950">
                Optional: issues, mitigation, and what would unblock
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  What are the issues?
                </label>
                <textarea
                  value={riskIssue}
                  onChange={(e) => setRiskIssue(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  What is being done now?
                </label>
                <textarea
                  value={riskMitigation}
                  onChange={(e) => setRiskMitigation(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  What is needed to unblock?
                </label>
                <textarea
                  value={riskNeededToUnblock}
                  onChange={(e) => setRiskNeededToUnblock(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          )}
          <div>
            <label
              htmlFor="event-create-month"
              className="block text-sm font-medium mb-1.5"
            >
              Starting month
            </label>
            <select
              id="event-create-month"
              value={monthIndex}
              onChange={(e) =>
                setMonthIndex(Number.parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {TIMELINE_MONTH_BLOCKS.map((b, i) => (
                <option key={b.id} value={i}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-create-week"
                className="block text-sm font-medium mb-1.5"
              >
                Starting week
              </label>
              <input
                id="event-create-week"
                type="number"
                min={1}
                max={maxWeekInMonth}
                value={startWeek}
                onChange={(e) =>
                  setStartWeek(
                    Math.min(
                      maxWeekInMonth,
                      Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                    ),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Week 1–{maxWeekInMonth} within this month
              </p>
            </div>
            <div>
              <label
                htmlFor="event-create-duration"
                className="block text-sm font-medium mb-1.5"
              >
                Duration (weeks)
              </label>
              <input
                id="event-create-duration"
                type="number"
                min={1}
                max={104}
                value={durationWeeks}
                onChange={(e) =>
                  setDurationWeeks(
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add event
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
