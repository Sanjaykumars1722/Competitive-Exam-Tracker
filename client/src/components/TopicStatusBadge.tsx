import React from 'react';
import { TopicStatus } from '../types';
import { CheckCircle2, Circle, Clock, RotateCcw, Award } from 'lucide-react';

interface TopicStatusBadgeProps {
  status: TopicStatus;
  onClick?: () => void;
  interactive?: boolean;
}

export const TopicStatusBadge: React.FC<TopicStatusBadgeProps> = ({
  status,
  onClick,
  interactive = false,
}) => {
  const getStatusConfig = (st: TopicStatus) => {
    switch (st) {
      case 'MASTERED':
        return {
          label: 'Mastered',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          icon: <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
        };
      case 'REVISED_3X':
        return {
          label: 'Revised 3x',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
        };
      case 'REVISED_2X':
        return {
          label: 'Revised 2x',
          color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          icon: <RotateCcw className="w-3.5 h-3.5 mr-1 text-blue-600" />,
        };
      case 'REVISED_1X':
        return {
          label: 'Revised 1x',
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
          icon: <RotateCcw className="w-3.5 h-3.5 mr-1 text-cyan-600" />,
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          icon: <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />,
        };
      case 'NOT_STARTED':
      default:
        return {
          label: 'Not Started',
          color: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
          icon: <Circle className="w-3.5 h-3.5 mr-1 text-slate-400" />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      title={interactive ? 'Click to advance status' : undefined}
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
        config.color
      } ${interactive ? 'cursor-pointer active:scale-95 shadow-sm' : 'cursor-default'}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
};
