import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  Calendar, 
  Phone, 
  Edit3, 
  Trash2, 
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRightCircle
} from 'lucide-react';
import { 
  TaskItem, 
  SideFilter, 
  CeremonyEvent, 
  TaskStatus, 
  TaskPriority 
} from '../types/wedding';

interface TasksViewProps {
  tasks: TaskItem[];
  activeSide: SideFilter;
  onAdd: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<TaskItem>) => void;
  onDelete: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  activeSide,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState<'everyone' | 'ladkiwale' | 'ladkewale' | 'shared' | 'urgent'>('everyone');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event: 'shaadi' as CeremonyEvent,
    status: 'not_started' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignedSide: 'ladkiwale' as 'ladkiwale' | 'ladkewale' | 'shared',
    assignedToName: '',
    assignedFamilyRole: 'Mama Ji (Bride Maternal Uncle)',
    assignedToPhone: '',
    dueDate: '2026-12-18',
  });

  const familyRolePresets = [
    'Mama Ji (Bride Maternal Uncle)',
    'Chacha Ji (Paternal Uncle)',
    'Tau Ji / Bade Papa',
    'Bhabhi (Sister-in-Law)',
    'Maasi Ji (Maternal Aunt)',
    'Bua Ji (Paternal Aunt)',
    'Bridesmaid / Sister',
    'Groomsman / Brother',
    'Cousin Gang',
    'Parents',
    'Wedding Coordinator',
    'Other Family Member'
  ];

  // Helper to normalize legacy status
  const normalizeStatus = (status: TaskStatus): 'not_started' | 'in_progress' | 'blocked' | 'done' => {
    if (status === 'todo') return 'not_started';
    if (status === 'completed') return 'done';
    if (status === 'in_progress' || status === 'blocked' || status === 'done' || status === 'not_started') {
      return status;
    }
    return 'not_started';
  };

  // Filter tasks based on global side filter, local view dropdown, and search query
  const filteredTasks = tasks.filter(task => {
    // Global Header Side check
    if (activeSide !== 'all') {
      if (task.assignedSide !== activeSide && task.assignedSide !== 'shared') {
        return false;
      }
    }

    // Local dropdown filter
    if (filterView === 'ladkiwale' && task.assignedSide !== 'ladkiwale') return false;
    if (filterView === 'ladkewale' && task.assignedSide !== 'ladkewale') return false;
    if (filterView === 'shared' && task.assignedSide !== 'shared') return false;
    if (filterView === 'urgent' && task.priority !== 'urgent') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchAssignee = task.assignedToName.toLowerCase().includes(q);
      const matchRole = (task.assignedFamilyRole || '').toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      return matchTitle || matchAssignee || matchRole || matchDesc;
    }

    return true;
  });

  // Buckets
  const columns: Array<{
    key: 'not_started' | 'in_progress' | 'blocked' | 'done';
    label: string;
    dotColor: string;
    textColor: string;
  }> = [
    {
      key: 'not_started',
      label: 'Not started',
      dotColor: 'bg-[#9B948E]',
      textColor: 'text-stone-700 dark:text-stone-300',
    },
    {
      key: 'in_progress',
      label: 'In progress',
      dotColor: 'bg-[#C28E3A]',
      textColor: 'text-stone-700 dark:text-stone-300',
    },
    {
      key: 'blocked',
      label: 'Blocked',
      dotColor: 'bg-[#C26D6D]',
      textColor: 'text-stone-700 dark:text-stone-300',
    },
    {
      key: 'done',
      label: 'Done',
      dotColor: 'bg-[#5F8D69]',
      textColor: 'text-stone-700 dark:text-stone-300',
    },
  ];

  const openCreateModal = (defaultStatus: TaskStatus = 'not_started') => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      event: 'shaadi',
      status: defaultStatus,
      priority: 'medium',
      assignedSide: activeSide === 'all' ? 'ladkiwale' : activeSide,
      assignedToName: '',
      assignedFamilyRole: 'Mama Ji (Bride Maternal Uncle)',
      assignedToPhone: '',
      dueDate: '2026-12-18',
    });
    setModalMode('create');
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      event: task.event,
      status: normalizeStatus(task.status),
      priority: task.priority,
      assignedSide: task.assignedSide,
      assignedToName: task.assignedToName,
      assignedFamilyRole: task.assignedFamilyRole || 'Family Member',
      assignedToPhone: task.assignedToPhone || '',
      dueDate: task.dueDate,
    });
    setModalMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      onAdd({
        weddingId: 'wedding-ketki-hardik-2027',
        title: formData.title,
        description: formData.description,
        event: formData.event,
        status: formData.status,
        priority: formData.priority,
        assignedSide: formData.assignedSide,
        assignedToName: formData.assignedToName,
        assignedFamilyRole: formData.assignedFamilyRole,
        assignedToPhone: formData.assignedToPhone,
        dueDate: formData.dueDate,
      });
    } else if (modalMode === 'edit' && editingTask) {
      onUpdate(editingTask.id, {
        title: formData.title,
        description: formData.description,
        event: formData.event,
        status: formData.status,
        priority: formData.priority,
        assignedSide: formData.assignedSide,
        assignedToName: formData.assignedToName,
        assignedFamilyRole: formData.assignedFamilyRole,
        assignedToPhone: formData.assignedToPhone,
        dueDate: formData.dueDate,
      });
    }
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header matching user screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#38232B] dark:text-[#F7EFEA]">
            Tasks
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#7D6D69] dark:text-[#B3A6A2]">
            Many hands. One beautiful celebration.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('not_started')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add task</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Find a task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1C181E] border border-[#E7DFD5] dark:border-[#2D2833] rounded-2xl text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8E5D6A] transition-all shadow-2xs"
          />
        </div>

        {/* View Filter Dropdown */}
        <div className="relative shrink-0">
          <select
            value={filterView}
            onChange={(e) => setFilterView(e.target.value as any)}
            className="appearance-none px-4 py-2.5 pr-10 text-sm bg-white dark:bg-[#1C181E] border border-[#E7DFD5] dark:border-[#2D2833] rounded-2xl text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#8E5D6A] cursor-pointer shadow-2xs font-medium"
          >
            <option value="everyone">Everyone&apos;s tasks</option>
            <option value="ladkiwale">Ladkiwale (Bride&apos;s side)</option>
            <option value="ladkewale">Ladkewale (Groom&apos;s side)</option>
            <option value="shared">Joint &amp; Shared</option>
            <option value="urgent">Urgent priority only</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* 4-Column Board matching user screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => normalizeStatus(t.status) === col.key);
          return (
            <div
              key={col.key}
              className="rounded-2xl bg-[#EFECE6] dark:bg-[#201C22] p-3.5 min-h-[480px] flex flex-col justify-between transition-colors border border-stone-200/50 dark:border-stone-800/40"
            >
              {/* Column Header */}
              <div>
                <div className="flex items-center justify-between px-1 py-1 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                    <span className={`text-xs font-semibold ${col.textColor}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400 font-medium">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    /* Dashed breathing room box matching user screenshot */
                    <div 
                      onClick={() => openCreateModal(col.key)}
                      className="border border-dashed border-stone-300 dark:border-stone-700/80 rounded-xl p-6 text-center cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                      title="Click to add a task here"
                    >
                      <p className="text-xs text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors">
                        A little breathing room.
                      </p>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const cleanPhone = (task.assignedToPhone || '').replace(/[^0-9]/g, '');
                      return (
                        <div
                          key={task.id}
                          className="group relative rounded-xl bg-white dark:bg-[#28242A] p-4 border border-[#E8E2D8] dark:border-[#38323C] shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                        >
                          {/* Card Header & Title */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#38232B] dark:text-[#F5EDE8] leading-snug">
                              {task.title}
                            </h3>

                            {/* Actions Dropdown / Quick Tools */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete "${task.title}"?`)) {
                                    onDelete(task.id);
                                  }
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Description if present */}
                          {task.description && (
                            <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Cutesy Soft Tags: Side & Ceremony */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {/* Side Pill */}
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              task.assignedSide === 'ladkiwale'
                                ? 'bg-[#F9ECEF] text-[#9A3B56] dark:bg-[#3D1E27] dark:text-[#EFA4B8]'
                                : task.assignedSide === 'ladkewale'
                                ? 'bg-[#F9F2E7] text-[#9E6523] dark:bg-[#382815] dark:text-[#F3CA8A]'
                                : 'bg-[#EBF3ED] text-[#41764E] dark:bg-[#1D3023] dark:text-[#9DD2AA]'
                            }`}>
                              {task.assignedSide === 'ladkiwale' ? 'Ladkiwale' : task.assignedSide === 'ladkewale' ? 'Ladkewale' : 'Joint Duty'}
                            </span>

                            {/* Ceremony tag */}
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                              {task.event}
                            </span>

                            {/* Priority tag if urgent */}
                            {task.priority === 'urgent' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> Urgent
                              </span>
                            )}
                          </div>

                          {/* Assignee & Family Role */}
                          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <span className="w-5 h-5 rounded-full bg-[#EAE2D8] dark:bg-[#3D3742] text-[10px] font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0">
                                {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : 'U'}
                              </span>
                              <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                                {task.assignedToName || 'Unassigned'}
                              </span>
                              {task.assignedFamilyRole && (
                                <span className="text-[10px] text-stone-400 truncate">
                                  ({task.assignedFamilyRole.split('(')[0].trim()})
                                </span>
                              )}
                            </div>

                            {/* Quick WhatsApp Reminder */}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(task.assignedToName)},%20gentle%20reminder%20for%20wedding%20preparation:%20${encodeURIComponent(task.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                                title="Send WhatsApp reminder"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Status Mover Ribbon */}
                          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              {task.dueDate}
                            </span>

                            {/* Move state buttons */}
                            <div className="flex items-center gap-1">
                              {col.key !== 'not_started' && (
                                <button
                                  onClick={() => onUpdate(task.id, { status: 'not_started' })}
                                  className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline"
                                  title="Move to Not Started"
                                >
                                  Restart
                                </button>
                              )}
                              {col.key !== 'in_progress' && (
                                <button
                                  onClick={() => onUpdate(task.id, { status: 'in_progress' })}
                                  className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline ml-1"
                                  title="Move to In Progress"
                                >
                                  In Progress
                                </button>
                              )}
                              {col.key !== 'blocked' && (
                                <button
                                  onClick={() => onUpdate(task.id, { status: 'blocked' })}
                                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline ml-1"
                                  title="Mark as Blocked"
                                >
                                  Block
                                </button>
                              )}
                              {col.key !== 'done' && (
                                <button
                                  onClick={() => onUpdate(task.id, { status: 'done' })}
                                  className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline ml-1"
                                  title="Mark as Done"
                                >
                                  Done ✓
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Add at bottom of column */}
              <button
                onClick={() => openCreateModal(col.key)}
                className="mt-3 w-full py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors flex items-center justify-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer matching screenshot note */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7D6D69] dark:text-[#A89A96] gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🪷</span>
          <span className="font-serif italic font-medium">Har taiyaari, apno ke saath.</span>
        </div>
        <div className="text-[11px] text-stone-400 dark:text-stone-500">
          Shared with your wedding members
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#1D1920] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-[#38232B] dark:text-[#F5EDE8]">
                {modalMode === 'create' ? 'Create a Wedding Task' : 'Edit Task Details'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Receive Baraat at Gate or Safeguard Groom's Shoes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any ritual details, contact numbers, or reminders..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#4E2634]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Ceremony *
                  </label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value as CeremonyEvent })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="general">General Logistics</option>
                    <option value="roka">Roka</option>
                    <option value="haldi">Haldi</option>
                    <option value="mehendi">Mehendi</option>
                    <option value="sangeet">Sangeet</option>
                    <option value="shaadi">Shaadi / Pheras</option>
                    <option value="reception">Reception</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Column / Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Responsible Family Side *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedSide: 'ladkiwale' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      formData.assignedSide === 'ladkiwale'
                        ? 'border-[#9A3B56] bg-[#F9ECEF] text-[#9A3B56] dark:bg-[#3D1E27] dark:text-[#EFA4B8]'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkiwale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedSide: 'ladkewale' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      formData.assignedSide === 'ladkewale'
                        ? 'border-[#9E6523] bg-[#F9F2E7] text-[#9E6523] dark:bg-[#382815] dark:text-[#F3CA8A]'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkewale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedSide: 'shared' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      formData.assignedSide === 'shared'
                        ? 'border-[#41764E] bg-[#EBF3ED] text-[#41764E] dark:bg-[#1D3023] dark:text-[#9DD2AA]'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Joint / Shared
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Assignee Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Mama or Neha"
                    value={formData.assignedToName}
                    onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Family Relationship Role
                  </label>
                  <select
                    value={formData.assignedFamilyRole}
                    onChange={(e) => setFormData({ ...formData, assignedFamilyRole: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    {familyRolePresets.map((role, idx) => (
                      <option key={idx} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Assignee Phone (for WhatsApp)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={formData.assignedToPhone}
                    onChange={(e) => setFormData({ ...formData, assignedToPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4E2634] hover:bg-[#3D1D28] text-white font-medium rounded-xl shadow-xs transition-colors"
                >
                  {modalMode === 'create' ? 'Add Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
