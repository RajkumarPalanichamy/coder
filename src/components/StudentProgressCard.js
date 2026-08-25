import React from "react";

// Overall progress only - the legacy Level 1 / Level 2 / Level 3 breakdown was
// removed from the student profile.
function CircularProgress({ solved, total }) {
  const radius = 90;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const percent = total > 0 ? Math.min(solved / total, 1) : 0;
  const arcLength = circumference * percent;

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
      {/* Progress */}
      <circle
        stroke="#22c55e"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`}
        style={{ transition: "stroke-dasharray 0.5s" }}
      />
    </svg>
  );
}

export default function StudentProgressCard({
  solved = 0,
  total = 0,
  attempting = 0,
  cumulativeScore = 0,
  email = "",
}) {
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow flex flex-col md:flex-row items-center justify-between px-12 py-8 gap-8 md:gap-14 border border-gray-100 mx-auto">
      {/* Progress ring */}
      <div className="flex flex-col items-center justify-center flex-1 min-w-[220px]">
        <div className="text-lg font-semibold text-gray-700 mb-4">Progress Overview</div>
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          <CircularProgress solved={solved} total={total} />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-gray-900 leading-none">{solved}</span>
            <span className="text-gray-400 text-base font-medium">/ {total}</span>
            <span className="text-green-600 text-sm mt-1 font-semibold">✓ Solved</span>
            <span className="text-gray-400 text-xs mt-1">{attempting} Attempting</span>
          </div>
        </div>
      </div>

      {/* Email ID + cumulative score */}
      <div className="flex flex-col gap-4 flex-1 w-full md:w-auto">
        <div className="rounded-xl px-6 py-4 bg-indigo-50 border border-indigo-100 shadow-sm">
          <span className="block text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
            Email ID
          </span>
          <span className="block text-gray-900 font-semibold break-all">{email || "-"}</span>
        </div>
        <div className="rounded-xl px-6 py-4 bg-yellow-50 border border-yellow-100 shadow-sm">
          <span className="block text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">
            Cumulative Score
          </span>
          <span className="block text-3xl font-extrabold text-gray-900">{cumulativeScore}</span>
        </div>
        <div className="rounded-xl px-6 py-4 bg-green-50 border border-green-100 shadow-sm">
          <span className="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            Completion
          </span>
          <span className="block text-3xl font-extrabold text-gray-900">{percent}%</span>
        </div>
      </div>
    </div>
  );
}
