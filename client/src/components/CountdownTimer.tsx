import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
        Exam Finished / In Progress
      </span>
    );
  }

  const isUrgent = timeLeft.days <= 14;
  const isModerate = timeLeft.days <= 45;

  const getBadgeColor = () => {
    if (isUrgent) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (isModerate) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-indigo-600 bg-indigo-50 border-indigo-200';
  };

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold ${getBadgeColor()}`}>
        <span>{timeLeft.days}d</span>
        <span>:</span>
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[56px] ${getBadgeColor()}`}>
        <span className="text-xl font-black font-mono leading-none">{timeLeft.days}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1">Days</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[52px] ${getBadgeColor()}`}>
        <span className="text-xl font-black font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1">Hours</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[52px] ${getBadgeColor()}`}>
        <span className="text-xl font-black font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1">Mins</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[52px] ${getBadgeColor()}`}>
        <span className="text-xl font-black font-mono leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 mt-1">Secs</span>
      </div>
    </div>
  );
};
