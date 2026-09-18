import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Flame,
  Clock,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { Modal } from './Modal';
import { PomodoroWidget } from './PomodoroWidget';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, triggerReminders, clearAll } =
    useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'DEADLINE':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'REVISION':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'STREAK':
        return <Flame className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Competitive Exam Tracker
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md uppercase tracking-wider">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-500 hidden md:block">Master Schedules, Syllabus & Mock Analytics</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          title="Daily Study Streak"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold shadow-xs"
        >
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>{user?.streakCount || 1}d streak</span>
        </div>

        <button
          onClick={() => setShowPomodoroModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition-all"
        >
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Focus Timer</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm shadow-rose-500/50 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                  <p className="text-xs text-slate-500">{unreadCount} unread updates</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={triggerReminders}
                    title="Run smart reminder checks"
                    className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No notifications right now. You're all caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        n.isRead ? 'bg-white hover:bg-slate-50/60 opacity-80' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                      }`}
                    >
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 mt-0.5">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Goal: {user?.dailyStudyGoalHours || 4}h/day</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="px-3 py-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Target:</span>{' '}
                {user?.targetExams?.join(', ') || 'General Competitive Exams'}
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPomodoroModal}
        onClose={() => setShowPomodoroModal(false)}
        title="Focus Pomodoro Timer"
        maxWidth="md"
      >
        <PomodoroWidget
          onSessionLogged={() => {
            setShowPomodoroModal(false);
          }}
        />
      </Modal>
    </header>
  );
};
