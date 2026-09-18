import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { IMockTest, IMockAnalytics, IExam } from '../types';
import { Modal } from '../components/Modal';
import {
  BarChart3,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  AlertCircle,
  Target,
} from 'lucide-react';

export const MockTestsPage: React.FC = () => {
  const [tests, setTests] = useState<IMockTest[]>([]);
  const [analytics, setAnalytics] = useState<IMockAnalytics | null>(null);
  const [exams, setExams] = useState<IExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [examName, setExamName] = useState('General Mock Test');
  const [testName, setTestName] = useState('');
  const [testSeries, setTestSeries] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(200);
  const [scoredMarks, setScoredMarks] = useState<number>(120);
  const [accuracyPercentage, setAccuracyPercentage] = useState<number>(80);
  const [percentile, setPercentile] = useState<string>('');
  const [strongTopics, setStrongTopics] = useState('');
  const [weakTopics, setWeakTopics] = useState('');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMockData = async () => {
    try {
      const params: any = {};
      if (selectedExamId) params.examId = selectedExamId;

      const [testsRes, analyticsRes, examsRes] = await Promise.all([
        api.get('/mock-tests', { params }),
        api.get('/mock-tests/analytics', { params }),
        api.get('/exams'),
      ]);

      setTests(testsRes.data);
      setAnalytics(analyticsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMockData();
  }, [selectedExamId]);

  const handleCreateMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/mock-tests', {
        examName,
        testName: testName.trim(),
        testSeries: testSeries.trim() || 'Self Practice',
        totalMarks: Number(totalMarks),
        scoredMarks: Number(scoredMarks),
        accuracyPercentage: Number(accuracyPercentage),
        percentile: percentile ? Number(percentile) : undefined,
        strongTopics: strongTopics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        weakTopics: weakTopics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        analysisNotes: analysisNotes.trim(),
        date: new Date(),
      });

      setShowAddModal(false);
      setTestName('');
      setTestSeries('');
      setStrongTopics('');
      setWeakTopics('');
      setAnalysisNotes('');
      setPercentile('');
      fetchMockData();
    } catch (err) {
      console.error('Failed to log mock test:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this mock test report?')) return;
    try {
      await api.delete(`/mock-tests/${id}`);
      fetchMockData();
    } catch (err) {
      console.error('Failed to delete mock test:', err);
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
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Mock Test Performance & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze score trends, accuracy % trajectories, percentile ranks, and negative-marking weak areas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
          >
            <option value="">All Exams</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mock Score</span>
          </button>
        </div>
      </div>

      {/* Analytics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Mocks
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {analytics?.totalTests || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Logged attempts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Score %
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {analytics?.averageScorePercentage || 0}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Mean percentage achieved</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Accuracy
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {analytics?.averageAccuracy || 0}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Question strike rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Percentile
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {analytics?.averagePercentile ? `${analytics.averagePercentile}%ile` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">All-India test series rank</p>
        </div>
      </div>

      {/* Score Progression Trend Chart */}
      {analytics && analytics.trend && analytics.trend.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Score & Accuracy Progression</h3>
              <p className="text-xs text-slate-500">Test-by-test performance trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                Score %
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                Accuracy %
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 border-b border-slate-100">
            {analytics.trend.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="flex flex-col items-center gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold font-mono text-indigo-600">
                    {point.scorePercentage}%
                  </span>
                  <span className="text-[9px] font-bold font-mono text-emerald-600">
                    {point.accuracyPercentage}% Acc
                  </span>
                </div>

                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  <div
                    className="w-1/2 max-w-[28px] bg-indigo-600 rounded-t-lg transition-all duration-500 hover:bg-indigo-500"
                    style={{ height: `${Math.max(10, point.scorePercentage)}%` }}
                    title={`Score: ${point.scorePercentage}%`}
                  />
                  <div
                    className="w-1/2 max-w-[28px] bg-emerald-500 rounded-t-lg transition-all duration-500 hover:bg-emerald-400"
                    style={{ height: `${Math.max(10, point.accuracyPercentage)}%` }}
                    title={`Accuracy: ${point.accuracyPercentage}%`}
                  />
                </div>

                <span className="text-[11px] font-bold text-slate-600 mt-2 truncate max-w-[80px] text-center">
                  {point.testName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{point.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Areas & Attempts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900">Recurring Weak Areas</h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Topics where you lost marks in tests. Dedicate revision sessions to these:
          </p>

          <div className="space-y-2">
            {analytics?.frequentWeakTopics && analytics.frequentWeakTopics.length > 0 ? (
              analytics.frequentWeakTopics.map((wt, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-rose-900">{wt.topic}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {wt.count} mistake{wt.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No weak topics logged yet.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Logged Mock Test Reports</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No mock tests logged yet. Log your scores to track performance trends!
              </div>
            ) : (
              tests.map((test) => {
                const scorePct = Math.round((test.scoredMarks / test.totalMarks) * 100);

                return (
                  <div
                    key={test._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{test.testName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {test.testSeries}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {test.examName} •{' '}
                        {new Date(test.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {test.analysisNotes && (
                        <p className="text-[11px] text-slate-500 italic">
                          "{test.analysisNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right font-mono">
                        <span className="text-sm font-black text-slate-900">
                          {test.scoredMarks} / {test.totalMarks}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1.5">
                          <span className="text-indigo-600 font-bold">{scorePct}%</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{test.accuracyPercentage}% Acc</span>
                          {test.percentile && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600 font-bold">{test.percentile}%ile</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(test._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log Mock Test Result"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMockTest} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Exam
            </label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="General Mock Test">General Mock Test</option>
              {exams.map((e) => (
                <option key={e._id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Test Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Length Mock 04"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Test Series / Coaching
              </label>
              <input
                type="text"
                placeholder="e.g. VisionIAS, Allen, IMS"
                value={testSeries}
                onChange={(e) => setTestSeries(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                required
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scored Marks *
              </label>
              <input
                type="number"
                required
                step="0.5"
                value={scoredMarks}
                onChange={(e) => setScoredMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Accuracy % *
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={accuracyPercentage}
                onChange={(e) => setAccuracyPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Percentile Rank (Optional)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 96.4"
              value={percentile}
              onChange={(e) => setPercentile(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Strong Topics (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Indian Polity, Binary Trees, Kinematics"
              value={strongTopics}
              onChange={(e) => setStrongTopics(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Weak Topics / Negative Marks (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Modern Indian Art, Graph Algorithms"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Self-Reflection & Analysis Notes
            </label>
            <textarea
              rows={2}
              placeholder="Time management, silly mistakes made, action items..."
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Mock Test'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
