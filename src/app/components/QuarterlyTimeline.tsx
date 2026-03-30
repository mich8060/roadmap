interface WeekLinesProps {
  hasStartDivider?: boolean;
  hasEndDivider?: boolean;
  weekCount: number;
}

function WeekLines({
  hasStartDivider = true,
  hasEndDivider = true,
  weekCount,
}: WeekLinesProps) {
  // Generate week dividers based on actual week count
  const weekDividers = Array.from(
    { length: weekCount + 1 },
    (_, i) => {
      const isFirst = i === 0;
      const isLast = i === weekCount;
      const isMiddle = !isFirst && !isLast;

      // Determine line style
      let lineOpacity = "1";
      let lineStroke = "black";
      let lineDashArray = "";

      if (
        (isFirst && hasStartDivider) ||
        (isLast && hasEndDivider)
      ) {
        // Solid boundary lines
        lineOpacity = "0.4";
        lineStroke = "#666666";
        lineDashArray = "";
      } else if (
        isMiddle ||
        (isFirst && !hasStartDivider) ||
        (isLast && !hasEndDivider)
      ) {
        // Dashed week lines
        lineOpacity = "0.3";
        lineStroke = "#666666";
        lineDashArray = "2 10";
      }

      return (
        <div
          key={i}
          className="flex h-0 items-center justify-center relative self-start shrink-0 w-0"
          style={
            {
              borderRight:
                isFirst || isLast ? "none" : "dashed 1px #CCC",
              height: "100%",
            } as React.CSSProperties
          }
        ></div>
      );
    },
  );

  return (
    <div
      className="content-stretch flex flex-[1_0_0] items-start justify-between mb-[-17px] min-h-px min-w-px relative w-full"
      data-name="Lines"
      style={{ marginTop: "-50px" }}
    >
      {weekDividers}
    </div>
  );
}

// Helper function to calculate weeks in a month for 2026
function getWeeksInMonth(monthName: string): number {
  const weeksMap: Record<string, number> = {
    January: 4,
    February: 4,
    March: 5,
    April: 4,
    May: 4,
    June: 4,
    July: 5,
    August: 4,
    September: 4,
    October: 5,
    November: 4,
    December: 4,
  };
  return weeksMap[monthName] || 4;
}

interface MonthProps {
  name: string;
  hasStartDivider?: boolean;
  hasEndDivider?: boolean;
  isLastInQuarter?: boolean;
}

function Month({
  name,
  hasStartDivider = true,
  hasEndDivider = true,
  isLastInQuarter = false,
}: MonthProps) {
  const weekCount = getWeeksInMonth(name);

  return (
    <div
      className="content-stretch flex flex-[1_0_0] flex-col h-full items-center min-h-px min-w-px pb-[17px] relative"
      data-name="Month"
    >
      <WeekLines
        hasStartDivider={hasStartDivider}
        hasEndDivider={hasEndDivider}
        weekCount={weekCount}
      />
      {/* Month divider - appears on right edge of each month except last in quarter */}
      {!isLastInQuarter && (
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#000000] opacity-40" />
      )}
    </div>
  );
}

interface QuarterlyProps {
  label: string;
  months: [string, string, string];
  leftPosition: number;
}

export function Quarterly({
  label,
  months,
  leftPosition,
}: QuarterlyProps) {
  return (
    <div
      className="absolute bottom-0 flex flex-col items-center border-r-[1px] border-[#666666] border-opacity-40 z-10"
      style={{
        left: `${leftPosition}px`,
        width: "600px",
        top: "92px",
      }}
      data-name="Quarterly"
    >
      {/* Sticky Quarter Label - stays at top */}

      <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px relative w-full">
        <Month
          name={months[0] as string}
          hasStartDivider={true}
          hasEndDivider={true}
          isLastInQuarter={false}
        />
        <Month
          name={months[1] as string}
          hasStartDivider={false}
          hasEndDivider={true}
          isLastInQuarter={false}
        />
        <Month
          name={months[2] as string}
          hasStartDivider={false}
          hasEndDivider={leftPosition + 600 >= 2400}
          isLastInQuarter={true}
        />
      </div>
    </div>
  );
}

export function QuarterlyTimeline() {
  const quarters = [
    {
      label: "Q1",
      months: ["January", "February", "March"] as [
        string,
        string,
        string,
      ],
      leftPosition: 0,
    },
    {
      label: "Q2",
      months: ["April", "May", "June"] as [
        string,
        string,
        string,
      ],
      leftPosition: 600,
    },
    {
      label: "Q3",
      months: ["July", "August", "September"] as [
        string,
        string,
        string,
      ],
      leftPosition: 1200,
    },
    {
      label: "Q4",
      months: ["October", "November", "December"] as [
        string,
        string,
        string,
      ],
      leftPosition: 1800,
    },
    {
      label: "Q1 2027",
      months: ["January", "February", "March"] as [
        string,
        string,
        string,
      ],
      leftPosition: 2400,
    },
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Single wrapper for all quarter and month labels */}
      <div className="sticky top-0 left-0 w-[3000px] h-[100px] bg-[#F9FAFC] z-100 border-b">
        {quarters.map((quarter) => (
          <div key={quarter.label}>
            {/* Quarter Label */}
            <p
              className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[#606060] text-[15px] whitespace-nowrap absolute"
              style={{
                left: `${quarter.leftPosition}px`,
                width: "600px",
                textAlign: "center",
                top: "24px",
              }}
            >
              {quarter.label}
            </p>
            {/* Month Labels */}
            {quarter.months.map((month, idx) => (
              <p
                key={`${quarter.label}-${month}`}
                className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[#606060] text-[14px] whitespace-nowrap absolute"
                style={{
                  left: `${quarter.leftPosition + idx * 200}px`,
                  width: "200px",
                  textAlign: "center",
                  top: "73px",
                }}
              >
                {month}
              </p>
            ))}
            {/* Quarter divider line in label section */}
            <div
              className="absolute top-0 bottom-0 w-[1px] bg-[#000000] opacity-40"
              style={{
                left: `${quarter.leftPosition + 599}px`,
              }}
            />
          </div>
        ))}
      </div>

      {quarters.map((quarter) => (
        <Quarterly
          key={quarter.label}
          label={quarter.label}
          months={quarter.months}
          leftPosition={quarter.leftPosition}
        />
      ))}
    </div>
  );
}