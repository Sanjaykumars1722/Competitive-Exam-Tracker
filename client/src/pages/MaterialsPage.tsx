import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { IStudyMaterial, IExam, MaterialCategory } from '../types';
import { Modal } from '../components/Modal';
import {
  BookOpen,
  Search,
  Plus,
  Star,
  ExternalLink,
  Trash2,
  FolderOpen,
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<IStudyMaterial[]>([]);
  const [exams, setExams] = useState<IExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [examName, setExamName] = useState('General Prep');
  const [category, setCategory] = useState<MaterialCategory>('NOTES');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      const params: any = {};
      if (selectedExamId) params.examId = selectedExamId;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (favoriteOnly) params.favoriteOnly = 'true';

      const [matRes, examsRes] = await Promise.all([
        api.get('/materials', { params }),
        api.get('/exams'),
      ]);

      setMaterials(matRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedExamId, selectedCategory, searchQuery, favoriteOnly]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.patch(`/materials/${id}/favorite`);
      setMaterials((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (id: string, matTitle: string) => {
    if (!window.confirm(`Delete "${matTitle}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/materials', {
        title: title.trim(),
        subject: subject.trim(),
        examName,
        category,
        url: url.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isFavorite,
        notes: notes.trim(),
      });

      setShowAddModal(false);
      setTitle('');
      setSubject('');
      setUrl('');
      setTags('');
      setNotes('');
      setIsFavorite(false);
      fetchMaterials();
    } catch (err) {
      console.error('Failed to add material:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: MaterialCategory) => {
    switch (cat) {
      case 'PYQ':
        return { label: 'PYQ Question Paper', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'NOTES':
        return { label: 'Revision Notes', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'FORMULA_SHEET':
        return { label: 'Formula Sheet', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'VIDEO':
        return { label: 'Video Lecture', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'EBOOK':
        return { label: 'Standard E-Book', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'MOCK_PAPER':
      default:
        return { label: 'Mock Test Paper', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
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
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Study Materials & PYQ Repository
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Curated archive of previous year questions, high-yield notes, and video lectures
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Resource</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, subject, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
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
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                favoriteOnly
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Resources' },
            { id: 'PYQ', label: 'Previous Year Papers' },
            { id: 'NOTES', label: 'Notes & Mindmaps' },
            { id: 'FORMULA_SHEET', label: 'Formula Sheets' },
            { id: 'VIDEO', label: 'Video Playlists' },
            { id: 'EBOOK', label: 'E-Books & PDFs' },
            { id: 'MOCK_PAPER', label: 'Mock Papers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-md mx-auto">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Resources Found</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search query or add a new study material to this archive.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Add New Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((item) => {
            const badge = getCategoryBadge(item.category);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(item._id)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition"
                      title={item.isFavorite ? 'Unstar' : 'Star as favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-slate-700">{item.subject}</span> •{' '}
                    <span>{item.examName}</span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-100 italic mb-3 line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}

                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Study Resource / Material"
        maxWidth="md"
      >
        <form onSubmit={handleAddMaterial} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UPSC CSE 2024 Prelims GS-1 Question Paper with Key"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Indian History"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="PYQ">PYQ Question Paper</option>
                <option value="NOTES">Revision Notes</option>
                <option value="FORMULA_SHEET">Formula Sheet</option>
                <option value="VIDEO">Video Lecture / Playlist</option>
                <option value="EBOOK">E-Book / PDF</option>
                <option value="MOCK_PAPER">Mock Test Paper</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Exam
            </label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="General Prep">General Prep</option>
              {exams.map((e) => (
                <option key={e._id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Link / URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/... or https://youtube.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="PYQ, HighYield, Revision"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Insights / Revision Notes
            </label>
            <textarea
              rows={2}
              placeholder="Tips, specific chapters, or formulas to check..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fav-check"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="fav-check" className="text-xs font-semibold text-slate-700">
              Star as high-priority favorite ⭐
            </label>
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
              {isSubmitting ? 'Saving...' : 'Add Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
