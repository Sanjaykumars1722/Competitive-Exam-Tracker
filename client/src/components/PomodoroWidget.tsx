import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Volume2, VolumeX } from 'lucide-react';
import { api } from '../api/client';
import { Modal } from './Modal';

interface PomodoroWidgetProps {
  onSessionLogged?: () => void;
  compact?: boolean;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  onSessionLogged,
  compact = false,
}) => {
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [completedMinutes, setCompletedMinutes] = useState<number>(25);
  const [logSubject, setLogSubject] = useState<string>('');
  const [logTopic, setLogTopic] = useState<string>('');
  const [logNotes, setLogNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const getModeDuration = (m: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    switch (m) {
      case 'FOCUS':
        return 25 * 60;
      case 'SHORT_BREAK':
        return 5 * 60;
      case 'LONG_BREAK':
        return 15 * 60;
    }
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            if (mode === 'FOCUS') {
              setCompletedMinutes(25);
              setShowLogModal(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  const switchMode = (newMode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
  };

  const handleManualComplete = () => {
    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.round((getModeDuration(mode) - timeLeft) / 60));
    setCompletedMinutes(elapsedMinutes);
    setShowLogModal(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSubject.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/study-logs', {
        subject: logSubject.trim(),
        topic: logTopic.trim(),
        durationMinutes: completedMinutes,
        sessionType: 'POMODORO',
        notes: logNotes.trim(),
        date: new Date(),
      });

      setShowLogModal(false);
      setLogSubject('');
      setLogTopic('');
      setLogNotes('');
      handleReset();
      if (onSessionLogged) onSessionLogged();
    } catch (err) {
      console.error('Failed to log study session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(((getModeDuration(mode) - timeLeft) / getModeDuration(mode)) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
        <span className="font-mono font-bold text-indigo-700 text-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center">
      {/* Mode Selectors */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          onClick={() => switchMode('FOCUS')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'FOCUS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => switchMode('SHORT_BREAK')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'SHORT_BREAK'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => switchMode('LONG_BREAK')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'LONG_BREAK'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Circular Timer Visual */}
      <div className="relative w-52 h-52 flex items-center justify-center mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="104"
            cy="104"
            r="92"
            className="text-slate-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="104"
            cy="104"
            r="92"
            className="text-indigo-600 transition-all duration-500 ease-linear"
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 92}
            strokeDashoffset={2 * Math.PI * 92 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono tracking-tight text-slate-800">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {mode === 'FOCUS' ? 'Study Block' : 'Break Time'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Focus
            </>
          )}
        </button>

        <button
          onClick={handleManualComplete}
          className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          title="Log Session Now"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Session Logger Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="🎉 Session Complete! Log Your Progress"
        maxWidth="md"
      >
        <form onSubmit={handleSaveLog} className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-900">
                {completedMinutes} Minutes Focused Work
              </p>
              <p className="text-xs text-indigo-700">
                Keep up your daily study streak!
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Indian History, Algorithms, Quantitative Aptitude"
              value={logSubject}
              onChange={(e) => setLogSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topic / Chapter Covered
            </label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming, Fundamental Rights"
              value={logTopic}
              onChange={(e) => setLogTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes & Key Takeaways
            </label>
            <textarea
              rows={2}
              placeholder="What did you learn? Any questions or revision needed?"
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save to Study Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
