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

export const initialRoadmapData: RoadmapData = {
  "title": "Design System 2026 Roadmap",
  "subtitle": "Building the foundation for scalable, AI-enabled product development.",
  "trackCount": 10,
  "events": [
    {
      "id": "1",
      "title": "Design System to Code",
      "description": "React Production Baseline",
      "left": 200,
      "width": 326,
      "top": 128,
      "color": "#0384c6",
      "track": 0
    },
    {
      "id": "2",
      "title": "Documents MVT",
      "description": "Pilot: Design → React",
      "left": 400,
      "width": 200,
      "top": 216,
      "color": "#0384c6",
      "track": 1
    },
    {
      "id": "3",
      "title": "Locumsmart",
      "description": "End-to-End Tier Deployment",
      "left": 1208,
      "width": 1084,
      "top": 216,
      "color": "#0384c6",
      "track": 1
    },
    {
      "id": "4",
      "title": "Rollout Standardization",
      "description": "System Usage Standards",
      "left": 2021,
      "width": 2150,
      "top": 480,
      "color": "#0384c6",
      "track": 4
    },
    {
      "id": "5",
      "title": "Connect",
      "description": "End-to-End Tier Deployment",
      "left": 3372,
      "width": 1066,
      "top": 128,
      "color": "#0384c6",
      "track": 0
    },
    {
      "id": "6",
      "title": "Establish Governance",
      "description": "Establish clear contribution rules, UX validation gates, and cross-functional ownership",
      "left": 618,
      "width": 2382,
      "top": 304,
      "color": "#0384c6",
      "track": 2
    },
    {
      "id": "7",
      "title": "Other Product System Adoption",
      "description": "Implement Tiers 1 & 2",
      "left": 2292,
      "width": 2190,
      "top": 216,
      "color": "#0384c6",
      "track": 1
    },
    {
      "id": "8",
      "title": "Complex Component Coverage",
      "description": "Support advanced use cases, reduce custom UI.",
      "left": 856,
      "width": 539,
      "top": 128,
      "color": "#0384c6",
      "track": 0
    },
    {
      "id": "9",
      "title": "Design System for Native",
      "description": "Extend system to native platforms.",
      "left": 1395,
      "width": 539,
      "top": 128,
      "color": "#0384c6",
      "track": 0
    },
    {
      "id": "10",
      "title": "DS: Native to Code",
      "description": "Translate components into native code.",
      "left": 1934,
      "width": 814,
      "top": 128,
      "color": "#0384c6",
      "track": 0
    },
    {
      "id": "11",
      "title": "DS: Graphs Extension",
      "description": "Standardize data visualization patterns.",
      "left": 1934,
      "width": 429,
      "top": 392,
      "color": "#0384c6",
      "track": 3
    },
    {
      "id": "12",
      "title": "DS: Accessibility",
      "description": "Embed accessibility into components.",
      "left": 2475,
      "width": 542,
      "top": 392,
      "color": "#0384c6",
      "track": 3
    },
    {
      "id": "13",
      "title": "DS: Analytics Standardization",
      "description": "Standardize tracking across products.",
      "left": 3015,
      "width": 520,
      "top": 392,
      "color": "#0384c6",
      "track": 3
    }
  ]
};