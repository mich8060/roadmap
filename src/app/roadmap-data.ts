export interface RoadmapEvent {
  id: string;
  title: string;
  description: string;
  left: number;
  width: number;
  top: number;
  color: string;
  track: number; // Track/swimlane number (0-indexed)
}

export interface RoadmapData {
  title: string;
  subtitle: string;
  trackCount: number; // Total number of tracks
  events: RoadmapEvent[];
}

/** Keeps app/Railway defaults aligned with committed `event-positions.json` snapshots. */
export const initialRoadmapData: RoadmapData = {
  title: "Design System 2026 Roadmap",
  subtitle:
    "Building the foundation for scalable, AI-enabled product development.",
  trackCount: 11,
  events: [
    {
      id: "1",
      title: "Design System to Code",
      description: "React Production Baseline",
      left: 200,
      width: 240,
      top: 128,
      color: "#0384c6",
      track: 0,
    },
    {
      id: "2",
      title: "Documents MVT",
      description: "Pilot: Design → React",
      left: 400,
      width: 250,
      top: 216,
      color: "#0384c6",
      track: 1,
    },
    {
      id: "3",
      title: "Locumsmart",
      description: "End-to-End Tier Deployment",
      left: 800,
      width: 800,
      top: 392,
      color: "#0384c6",
      track: 3,
    },
    {
      id: "4",
      title: "Rollout Standardization",
      description: "System Usage Standards",
      left: 1400,
      width: 1600,
      top: 480,
      color: "#0384c6",
      track: 4,
    },
    {
      id: "5",
      title: "Connect",
      description: "End-to-End Tier Deployment",
      left: 2400,
      width: 600,
      top: 128,
      color: "#0384c6",
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
      color: "#0384c6",
      track: 2,
    },
    {
      id: "7",
      title: "Other Product System Adoption",
      description: "Implement Tiers 1 & 2",
      left: 1600,
      width: 1400,
      top: 216,
      color: "#0384c6",
      track: 1,
    },
    {
      id: "8",
      title: "Complex Component Coverage",
      description: "Support advanced use cases, reduce custom UI.",
      left: 600,
      width: 400,
      top: 568,
      color: "#0384c6",
      track: 5,
    },
    {
      id: "9",
      title: "Design System for Native",
      description: "Extend system to native platforms.",
      left: 1000,
      width: 400,
      top: 656,
      color: "#0384c6",
      track: 6,
    },
    {
      id: "10",
      title: "DS: Native to Code",
      description: "Translate components into native code.",
      left: 1400,
      width: 600,
      top: 744,
      color: "#0384c6",
      track: 7,
    },
    {
      id: "11",
      title: "DS: Graphs Extension",
      description: "Standardize data visualization patterns.",
      left: 1400,
      width: 350,
      top: 832,
      color: "#0384c6",
      track: 8,
    },
    {
      id: "12",
      title: "DS: Accessibility",
      description: "Embed accessibility into components.",
      left: 1800,
      width: 400,
      top: 920,
      color: "#0384c6",
      track: 9,
    },
    {
      id: "13",
      title: "DS: Analytics Standardization",
      description: "Standardize tracking across products.",
      left: 2200,
      width: 400,
      top: 1008,
      color: "#0384c6",
      track: 10,
    },
  ],
};