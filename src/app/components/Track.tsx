import {
  BLUE_SWIMLANE_BG,
  FIRST_BLUE_TRACK_INDEX,
  TRACK_HEIGHT_PX,
  trackBandTopPx,
} from "../utils/roadmap-layout";

export { FIRST_BLUE_TRACK_INDEX };

interface TrackProps {
  trackIndex: number;
  trackHeight?: number;
  totalWidth: number;
  /** Row highlight when pointer is in this swimlane (from canvas hit-testing). */
  highlighted?: boolean;
}

export function Track({
  trackIndex,
  trackHeight = TRACK_HEIGHT_PX,
  totalWidth,
  highlighted = false,
}: TrackProps) {
  const hasBackgroundColor = trackIndex >= FIRST_BLUE_TRACK_INDEX;
  const backgroundColor = hasBackgroundColor
    ? BLUE_SWIMLANE_BG
    : highlighted
      ? "rgba(186, 231, 254, 0.22)"
      : "transparent";

  return (
    <div
      className={`absolute left-0 transition-[background-color,box-shadow] duration-150 ${
        highlighted
          ? "z-[7] shadow-[inset_0_0_0_3px_rgba(2,132,199,0.7)]"
          : "z-5"
      }`}
      style={{
        top: `${trackBandTopPx(trackIndex)}px`,
        height: `${trackHeight}px`,
        width: `${totalWidth}px`,
        backgroundColor: backgroundColor,
      }}
      data-track={trackIndex}
    />
  );
}
