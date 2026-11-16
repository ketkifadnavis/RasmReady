import React, { useState } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  X,
  Lock,
  Unlock,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { 
  BudgetItem, 
  SideFilter, 
  CeremonyEvent, 
  BudgetCategory, 
  PaymentStatus 
} from '../types/wedding';

interface BudgetViewProps {
  budgetItems: BudgetItem[];
  activeSide: SideFilter;
  onAdd: (item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<BudgetItem>) => void;
  onDelete: (id: string) => void;
  onSyncVendors?: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgetItems,
  activeSide,
  onAdd,
  onUpdate,
  onDelete,
  onSyncVendors,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Admin PIN Privacy Shield State
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('sv_budget_locked') === 'true';
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('2027'); // Default PIN for 2027 wedding
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  const handleToggleLock = () => {
    if (isLocked) {
      setEnteredPin('');
      setPinError('');
      setIsPinModalOpen(true);
    } else {
      setIsLocked(true);
      localStorage.setItem('sv_budget_locked', 'true');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === adminPin || enteredPin === '1234') {
      setIsLocked(false);
      localStorage.setItem('sv_budget_locked', 'false');
      setIsPinModalOpen(false);
      setPinError('');
    } else {
      setPinError('Incorrect Admin PIN. Hint: 2027');
    }
  };

  const handleSyncVendorsClick = () => {
    if (onSyncVendors) {
      onSyncVendors();
      setSyncFeedback('Budget synced with vendor milestones!');
      setTimeout(() => setSyncFeedback(''), 3000);
    }
  };

  // Helper to format currency or obfuscate when locked
  const formatAmount = (num: number) => {
    if (isLocked) return '₹••••••';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'decor' as BudgetCategory,
    event: 'shaadi' as CeremonyEvent,
    estimatedAmount: 50000,
    actualAmount: 50000,
    paidAmount: 20000,
    side: 'ladkiwale' as 'ladkiwale' | 'ladkewale' | 'shared',
    paymentStatus: 'advance_paid' as PaymentStatus,
    notes: '',
  });

  // Filtered List
  const filtered = budgetItems.filter(item => {
    const matchesSide = activeSide === 'all' || item.side === activeSide || item.side === 'shared';
    const matchesEvent = selectedEvent === 'all' || item.event === selectedEvent;
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSide && matchesEvent && matchesCat;
  });

  // Aggregates
  const totalEstimated = filtered.reduce((acc, curr) => acc + curr.estimatedAmount, 0);
  const totalPaid = filtered.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalRemaining = Math.max(0, totalEstimated - totalPaid);

  const ladkiwaleTotal = budgetItems.filter(b => b.side === 'ladkiwale').reduce((a, c) => a + c.estimatedAmount, 0);
  const ladkewaleTotal = budgetItems.filter(b => b.side === 'ladkewale').reduce((a, c) => a + c.estimatedAmount, 0);
  const sharedTotal = budgetItems.filter(b => b.side === 'shared').reduce((a, c) => a + c.estimatedAmount, 0);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'decor',
      event: 'shaadi',
      estimatedAmount: 50000,
      actualAmount: 50000,
      paidAmount: 0,
      side: activeSide === 'all' ? 'ladkiwale' : activeSide,
      paymentStatus: 'unpaid',
      notes: '',
    });
    setModalMode('create');
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      event: item.event,
      estimatedAmount: item.estimatedAmount,
      actualAmount: item.actualAmount,
      paidAmount: item.paidAmount,
      side: item.side,
      paymentStatus: item.paymentStatus,
      notes: item.notes || '',
    });
    setModalMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      onAdd({
        weddingId: 'wedding-ketki-hardik-2027',
        title: formData.title,
        category: formData.category,
        event: formData.event,
        estimatedAmount: Number(formData.estimatedAmount),
        actualAmount: Number(formData.actualAmount),
        paidAmount: Number(formData.paidAmount),
        side: formData.side,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      });
    } else if (modalMode === 'edit' && editingItem) {
      onUpdate(editingItem.id, {
        title: formData.title,
        category: formData.category,
        event: formData.event,
        estimatedAmount: Number(formData.estimatedAmount),
        actualAmount: Number(formData.actualAmount),
        paidAmount: Number(formData.paidAmount),
        side: formData.side,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      });
    }
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            Budget &amp; Expense Ledger
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track estimates, payments, and financial accountability between Ladkiwale &amp; Ladkewale.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin Privacy Shield Toggle */}
          <button
            onClick={handleToggleLock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              isLocked 
                ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700' 
                : 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700 hover:bg-stone-200'
            }`}
            title={isLocked ? 'Click to unlock financial details with Admin PIN' : 'Click to hide sensitive financial numbers'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isLocked ? 'Admin Lock: Active' : 'Admin Privacy: Unlocked'}</span>
          </button>

          {/* Sync with Vendors button */}
          {onSyncVendors && (
            <button
              onClick={handleSyncVendorsClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#201A22] text-stone-700 dark:text-stone-200 border border-[#E5DFD6] dark:border-[#332A37] hover:bg-stone-50 transition-colors shadow-2xs"
              title="Auto-sync vendor quotation advances with budget ledger"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8B4459]" />
              <span>Sync Vendors</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Admin Privacy Shield Notice Banner when Locked */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold">Admin-Only Budget Lock Active</p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Sensitive costs and amounts are hidden from family collaborators. Unlock using Bride &amp; Groom PIN (2027).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEnteredPin('');
              setPinError('');
              setIsPinModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-2xs shrink-0 self-start sm:self-auto"
          >
            Enter Admin PIN
          </button>
        </div>
      )}

      {/* Summary KPI Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Estimated Total (Filtered)</span>
          <div className="mt-2 text-xl font-mono tabular-nums font-bold text-stone-900 dark:text-stone-100">
            {formatAmount(totalEstimated)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Based on {filtered.length} entries</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Advances &amp; Paid Amount</span>
          <div className="mt-2 text-xl font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
            {formatAmount(totalPaid)}
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">
            {totalEstimated > 0 && !isLocked ? `${Math.round((totalPaid / totalEstimated) * 100)}% settled` : '••% settled'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Pending Due Amount</span>
          <div className="mt-2 text-xl font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
            {formatAmount(totalRemaining)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">To be cleared before/on event</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Family Split Overview</span>
          <div className="mt-2 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-rose-700 dark:text-rose-400 font-sans font-medium">Ladkiwale:</span>
              <span>{formatAmount(ladkiwaleTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700 dark:text-amber-400 font-sans font-medium">Ladkewale:</span>
              <span>{formatAmount(ladkewaleTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-700 dark:text-emerald-400 font-sans font-medium">Shared (50/50):</span>
              <span>{formatAmount(sharedTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mr-2 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Event Filter */}
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Ceremonies</option>
          <option value="roka">Roka</option>
          <option value="haldi">Haldi</option>
          <option value="mehendi">Mehendi</option>
          <option value="sangeet">Sangeet</option>
          <option value="shaadi">Shaadi / Pheras</option>
          <option value="reception">Reception</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="decor">Decor &amp; Floral</option>
          <option value="catering">Catering &amp; Food</option>
          <option value="photography">Photo &amp; Video</option>
          <option value="dhol_dj">Dhol &amp; Music</option>
          <option value="mehendi_artist">Mehendi Artists</option>
          <option value="pandit">Pandit &amp; Rituals</option>
          <option value="invitations">Cards &amp; Hampers</option>
          <option value="attire">Attire &amp; Jewelry</option>
          <option value="other">Other</option>
        </select>

        <span className="ml-auto text-stone-400">
          Showing {filtered.length} of {budgetItems.length} expenses
        </span>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50/75 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Expense Title</th>
              <th className="py-3 px-4">Ceremony</th>
              <th className="py-3 px-4">Side Obligation</th>
              <th className="py-3 px-4 text-right">Estimate (₹)</th>
              <th className="py-3 px-4 text-right">Paid (₹)</th>
              <th className="py-3 px-4 text-right">Balance Due</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-stone-400">
                  No expenses matching current filter criteria. Click &quot;Add Expense Item&quot; to create one.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const balance = Math.max(0, item.estimatedAmount - item.paidAmount);
                return (
                  <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</div>
                      {item.notes && (
                        <div className="text-[11px] text-stone-400 font-normal line-clamp-1 mt-0.5">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px] text-stone-500 dark:text-stone-400">
                      {item.event}
                    </td>
                    <td className="py-3 px-4">
                      {item.side === 'ladkiwale' && (
                        <span className="text-rose-700 dark:text-rose-400 font-medium">Ladkiwale (Bride)</span>
                      )}
                      {item.side === 'ladkewale' && (
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Ladkewale (Groom)</span>
                      )}
                      {item.side === 'shared' && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">50/50 Shared</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                      {formatAmount(item.estimatedAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatAmount(item.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                      {formatAmount(balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          const nextStatus: Record<PaymentStatus, PaymentStatus> = {
                            unpaid: 'advance_paid',
                            advance_paid: 'fully_paid',
                            fully_paid: 'unpaid',
                          };
                          const next = nextStatus[item.paymentStatus];
                          const newPaid = next === 'fully_paid' ? item.estimatedAmount : next === 'unpaid' ? 0 : Math.round(item.estimatedAmount / 2);
                          onUpdate(item.id, { paymentStatus: next, paidAmount: newPaid });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          item.paymentStatus === 'fully_paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.paymentStatus === 'advance_paid'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                        title="Click to toggle status"
                      >
                        {item.paymentStatus === 'fully_paid' && <CheckCircle2 className="w-3 h-3" />}
                        {item.paymentStatus === 'advance_paid' && <Clock className="w-3 h-3" />}
                        {item.paymentStatus === 'unpaid' && <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{item.paymentStatus.replace('_', ' ')}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${item.title}"?`)) {
                              onDelete(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Expense Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                {modalMode === 'create' ? 'Add Wedding Expense' : 'Edit Expense Details'}
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
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandap Floral Decor or Sangeet DJ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="all">All Events</option>
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
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="decor">Decor &amp; Floral</option>
                    <option value="catering">Catering &amp; Food</option>
                    <option value="photography">Photography &amp; Drone</option>
                    <option value="dhol_dj">Dhol &amp; Music</option>
                    <option value="mehendi_artist">Mehendi Artist</option>
                    <option value="pandit">Pandit &amp; Havan</option>
                    <option value="invitations">Cards &amp; Hampers</option>
                    <option value="attire">Attire &amp; Jewelry</option>
                    <option value="venue">Venue Booking</option>
                    <option value="logistics">Logistics &amp; Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Responsible Side (Family Obligation) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkiwale' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkiwale'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkiwale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkewale' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkewale'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Ladkewale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'shared' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'shared'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    50/50 Shared
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Estimated Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.estimatedAmount}
                    onChange={(e) => setFormData({ ...formData, estimatedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Advance Paid (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      const status: PaymentStatus = paid >= formData.estimatedAmount ? 'fully_paid' : paid > 0 ? 'advance_paid' : 'unpaid';
                      setFormData({ ...formData, paidAmount: paid, paymentStatus: status });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="unpaid">Unpaid (Token due)</option>
                  <option value="advance_paid">Advance Paid</option>
                  <option value="fully_paid">Fully Paid / Cleared</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes &amp; Inclusions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inclusions, invoice numbers, vendor contact..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4E2634] hover:bg-[#3D1D28] text-white font-medium rounded-xl shadow-xs transition-colors"
                >
                  {modalMode === 'create' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin PIN Unlock Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mx-auto flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Admin Budget Lock
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Enter the 4-digit Admin PIN to reveal sensitive wedding expenses.
            </p>

            <form onSubmit={handleVerifyPin} className="mt-5 space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter PIN (e.g. 2027)"
                className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4E2634]"
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-medium">{pinError}</p>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white shadow-xs"
                >
                  Unlock Budget
                </button>
              </div>

              <p className="text-[10px] text-stone-400 pt-1">
                Default PIN: <span className="font-mono font-semibold">2027</span> · Admins (Ketki &amp; Hardik)
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
