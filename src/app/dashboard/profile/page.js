'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Flame,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

/* ------------------------------------------------------------------ helpers */

const HEATMAP_WEEKS = 26;

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Local (not UTC) day key, so evening submissions do not land on the next day.
const dayKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const HEAT_LEVELS = [
  'bg-slate-100',
  'bg-indigo-200',
  'bg-indigo-300',
  'bg-indigo-500',
  'bg-indigo-700',
];

const heatLevel = (count) => {
  if (!count) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 26 weeks of day cells, ending with the current week. */
function buildCalendar(countsByDay) {
  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // Saturday of this week

  const totalDays = HEATMAP_WEEKS * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1));

  const weeks = [];
  for (let week = 0; week < HEATMAP_WEEKS; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      const key = dayKey(date);
      days.push({ date, key, count: countsByDay[key] || 0, future: date > today });
    }
    weeks.push(days);
  }
  return weeks;
}

/** Animated number - the score should feel earned, not just printed. */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const goal = Number(target) || 0;
    if (goal === 0) {
      setValue(0);
      return undefined;
    }
    let frame;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(goal * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

/* --------------------------------------------------------------- components */

function ProgressRing({ percent, size = 190, stroke = 14, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="profileRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#profileRing)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5">
      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 ${tone.blob}`} />
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${tone.chip}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-extrabold text-slate-900 leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-sm font-semibold text-slate-700">{label}</div>
      {sub ? <div className="text-xs text-slate-400 mt-0.5">{sub}</div> : null}
    </div>
  );
}

function SectionCard({ title, icon: Icon, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="w-5 h-5 text-indigo-500" /> : null}
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ActivityCalendar({ weeks, total }) {
  const monthLabels = weeks.map((week, index) => {
    const month = week[0].date.getMonth();
    const previous = index > 0 ? weeks[index - 1][0].date.getMonth() : null;
    return index === 0 || month !== previous ? MONTHS[month] : '';
  });

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          <div className="flex gap-[3px] mb-1">
            <div className="w-8 flex-shrink-0" />
            {monthLabels.map((label, index) => (
              <div key={index} className="w-[13px] text-[10px] text-slate-400 font-medium">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {/* One slot per weekday so the labels line up with their rows */}
            <div className="w-8 flex-shrink-0 flex flex-col gap-[3px] text-[10px] text-slate-400 font-medium">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, index) => (
                <span key={index} className="h-[13px] leading-[13px]">
                  {label}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.key}
                    title={
                      day.future
                        ? ''
                        : `${day.count} submission${day.count === 1 ? '' : 's'} on ${day.date.toDateString()}`
                    }
                    className={`w-[13px] h-[13px] rounded-[3px] transition-transform duration-150 hover:scale-125 ${
                      day.future ? 'bg-transparent' : HEAT_LEVELS[heatLevel(day.count)]
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <span>
          <strong className="text-slate-700">{total}</strong> submissions in the last 6 months
        </span>
        <span className="flex items-center gap-1.5">
          Less
          {HEAT_LEVELS.map((tone) => (
            <span key={tone} className={`w-[11px] h-[11px] rounded-[3px] ${tone}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

function AchievementBadge({ badge }) {
  const Icon = badge.icon;
  return (
    <div
      title={badge.description}
      className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
        badge.earned
          ? 'border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm'
          : 'border-slate-100 bg-slate-50/60 opacity-60'
      }`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
          badge.earned ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white' : 'bg-slate-200 text-slate-400'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">{badge.label}</div>
        <div className="text-xs text-slate-500 truncate">{badge.description}</div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- page */

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [userRes, statsRes, subsRes, progressRes] = await Promise.all([
          fetch('/api/user/me', { credentials: 'include' }),
          fetch('/api/user/stats', { credentials: 'include' }),
          fetch('/api/submissions', { credentials: 'include' }),
          fetch('/api/user/weekly-progress', { credentials: 'include' }),
        ]);
        if (!active) return;

        setUser(userRes.ok ? (await userRes.json()).user : null);
        setStats(statsRes.ok ? await statsRes.json() : null);
        setSubmissions(subsRes.ok ? (await subsRes.json()).submissions || [] : []);
        setProgress(progressRes.ok ? await progressRes.json() : null);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const totalProblems = stats?.totalProblems || 0;
  const solvedProblems = stats?.solvedProblems || 0;
  const totalSubmissions = stats?.totalSubmissions || 0;
  const accepted = stats?.acceptedSubmissions || 0;
  const rejected = stats?.rejectedSubmissions || 0;
  const cumulativeScore = stats?.cumulativeScore || 0;
  const problemScore = stats?.problemScore || 0;
  const testScore = stats?.testScore || 0;
  const dayStreak = progress?.dayStreak || 0;

  const completion = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const accuracy = totalSubmissions > 0 ? Math.round((accepted / totalSubmissions) * 100) : 0;
  const animatedScore = useCountUp(cumulativeScore);

  const { calendar, calendarTotal, languages, recent } = useMemo(() => {
    const countsByDay = {};
    const languageCounts = {};
    let windowTotal = 0;

    const windowStart = startOfDay(new Date());
    windowStart.setDate(windowStart.getDate() - HEATMAP_WEEKS * 7);

    submissions.forEach((submission) => {
      const when = submission.submittedAt || submission.createdAt;
      if (when) {
        const key = dayKey(when);
        countsByDay[key] = (countsByDay[key] || 0) + 1;
        if (new Date(when) >= windowStart) windowTotal += 1;
      }
      const language = submission.type === 'problem' ? submission.language : null;
      if (language) languageCounts[language] = (languageCounts[language] || 0) + 1;
    });

    const ranked = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topCount = ranked.length > 0 ? ranked[0][1] : 0;

    return {
      calendar: buildCalendar(countsByDay),
      calendarTotal: windowTotal,
      languages: ranked.map(([name, count]) => ({ name, count, share: topCount ? (count / topCount) * 100 : 0 })),
      recent: submissions.slice(0, 6),
    };
  }, [submissions]);

  const badges = useMemo(
    () => [
      { id: 'first', label: 'First Blood', description: 'Solve your first problem', icon: Sparkles, earned: solvedProblems >= 1 },
      { id: 'ten', label: 'Perfect Ten', description: 'Solve 10 problems', icon: Target, earned: solvedProblems >= 10 },
      { id: 'century', label: 'Century Club', description: 'Reach 100 cumulative points', icon: Trophy, earned: cumulativeScore >= 100 },
      { id: 'sharp', label: 'Sharpshooter', description: '80%+ acceptance rate', icon: CheckCircle2, earned: accuracy >= 80 && totalSubmissions >= 5 },
      { id: 'streak', label: 'On Fire', description: '7 day activity streak', icon: Flame, earned: dayStreak >= 7 },
      { id: 'test', label: 'Test Ace', description: 'Score on a mock test', icon: Crown, earned: testScore > 0 },
    ],
    [solvedProblems, cumulativeScore, accuracy, totalSubmissions, dayStreak, testScore]
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable - the address is on screen anyway */
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 md:px-0">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-56 rounded-3xl bg-white/70" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="h-32 rounded-2xl bg-white/70" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white/70" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">We could not load your profile.</p>
          <p className="text-slate-500 text-sm mt-1">Please sign in again and retry.</p>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'ST';
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="px-4 py-8 md:px-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ---------------------------------------------------------- hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-xl">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-black/10 blur-2xl" />

          <div className="relative p-8 md:p-10 flex flex-col lg:flex-row lg:items-center gap-8">
            {/* identity */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-lg">
                  {initials}
                </div>
                {user.isActive && (
                  <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 bg-emerald-400 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-900" />
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 capitalize">
                    {user.role}
                  </span>
                  {joined ? (
                    <span className="text-white/70 text-xs font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Member since {joined}
                    </span>
                  ) : null}
                </div>

                {/* Email ID - required profile field */}
                <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl pl-3 pr-2 py-2 max-w-full">
                  <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold leading-none">
                      Email ID
                    </div>
                    <div className="text-sm text-white font-semibold truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={copyEmail}
                    title="Copy email address"
                    className="ml-1 p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/70" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cumulative score - required profile field */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-8 py-6 text-center shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-white/70 text-[11px] font-bold uppercase tracking-widest">
                  <Trophy className="w-3.5 h-3.5" />
                  Cumulative Score
                </div>
                <div className="text-6xl font-black text-white leading-none mt-2 tabular-nums">
                  {animatedScore}
                </div>
                <div className="mt-3 flex items-center justify-center gap-4 text-white/80 text-xs font-medium">
                  <span>{problemScore} problems</span>
                  <span className="w-px h-3 bg-white/30" />
                  <span>{testScore} tests</span>
                </div>
                {progress?.rank ? (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {progress.rank}
                    {progress.totalUsers ? (
                      <span className="text-white/60 font-medium">
                        · #{progress.userRank} of {progress.totalUsers}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            icon={Target}
            label="Problems Solved"
            value={solvedProblems}
            sub={`of ${totalProblems} available`}
            tone={{ chip: 'bg-indigo-50 text-indigo-600', blob: 'bg-indigo-500' }}
          />
          <StatTile
            icon={CheckCircle2}
            label="Acceptance Rate"
            value={`${accuracy}%`}
            sub={`${accepted} accepted · ${rejected} rejected`}
            tone={{ chip: 'bg-emerald-50 text-emerald-600', blob: 'bg-emerald-500' }}
          />
          <StatTile
            icon={Flame}
            label="Day Streak"
            value={dayStreak}
            sub={dayStreak > 0 ? 'Keep it alive' : 'Submit today to start'}
            tone={{ chip: 'bg-orange-50 text-orange-600', blob: 'bg-orange-500' }}
          />
          <StatTile
            icon={Activity}
            label="Submissions"
            value={totalSubmissions}
            sub={`Avg score ${stats?.averageScore || 0}%`}
            tone={{ chip: 'bg-violet-50 text-violet-600', blob: 'bg-violet-500' }}
          />
        </div>

        {/* ------------------------------------------------ progress + heat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard title="Progress Overview" icon={Trophy}>
            <div className="flex flex-col items-center">
              <ProgressRing percent={completion}>
                <span className="text-5xl font-black text-slate-900 leading-none tabular-nums">
                  {solvedProblems}
                </span>
                <span className="text-slate-400 text-sm font-semibold">/ {totalProblems}</span>
                <span className="mt-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {completion}% complete
                </span>
              </ProgressRing>

              <div className="w-full mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Problem points</span>
                    <span className="text-slate-800">{problemScore}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                      style={{ width: `${cumulativeScore ? (problemScore / cumulativeScore) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Test points</span>
                    <span className="text-slate-800">{testScore}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${cumulativeScore ? (testScore / cumulativeScore) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Activity" icon={Activity} className="lg:col-span-2">
            <ActivityCalendar weeks={calendar} total={calendarTotal} />

            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Languages used
              </h3>
              {languages.length === 0 ? (
                <p className="text-sm text-slate-400">No code submissions yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {languages.map((language) => (
                    <div key={language.name} className="flex items-center gap-3">
                      <BrandLogo name={language.name} size="xs" className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span className="capitalize truncate">{language.name}</span>
                          <span className="text-slate-400">{language.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-700"
                            style={{ width: `${language.share}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ---------------------------------------------- badges + timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Achievements" icon={Award}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <AchievementBadge key={badge.id} badge={badge} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity" icon={Clock}>
            {recent.length === 0 ? (
              <div className="text-center py-10">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Nothing here yet - solve a problem to start your story.
                </p>
              </div>
            ) : (
              <ol className="relative border-l border-slate-200 ml-3 space-y-4">
                {recent.map((item, index) => {
                  const isTest = item.type === 'test';
                  const title = isTest
                    ? item.test?.title || 'Mock test'
                    : item.problem?.title || 'Problem';
                  const passed = isTest
                    ? item.status === 'completed' || item.status === 'submitted'
                    : item.status === 'accepted' || item.status === 'passed';
                  const when = item.submittedAt ? new Date(item.submittedAt) : null;

                  return (
                    <li key={item._id || index} className="ml-5">
                      <span
                        className={`absolute -left-[7px] flex items-center justify-center w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                          passed ? 'bg-emerald-500' : 'bg-rose-400'
                        }`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isTest ? 'Mock test' : item.language || 'Problem'}
                            {when ? ` · ${when.toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                            passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}
                        >
                          {typeof item.score === 'number' ? `${item.score}%` : passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>
        </div>

        {/* ------------------------------------------------------- account */}
        <SectionCard title="Account Details" icon={ShieldCheck}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email ID
              </div>
              <div className="text-sm font-semibold text-slate-800 break-all">{user.email}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Role
              </div>
              <div className="text-sm font-semibold text-slate-800 capitalize">{user.role}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <LogIn className="w-3 h-3" />
                Last Login
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
