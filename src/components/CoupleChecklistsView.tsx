import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Sparkles, 
  Heart, 
  User, 
  Shirt, 
  Gem, 
  Briefcase, 
  CheckCircle2, 
  Circle,
  X,
  Filter
} from 'lucide-react';
import { ChecklistItem, CeremonyEvent } from '../types/wedding';

interface CoupleChecklistsViewProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<ChecklistItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export const CoupleChecklistsView: React.FC<CoupleChecklistsViewProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
}) => {
  const [activeTarget, setActiveTarget] = useState<'both' | 'bride' | 'groom'>('both');
  const [activeGrouping, setActiveGrouping] = useState<'category' | 'event'>('category');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItem['category']>('outfits');
  const [newItemEvent, setNewItemEvent] = useState<CeremonyEvent>('shaadi');
  const [newItemTarget, setNewItemTarget] = useState<'bride' | 'groom' | 'both'>('bride');

  const categories: Array<{
    id: ChecklistItem['category'];
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    applicableTo: Array<'bride' | 'groom' | 'both'>;
  }> = [
    {
      id: 'outfits',
      title: 'Bridal Outfits',
      description: 'Haldi, Mehendi, Sangeet, Shaadi & Reception ensembles',
      icon: Shirt,
      applicableTo: ['bride', 'both'],
    },
    {
      id: 'jewellery',
      title: 'Jewellery & Accessories',
      description: 'Polki haar, mathapatti, floral jewelry, kaleere & nath',
      icon: Gem,
      applicableTo: ['bride', 'both'],
    },
    {
      id: 'essentials',
      title: 'Wedding Day Emergency Kit',
      description: 'Safety pins, medicine pouch, touchup kits, cash lifafe',
      icon: Briefcase,
      applicableTo: ['bride', 'groom', 'both'],
    },
    {
      id: 'groom_attire',
      title: 'Groom Attire',
      description: 'Sherwani, Bandi jacket, Kurta sets, Reception tuxedo',
      icon: Shirt,
      applicableTo: ['groom', 'both'],
    },
    {
      id: 'groom_accessories',
      title: 'Groom Accessories',
      description: 'Safa, kalgi, emerald mala, embroidered mojaris & cufflinks',
      icon: Gem,
      applicableTo: ['groom', 'both'],
    },
  ];

  // Filter items by target selection
  const filteredItems = items.filter(item => {
    if (activeTarget === 'both') return true;
    return item.target === activeTarget || item.target === 'both';
  });

  const totalCount = filteredItems.length;
  const doneCount = filteredItems.filter(i => i.isChecked).length;
  const percentDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    onAddItem({
      title: newItemTitle.trim(),
      category: newItemCategory,
      target: newItemTarget,
      event: newItemEvent,
      isChecked: false,
    });

    setNewItemTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#38232B] dark:text-stone-100 tracking-tight">
            Couple checklists
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            For Ketki &amp; Hardik. For every little moment.
          </p>
        </div>

        <button
          onClick={() => {
            setNewItemTarget(activeTarget === 'both' ? 'bride' : activeTarget);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add checklist item</span>
        </button>
      </div>

      {/* Segmented Control & Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5DFD6] dark:border-[#332A37] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Bride / Groom / Both Selector */}
        <div className="flex items-center gap-1 bg-[#E4DFD6] dark:bg-[#2D2431] p-1 rounded-xl">
          <button
            onClick={() => setActiveTarget('both')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTarget === 'both'
                ? 'bg-[#4E2634] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Both (Couple)
          </button>
          <button
            onClick={() => setActiveTarget('bride')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTarget === 'bride'
                ? 'bg-[#4E2634] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Bride (Ketki)
          </button>
          <button
            onClick={() => setActiveTarget('groom')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTarget === 'groom'
                ? 'bg-[#4E2634] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            Groom (Hardik)
          </button>
        </div>

        {/* Progress Bar & Pulse */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-serif font-medium text-stone-700 dark:text-stone-200">
              Preparation progress
            </span>
            <span className="font-bold text-[#8B4459] dark:text-rose-300">
              {doneCount} of {totalCount} ready ({percentDone}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#DED7CE] dark:bg-[#342A38] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#8B4459] to-[#4E2634] rounded-full transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories
          .filter(cat => activeTarget === 'both' || cat.applicableTo.includes(activeTarget))
          .map(cat => {
            const Icon = cat.icon;
            const categoryItems = filteredItems.filter(i => i.category === cat.id);
            const catDone = categoryItems.filter(i => i.isChecked).length;

            return (
              <div 
                key={cat.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#231D27] border border-[#E8E2D8] dark:border-[#362C3A] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2F2533]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#EFECE6] dark:bg-[#2D2331] text-[#4E2634] dark:text-rose-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-sm sm:text-base text-[#38232B] dark:text-stone-100">
                          {cat.title}
                        </h2>
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#302634] text-stone-600 dark:text-stone-300 shrink-0">
                      {catDone}/{categoryItems.length}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="mt-3.5 space-y-2">
                    {categoryItems.length === 0 ? (
                      <p className="text-xs text-stone-400 py-3 italic text-center">
                        No checklist items in this category yet.
                      </p>
                    ) : (
                      categoryItems.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-[#F2ECE5] dark:hover:bg-[#2C2430] transition-colors group"
                        >
                          <button
                            onClick={() => onToggleItem(item.id)}
                            className="flex items-start gap-2.5 text-left min-w-0 flex-1"
                          >
                            <span className={`
                              mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0
                              ${item.isChecked 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-stone-300 dark:border-stone-600 group-hover:border-[#4E2634]'
                              }
                            `}>
                              {item.isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>

                            <span className={`text-xs ${item.isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>
                              {item.title}
                            </span>
                          </button>

                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-500 p-0.5 transition-opacity"
                            title="Delete item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Add into this category */}
                <div className="mt-4 pt-3 border-t border-[#EFECE6] dark:border-[#2F2533]">
                  <button
                    onClick={() => {
                      setNewItemCategory(cat.id);
                      setNewItemTarget(activeTarget === 'both' ? 'bride' : activeTarget);
                      setIsAddModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#8B4459] hover:text-[#4E2634] dark:text-rose-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to {cat.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1E1921] rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] dark:border-[#382F3B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
              <h3 className="font-serif text-lg font-bold text-[#38232B] dark:text-stone-100">
                Add to couple checklist
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Item description
                </label>
                <input
                  type="text"
                  required
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. Haldi gotapatti dupatta steam ironed"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  >
                    <option value="outfits">Bridal Outfits</option>
                    <option value="jewellery">Jewellery &amp; Accessories</option>
                    <option value="essentials">Wedding Day Emergency Kit</option>
                    <option value="groom_attire">Groom Attire</option>
                    <option value="groom_accessories">Groom Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    For Whom
                  </label>
                  <select
                    value={newItemTarget}
                    onChange={(e) => setNewItemTarget(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  >
                    <option value="bride">Bride (Ketki)</option>
                    <option value="groom">Groom (Hardik)</option>
                    <option value="both">Both (Couple)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white shadow-xs"
                >
                  Add checklist item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
