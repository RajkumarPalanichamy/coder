import React from "react";

const levelColors = {
  1: "#22c55e", // green
  2: "#eab308", // yellow
  3: "#ef4444", // red
};
const levelLabels = {
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

function CircularProgress({ solved, total, perLevelSolved, perLevelTotal }) {
  const radius = 90; // Increased from 60
  const stroke = 12; // Slightly thicker for larger circle
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  let prevPercent = 0;
  const arcs = [1, 2, 3].map((level) => {
    const percent = total > 0 ? perLevelSolved[level] / total : 0;
    const arcLength = circumference * percent;
    const dashArray = `${arcLength} ${circumference - arcLength}`;
    const dashOffset = circumference * prevPercent;
    prevPercent += percent;
    return (
      <circle
        key={level}
        stroke={levelColors[level]}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={dashArray}
        strokeDashoffset={-dashOffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: "stroke-dasharray 0.5s" }}
      />
    );
  });

  return (
    <svg height={radius * 2} width={radius * 2} style={{ position: "relative" }}>
      {/* Track */}
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress arcs */}
      {arcs}
    </svg>
  );
}

export default function StudentProgressCard({
  solved = 0,
  total = 0,
  attempting = 0,
  perLevelSolved = { 1: 0, 2: 0, 3: 0 },
  perLevelTotal = { 1: 0, 2: 0, 3: 0 },
}) {
  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow flex flex-col md:flex-row items-center justify-between px-12 py-8 gap-8 md:gap-14 border border-gray-100 mx-auto">
      {/* Title */}
      <div className="absolute left-8 top-4 text-lg font-semibold text-gray-700 hidden md:block">Progress Overview</div>
      {/* Progress + stats */}
      <div className="flex flex-col items-center justify-center flex-1 min-w-[220px]">
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <CircularProgress
            solved={solved}
            total={total}
            perLevelSolved={perLevelSolved}
            perLevelTotal={perLevelTotal}
          />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-gray-900 leading-none">{solved}</span>
            <span className="text-gray-400 text-base font-medium">/ {total}</span>
            <span className="text-green-600 text-sm mt-1 font-semibold">✓ Solved</span>
            <span className="text-gray-400 text-xs mt-1">{attempting} Attempting</span>
          </div>
        </div>
      </div>
      {/* Level stats - horizontal on desktop, vertical on mobile */}
      <div className="flex flex-row md:flex-col gap-4 md:gap-4 flex-1 justify-center md:justify-start">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className="rounded-xl px-6 py-4 flex flex-col items-center shadow-sm bg-gray-50 min-w-[110px] border border-gray-100"
          >
            <span
              className="font-bold text-base mb-1"
              style={{ color: levelColors[level] }}
            >
              {levelLabels[level]}
            </span>
            <span className="text-gray-900 text-2xl font-extrabold">
              {perLevelSolved[level]}/{perLevelTotal[level]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 