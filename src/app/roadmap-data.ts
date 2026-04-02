/** Delivery health for an item (separate from the light-blue “capacity” swimlanes). */
export type RoadmapEventStatus =
  | "pending"
  | "on_track"
  | "at_risk"
  | "blocked";

export interface RoadmapEvent {
  id: string;
  title: string;
  description: string;
  left: number;
  width: number;
  top: number;
  color: string;
  track: number; // Track/swimlane number (0-indexed)
  /** Defaults to on_track when omitted (legacy JSON). */
  status?: RoadmapEventStatus;
  /** At Risk / Blocked: what is wrong or uncertain. */
  riskIssue?: string;
  /** What is being done now. */
  riskMitigation?: string;
  /** What would unblock or stabilize. */
  riskNeededToUnblock?: string;
}

export interface RoadmapData {
  title: string;
  subtitle: string;
  trackCount: number; // Total number of tracks
  events: RoadmapEvent[];
  /** Bottom of export report. */
  whyThisMatters?: string;
  valueSnapshot?: string;
  /**
   * Copy for the light-blue swimlanes: work we still need but cannot fully run
   * at current capacity (not the same as Blocked delivery status).
   */
  capacityBandExplanation?: string;
}

/** Keeps app/Railway defaults aligned with committed `event-positions.json` snapshots. */
export const initialRoadmapData: RoadmapData = {
  title: "Design System 2026 Roadmap",
  subtitle:
    "Building the foundation for scalable, AI-enabled product development.",
  trackCount: 11,
  whyThisMatters:
    "This roadmap makes trade-offs visible: what is on track, what needs attention, and which initiatives only move with more capacity — so planning matches delivery reality.",
  valueSnapshot:
    "• Clear delivery signals: green / yellow / red map to how work is progressing.\n• Honest capacity story: the blue swimlane is stretch work, not hidden backlog.\n• Key risks spell out issues, actions, and what would unblock.",
  capacityBandExplanation:
    "Stretch work we can’t staff yet—not the same as Blocked on a card.",
  events: [
    {
      id: "1",
      title: "Design System to Code",
      description: "React Production Baseline",
      left: 200,
      width: 240,
      top: 128,
      color: "#ffffff",
      track: 0,
    },
    {
      id: "2",
      title: "Documents MVT",
      description: "Pilot: Design → React",
      left: 400,
      width: 250,
      top: 216,
      color: "#ffffff",
      track: 1,
    },
    {
      id: "3",
      title: "Locumsmart",
      description: "End-to-End Tier Deployment",
      left: 800,
      width: 800,
      top: 392,
      color: "#ffffff",
      track: 3,
    },
    {
      id: "4",
      title: "Rollout Standardization",
      description: "System Usage Standards",
      left: 1400,
      width: 1600,
      top: 480,
      color: "#ffffff",
      track: 4,
    },
    {
      id: "5",
      title: "Connect",
      description: "End-to-End Tier Deployment",
      left: 2400,
      width: 600,
      top: 128,
      color: "#ffffff",
      track: 0,
    },
    {
      id: "6",
      title: "Establish Governance",
      description:
        "Establish clear contribution rules, UX validation gates, and cross-functional ownership",
      left: 560,
      width: 2440,
      top: 304,
      color: "#ffffff",
      track: 2,
    },
    {
      id: "7",
      title: "Other Product System Adoption",
      description: "Implement Tiers 1 & 2",
      left: 1600,
      width: 1400,
      top: 216,
      color: "#ffffff",
      track: 1,
    },
    {
      id: "8",
      title: "Complex Component Coverage",
      description: "Support advanced use cases, reduce custom UI.",
      left: 600,
      width: 400,
      top: 568,
      color: "#ffffff",
      track: 5,
    },
    {
      id: "9",
      title: "Design System for Native",
      description: "Extend system to native platforms.",
      left: 1000,
      width: 400,
      top: 656,
      color: "#ffffff",
      track: 6,
    },
    {
      id: "10",
      title: "DS: Native to Code",
      description: "Translate components into native code.",
      left: 1400,
      width: 600,
      top: 744,
      color: "#ffffff",
      track: 7,
    },
    {
      id: "11",
      title: "DS: Graphs Extension",
      description: "Standardize data visualization patterns.",
      left: 1400,
      width: 350,
      top: 832,
      color: "#ffffff",
      track: 8,
    },
    {
      id: "12",
      title: "DS: Accessibility",
      description: "Embed accessibility into components.",
      left: 1800,
      width: 400,
      top: 920,
      color: "#ffffff",
      track: 9,
    },
    {
      id: "13",
      title: "DS: Analytics Standardization",
      description: "Standardize tracking across products.",
      left: 2200,
      width: 400,
      top: 1008,
      color: "#ffffff",
      track: 10,
    },
  ],
};