import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { IExam, IStudyStats, IMockAnalytics } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';
import {
  GraduationCap,
  Clock,
  Flame,
  Award,
  Calendar,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<IExam[]>([]);
  const [stats, setStats] = useState<IStudyStats | null>(null);
  const [mockAnalytics, setMockAnalytics] = useState<IMockAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [examsRes, statsRes, mockRes] = await Promise.all([
        api.get('/exams'),
        api.get('/study-logs/stats'),
        api.get('/mock-tests/analytics'),
      ]);

      setExams(examsRes.data);
      setStats(statsRes.data);
      setMockAnalytics(mockRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const nextExam = exams.length > 0 ? exams[0] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3">
            <span>📅</span>
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Aspirant'}! 🚀
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            "Continuous effort — not strength or intelligence — is the key to unlocking your potential."
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/planner"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Launch Pomodoro</span>
          </Link>
          <Link
            to="/mock-tests"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all"
          >
            <span>Log Mock</span>
          </Link>
        </div>
      </div>

      {/* Next Priority Exam Hero Card */}
      {nextExam && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {nextExam.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {nextExam.code}
                </span>
                {nextExam.officialWebsite && (
                  <a
                    href={nextExam.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Official Portal ↗
                  </a>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {nextExam.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Exam Date: <span className="font-semibold text-slate-700">{new Date(nextExam.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Time Remaining
                </p>
                <CountdownTimer targetDate={nextExam.targetDate} size="md" />
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-3 sm:pt-0">
                <Link
                  to="/syllabus"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  <span>Track Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Syllabus Progress Bar for next exam */}
          {nextExam.metrics && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700">Overall Syllabus Completion</span>
                <span className="font-black text-indigo-600 font-mono">
                  {nextExam.metrics.completionPercentage}% ({nextExam.metrics.masteredTopics + nextExam.metrics.revisedTopics}/{nextExam.metrics.totalTopics} Topics Covered)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${nextExam.metrics.totalTopics ? (nextExam.metrics.masteredTopics / nextExam.metrics.totalTopics) * 100 : 0}%`,
                  }}
                  title="Mastered"
                />
                <div
                  className="bg-indigo-500 transition-all duration-500"
                  style={{
                    width: `${nextExam.metrics.totalTopics ? (nextExam.metrics.revisedTopics / nextExam.metrics.totalTopics) * 100 : 0}%`,
                  }}
                  title="Revised"
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${nextExam.metrics.totalTopics ? (nextExam.metrics.inProgressTopics / nextExam.metrics.totalTopics) * 100 : 0}%`,
                  }}
                  title="In Progress"
                />
              </div>
              <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered ({nextExam.metrics.masteredTopics})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Revised ({nextExam.metrics.revisedTopics})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress ({nextExam.metrics.inProgressTopics})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-200" /> Not Started ({nextExam.metrics.notStartedTopics})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Study</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats?.todayHours || 0}</span>
              <span className="text-xs font-bold text-slate-400">/ {stats?.dailyGoalHours || 4} hrs</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats?.goalProgressPercentage || 0}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400">
            {stats?.goalProgressPercentage || 0}% of daily target achieved
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Streak</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats?.streakCount || 1} Days
            </span>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span>🔥</span> Consistent preparation
            </p>
          </div>
          <p className="text-[11px] font-semibold text-slate-400">Streak resets if 0 logs for 48h</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Exams</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {exams.length}
            </span>
            <p className="text-xs text-purple-600 font-bold mt-1">Enrolled & Tracked</p>
          </div>
          <Link to="/exams" className="text-[11px] font-bold text-indigo-600 hover:underline">
            Manage enrolled exams →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Mock Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {mockAnalytics?.averageAccuracy ? `${mockAnalytics.averageAccuracy}%` : 'N/A'}
            </span>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              Across {mockAnalytics?.totalTests || 0} tests taken
            </p>
          </div>
          <Link to="/mock-tests" className="text-[11px] font-bold text-indigo-600 hover:underline">
            View score progression →
          </Link>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900">Weekly Study Effort</h4>
              <p className="text-xs text-slate-500">Daily hours logged across the past 7 days</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Total Lifetime</span>
              <p className="text-sm font-black text-indigo-600 font-mono">
                {stats?.totalLifetimeHours || 0} hrs
              </p>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-slate-100">
            {stats?.weeklyChart?.map((dayItem, idx) => {
              const maxHours = Math.max(8, ...stats.weeklyChart.map((d) => d.hours));
              const heightPercent = Math.min(100, Math.round((dayItem.hours / maxHours) * 100));
              const isMet = dayItem.hours >= dayItem.targetHours;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold font-mono text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {dayItem.hours}h
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isMet ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-indigo-400 group-hover:bg-indigo-300'
                      }`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{dayItem.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              Hours Studied
            </span>
            <span className="text-slate-400">
              Target: {stats?.dailyGoalHours || 4}h daily
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900">Priority Revision Focus</h4>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Identified weak areas from your recent mock test analyses:
            </p>

            <div className="space-y-2">
              {mockAnalytics?.frequentWeakTopics && mockAnalytics.frequentWeakTopics.length > 0 ? (
                mockAnalytics.frequentWeakTopics.slice(0, 5).map((wt, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-800">{wt.topic}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                      {wt.count} mistake{wt.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Log your first mock test to see weak-area detection!
                </div>
              )}
            </div>
          </div>

          <Link
            to="/mock-tests"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            <span>Mock Test Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
