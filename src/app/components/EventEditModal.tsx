import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { RoadmapEvent, RoadmapEventStatus } from "../roadmap-data";
import { ROADMAP_STATUS_OPTIONS, STATUS_LABEL } from "../roadmap-status";

interface EventEditModalProps {
  event: RoadmapEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (eventId: string, updates: Partial<RoadmapEvent>) => void;
}

export function EventEditModal({
  event,
  open,
  onOpenChange,
  onUpdate,
}: EventEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit event</DialogTitle>
              <DialogDescription>
                Changes apply immediately and are saved with your roadmap.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) =>
                    onUpdate(event.id, { title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Description
                </label>
                <textarea
                  value={event.description}
                  onChange={(e) =>
                    onUpdate(event.id, { description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="event-edit-status"
                  className="block text-sm font-medium mb-1.5"
                >
                  Roadmap status
                </label>
                <select
                  id="event-edit-status"
                  value={event.status ?? "on_track"}
                  onChange={(e) =>
                    onUpdate(event.id, {
                      status: e.target.value as RoadmapEventStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ROADMAP_STATUS_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {STATUS_LABEL[v]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Shown on the timeline card. Light blue swimlanes are about
                  capacity, not this status.
                </p>
              </div>
              {((event.status ?? "on_track") === "at_risk" ||
                (event.status ?? "on_track") === "blocked") && (
                <div className="space-y-3 rounded-md border border-amber-200/80 bg-amber-50/50 px-3 py-3">
                  <p className="text-xs font-medium text-amber-950">
                    Risk detail (issues, mitigation, unblock)
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      What are the issues?
                    </label>
                    <textarea
                      value={event.riskIssue ?? ""}
                      onChange={(e) =>
                        onUpdate(event.id, { riskIssue: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      What is being done now?
                    </label>
                    <textarea
                      value={event.riskMitigation ?? ""}
                      onChange={(e) =>
                        onUpdate(event.id, { riskMitigation: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      What is needed to unblock?
                    </label>
                    <textarea
                      value={event.riskNeededToUnblock ?? ""}
                      onChange={(e) =>
                        onUpdate(event.id, {
                          riskNeededToUnblock: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
