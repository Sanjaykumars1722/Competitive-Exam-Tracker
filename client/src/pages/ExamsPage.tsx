import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { IExam } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';
import { Modal } from '../components/Modal';
import {
  GraduationCap,
  Plus,
  Calendar,
  ExternalLink,
  BookOpen,
  Trash2,
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<IExam[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'PRESET' | 'CUSTOM'>('PRESET');

  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customCategory, setCustomCategory] = useState('Engineering');
  const [customTargetDate, setCustomTargetDate] = useState('');
  const [customStages, setCustomStages] = useState('Prelims, Mains, Interview');
  const [customWebsite, setCustomWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExamsAndPresets = async () => {
    try {
      const [examsRes, presetsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/exams/presets'),
      ]);
      setExams(examsRes.data);
      setPresets(presetsRes.data);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndPresets();
  }, []);

  const handleImportPreset = async (presetCode: string) => {
    setIsSubmitting(true);
    try {
      await api.post('/exams/import-preset', { presetCode });
      setShowAddModal(false);
      fetchExamsAndPresets();
    } catch (err) {
      console.error('Failed to import preset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCode || !customTargetDate) return;

    setIsSubmitting(true);
    try {
      const stagesArr = customStages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, status: 'UPCOMING' }));

      await api.post('/exams', {
        name: customName,
        code: customCode,
        category: customCategory,
        targetDate: customTargetDate,
        stages: stagesArr.length > 0 ? stagesArr : [{ name: 'Main Exam', status: 'UPCOMING' }],
        officialWebsite: customWebsite,
        syllabus: [],
      });

      setShowAddModal(false);
      setCustomName('');
      setCustomCode('');
      setCustomTargetDate('');
      setCustomWebsite('');
      fetchExamsAndPresets();
    } catch (err) {
      console.error('Failed to create custom exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All associated syllabus items will be removed.`)) {
      return;
    }
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Failed to delete exam:', err);
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
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Competitive Exams Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track exam schedules, application dates, stages, and syllabus readiness
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Exams Added Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Start tracking by selecting from our pre-loaded competitive exams or create a custom one!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
          >
            Explore Pre-loaded Exam Presets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {exam.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700">
                      {exam.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {exam.officialWebsite && (
                      <a
                        href={exam.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        title="Official Exam Website"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteExam(exam._id, exam.name)}
                      title="Delete Exam"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                  {exam.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Target Date:{' '}
                  <span className="font-bold text-slate-700">
                    {new Date(exam.targetDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </p>

                {/* Countdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Countdown to D-Day
                  </span>
                  <CountdownTimer targetDate={exam.targetDate} size="md" />
                </div>

                {/* Exam Stages */}
                <div className="mb-5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Selection Stages
                  </span>
                  <div className="space-y-1.5">
                    {exam.stages?.map((st, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-semibold text-slate-700">{st.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            st.status === 'CLEARED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : st.status === 'ONGOING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syllabus progress summary */}
                {exam.metrics && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">Syllabus Completion</span>
                      <span className="font-black text-indigo-600 font-mono">
                        {exam.metrics.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500"
                        style={{
                          width: `${exam.metrics.totalTopics ? (exam.metrics.masteredTopics / exam.metrics.totalTopics) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="bg-indigo-500"
                        style={{
                          width: `${exam.metrics.totalTopics ? (exam.metrics.revisedTopics / exam.metrics.totalTopics) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="bg-amber-400"
                        style={{
                          width: `${exam.metrics.totalTopics ? (exam.metrics.inProgressTopics / exam.metrics.totalTopics) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{exam.metrics.totalTopics} total syllabus topics</span>
                      <span>
                        {exam.metrics.masteredTopics + exam.metrics.revisedTopics} reviewed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/syllabus"
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Syllabus & Track Topics</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Competitive Exam"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setAddMode('PRESET')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
                addMode === 'PRESET'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🌟 Pre-Loaded Exam Presets
            </button>
            <button
              onClick={() => setAddMode('CUSTOM')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
                addMode === 'CUSTOM'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ✏️ Create Custom Exam
            </button>
          </div>

          {addMode === 'PRESET' ? (
            <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-500">
                Pick a popular competitive exam. We will pre-populate the complete subject and chapter syllabus for you!
              </p>
              {presets.map((p) => {
                const alreadyAdded = exams.some((e) => e.code === p.code);
                return (
                  <div
                    key={p.code}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {p.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {p.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.syllabus?.length || 0} subjects • {p.stages?.length || 0} stages
                      </p>
                    </div>

                    <button
                      onClick={() => handleImportPreset(p.code)}
                      disabled={alreadyAdded || isSubmitting}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        alreadyAdded
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {alreadyAdded ? 'Already Added' : isSubmitting ? 'Importing...' : '1-Click Import'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreateCustomExam} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Public Service Commission"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Exam Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPSC-2025"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Civil Services">Civil Services</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Medical">Medical</option>
                    <option value="Banking/Govt">Banking/Govt</option>
                    <option value="International">International</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Exam Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={customTargetDate}
                    onChange={(e) => setCustomTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customWebsite}
                    onChange={(e) => setCustomWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Selection Stages (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stage 1 CBT, Stage 2 Written, Interview"
                  value={customStages}
                  onChange={(e) => setCustomStages(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
