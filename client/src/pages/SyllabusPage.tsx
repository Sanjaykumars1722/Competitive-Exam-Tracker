import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { IExam, TopicStatus } from '../types';
import { TopicStatusBadge } from '../components/TopicStatusBadge';
import { Modal } from '../components/Modal';
import {
  CheckSquare,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const SyllabusPage: React.FC = () => {
  const [exams, setExams] = useState<IExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<IExam | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [collapsedSubjects, setCollapsedSubjects] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newChapterName, setNewChapterName] = useState('');

  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicPriority, setNewTopicPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTopicNotes, setNewTopicNotes] = useState('');

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
      if (res.data.length > 0 && !selectedExamId) {
        setSelectedExamId(res.data[0]._id);
        setSelectedExam(res.data[0]);
      } else if (selectedExamId) {
        const current = res.data.find((e: IExam) => e._id === selectedExamId);
        if (current) setSelectedExam(current);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSelectExam = (id: string) => {
    setSelectedExamId(id);
    const found = exams.find((e) => e._id === id);
    if (found) setSelectedExam(found);
  };

  const toggleSubjectCollapse = (subjectId: string) => {
    setCollapsedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const handleCycleStatus = async (topicId: string, currentStatus: TopicStatus) => {
    if (!selectedExam) return;

    const sequence: TopicStatus[] = [
      'NOT_STARTED',
      'IN_PROGRESS',
      'REVISED_1X',
      'REVISED_2X',
      'MASTERED',
    ];

    const nextIndex = (sequence.indexOf(currentStatus) + 1) % sequence.length;
    const nextStatus = sequence[nextIndex];

    try {
      const res = await api.patch(`/exams/${selectedExam._id}/topics/${topicId}`, {
        status: nextStatus,
      });

      const updatedExam = res.data.exam;
      const updatedMetrics = res.data.metrics;
      const fullUpdated = { ...updatedExam, metrics: updatedMetrics };

      setSelectedExam(fullUpdated);
      setExams((prev) => prev.map((e) => (e._id === fullUpdated._id ? fullUpdated : e)));
    } catch (err) {
      console.error('Failed to update topic status:', err);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedExam) return;

    try {
      const res = await api.post(`/exams/${selectedExam._id}/subjects`, {
        name: newSubjectName.trim(),
      });
      setSelectedExam(res.data);
      setNewSubjectName('');
      setShowAddSubjectModal(false);
      fetchExams();
    } catch (err) {
      console.error('Failed to add subject:', err);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim() || !selectedExam || !selectedSubjectId) return;

    try {
      const res = await api.post(
        `/exams/${selectedExam._id}/subjects/${selectedSubjectId}/chapters`,
        { name: newChapterName.trim() }
      );
      setSelectedExam(res.data);
      setNewChapterName('');
      setShowAddChapterModal(false);
      fetchExams();
    } catch (err) {
      console.error('Failed to add chapter:', err);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedExam || !selectedChapterId) return;

    try {
      const res = await api.post(
        `/exams/${selectedExam._id}/chapters/${selectedChapterId}/topics`,
        {
          name: newTopicName.trim(),
          priority: newTopicPriority,
          notes: newTopicNotes.trim(),
        }
      );
      setSelectedExam(res.data);
      setNewTopicName('');
      setNewTopicNotes('');
      setShowAddTopicModal(false);
      fetchExams();
    } catch (err) {
      console.error('Failed to add topic:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Please add an exam first to track syllabus topics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-600" />
            Syllabus & Topic Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track micro-topics, revision rounds, and priority areas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => handleSelectExam(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name} ({ex.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Progress Card */}
      {selectedExam && selectedExam.metrics && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {selectedExam.name}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Syllabus Readiness: {selectedExam.metrics.completionPercentage}%
              </h3>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-bold text-slate-800 font-mono">
                {selectedExam.metrics.masteredTopics + selectedExam.metrics.revisedTopics} of{' '}
                {selectedExam.metrics.totalTopics}
              </span>{' '}
              topics revised or mastered
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{
                width: `${selectedExam.metrics.totalTopics ? (selectedExam.metrics.masteredTopics / selectedExam.metrics.totalTopics) * 100 : 0}%`,
              }}
              title="Mastered"
            />
            <div
              className="bg-indigo-500 transition-all duration-500"
              style={{
                width: `${selectedExam.metrics.totalTopics ? (selectedExam.metrics.revisedTopics / selectedExam.metrics.totalTopics) * 100 : 0}%`,
              }}
              title="Revised"
            />
            <div
              className="bg-amber-400 transition-all duration-500"
              style={{
                width: `${selectedExam.metrics.totalTopics ? (selectedExam.metrics.inProgressTopics / selectedExam.metrics.totalTopics) * 100 : 0}%`,
              }}
              title="In Progress"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Mastered ({selectedExam.metrics.masteredTopics})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Revised ({selectedExam.metrics.revisedTopics})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              In Progress ({selectedExam.metrics.inProgressTopics})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              Not Started ({selectedExam.metrics.notStartedTopics})
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search topic or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'REVISED_1X', 'MASTERED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {filter === 'ALL'
                ? 'All Topics'
                : filter === 'NOT_STARTED'
                ? 'Not Started'
                : filter === 'IN_PROGRESS'
                ? 'In Progress'
                : filter === 'REVISED_1X'
                ? 'Revised'
                : 'Mastered'}
            </button>
          ))}
        </div>
      </div>

      {/* Syllabus Tree */}
      <div className="space-y-4">
        {selectedExam?.syllabus?.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80">
            <p className="text-slate-500 text-xs mb-3">No subjects created for this exam yet.</p>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          selectedExam?.syllabus?.map((subject) => {
            const isCollapsed = collapsedSubjects[subject.id];

            const filteredChapters = subject.chapters
              .map((chap) => {
                const topics = chap.topics.filter((t) => {
                  const matchesSearch =
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchesStatus =
                    statusFilter === 'ALL' ||
                    (statusFilter === 'REVISED_1X'
                      ? t.status.startsWith('REVISED')
                      : t.status === statusFilter);
                  return matchesSearch && matchesStatus;
                });
                return { ...chap, topics };
              })
              .filter((chap) => chap.topics.length > 0 || !searchQuery);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
              >
                <div
                  onClick={() => toggleSubjectCollapse(subject.id)}
                  className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/70 border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <button className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500">
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{subject.name}</h4>
                      <p className="text-xs text-slate-500">
                        {subject.chapters.length} Chapters •{' '}
                        {subject.chapters.reduce((acc, c) => acc + c.topics.length, 0)} Topics
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubjectId(subject.id);
                        setShowAddChapterModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Chapter</span>
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 space-y-4">
                    {filteredChapters.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No chapters or topics matching current search filter.
                      </p>
                    ) : (
                      filteredChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              {chapter.name}
                              <span className="text-xs font-normal text-slate-400">
                                ({chapter.topics.length} topics)
                              </span>
                            </h5>

                            <button
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                setShowAddTopicModal(true);
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Topic
                            </button>
                          </div>

                          <div className="space-y-2">
                            {chapter.topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs hover:border-slate-300 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">
                                      {topic.name}
                                    </span>
                                    <span
                                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                        topic.priority === 'HIGH'
                                          ? 'bg-rose-50 text-rose-700'
                                          : topic.priority === 'MEDIUM'
                                          ? 'bg-amber-50 text-amber-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {topic.priority}
                                    </span>
                                  </div>
                                  {topic.notes && (
                                    <p className="text-[11px] text-slate-500 italic">
                                      "{topic.notes}"
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-center">
                                  {topic.lastRevised && (
                                    <span className="text-[10px] text-slate-400">
                                      Revised {new Date(topic.lastRevised).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                  <TopicStatusBadge
                                    status={topic.status}
                                    interactive={true}
                                    onClick={() => handleCycleStatus(topic.id, topic.status)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Subject */}
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title="Add Subject to Exam"
        maxWidth="sm"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Indian History, Organic Chemistry"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddSubjectModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Chapter */}
      <Modal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        title="Add Chapter to Subject"
        maxWidth="sm"
      >
        <form onSubmit={handleAddChapter} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Chapter Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Plate Tectonics, Binary Trees"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddChapterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Save Chapter
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Topic */}
      <Modal
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        title="Add Syllabus Topic"
        maxWidth="md"
      >
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dijkstra Algorithm & Min-Heap implementation"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Exam Priority / Yield
            </label>
            <select
              value={newTopicPriority}
              onChange={(e) => setNewTopicPriority(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="HIGH">High Yield (Frequent in PYQs)</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Key Formulas to Remember
            </label>
            <textarea
              rows={2}
              placeholder="Important caveats, book page number, or formulas..."
              value={newTopicNotes}
              onChange={(e) => setNewTopicNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTopicModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
