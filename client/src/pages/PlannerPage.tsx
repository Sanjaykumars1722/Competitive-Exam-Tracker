import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { IStudyLog, IStudyStats, IExam } from '../types';
import { PomodoroWidget } from '../components/PomodoroWidget';
import { Modal } from '../components/Modal';
import {
  CalendarDays,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [logs, setLogs] = useState<IStudyLog[]>([]);
  const [stats, setStats] = useState<IStudyStats | null>(null);
  const [exams, setExams] = useState<IExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedExamName, setSelectedExamName] = useState('General Prep');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sessionType, setSessionType] = useState<string>('POMODORO');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlannerData = async () => {
    try {
      const [logsRes, statsRes, examsRes] = await Promise.all([
        api.get('/study-logs'),
        api.get('/study-logs/stats'),
        api.get('/exams'),
      ]);
      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error('Failed to load planner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/study-logs', {
        examName: selectedExamName,
        subject: subject.trim(),
        topic: topic.trim(),
        durationMinutes,
        sessionType,
        notes: notes.trim(),
        date: new Date(),
      });

      setShowManualModal(false);
      setSubject('');
      setTopic('');
      setNotes('');
      fetchPlannerData();
    } catch (err) {
      console.error('Failed to create manual study log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this study log entry?')) return;
    try {
      await api.delete(`/study-logs/${id}`);
      fetchPlannerData();
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-600" />
            Study Planner & Focus Timer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build discipline with Pomodoro blocks, session tracking & streak management
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Manual Study Session</span>
        </button>
      </div>

      {/* Main Grid: Pomodoro on Left, 7-Day Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <PomodoroWidget onSessionLogged={fetchPlannerData} />

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Subject Time Distribution
            </h4>
            <div className="space-y-2.5">
              {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 ? (
                stats.subjectBreakdown.slice(0, 5).map((sb, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sb.subject}</span>
                      <span className="font-mono font-bold text-indigo-600">{sb.hours}h</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${stats.totalLifetimeHours ? (sb.hours / stats.totalLifetimeHours) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No sessions recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">7-Day Study Discipline</h4>
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                {stats?.streakCount || 1}-Day Streak
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {stats?.weeklyChart?.map((day, idx) => {
                const isMet = day.hours >= day.targetHours;
                const isToday = idx === stats.weeklyChart.length - 1;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center border transition-all ${
                      isToday
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : isMet
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {day.day}
                    </span>
                    <span className="text-lg font-black text-slate-800 font-mono my-1">
                      {day.hours}h
                    </span>
                    {isMet ? (
                      <span className="text-[10px] font-bold text-emerald-600">Met</span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        /{day.targetHours}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">Study Session History</h4>
              <span className="text-xs text-slate-400">{logs.length} logged sessions</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sessions logged yet. Complete a Pomodoro block to start your history!
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log._id} className="py-3 flex items-center justify-between gap-4 group">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {log.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                          {log.sessionType}
                        </span>
                      </div>
                      {log.topic && (
                        <p className="text-xs text-slate-500 truncate">{log.topic}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {new Date(log.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {log.examName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-indigo-600">
                          {log.durationMinutes} min
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {(log.durationMinutes / 60).toFixed(1)} hrs
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Log Study Session"
        maxWidth="md"
      >
        <form onSubmit={handleManualLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Exam
            </label>
            <select
              value={selectedExamName}
              onChange={(e) => setSelectedExamName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="General Prep">General Prep</option>
              {exams.map((e) => (
                <option key={e._id} value={e.name}>
                  {e.name} ({e.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Indian History, Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topic / Chapter
            </label>
            <input
              type="text"
              placeholder="e.g. Gandhian Era, Graph Algorithms"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                max="720"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="POMODORO">Pomodoro Focus</option>
                <option value="REVISION">Spaced Revision</option>
                <option value="PROBLEM_SOLVING">Problem Solving</option>
                <option value="READING">Reading / Theory</option>
                <option value="MOCK_TEST">Mock Test Analysis</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key concepts grasped or pending doubts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
