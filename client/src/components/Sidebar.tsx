import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  CheckSquare,
  CalendarDays,
  BookOpen,
  BarChart3,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Exams', path: '/exams', icon: GraduationCap },
    { label: 'Syllabus Tracker', path: '/syllabus', icon: CheckSquare },
    { label: 'Study Planner & Timer', path: '/planner', icon: CalendarDays },
    { label: 'Study Materials & PYQs', path: '/materials', icon: BookOpen },
    { label: 'Mock Test Analytics', path: '/mock-tests', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 hidden md:flex">
      <div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Target Goal Progress Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Daily Prep Target
          </span>
        </div>
        <p className="text-xs text-indigo-800 leading-relaxed mb-3">
          Your goal: <span className="font-extrabold">{user?.dailyStudyGoalHours || 4} hours/day</span>
        </p>
        <NavLink
          to="/planner"
          className="block text-center py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
        >
          Open Pomodoro Timer
        </NavLink>
      </div>
    </aside>
  );
};
