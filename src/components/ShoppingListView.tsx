import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Tag, 
  User, 
  IndianRupee,
  X,
  Filter
} from 'lucide-react';
import { ShoppingItem, CeremonyEvent, SideFilter } from '../types/wedding';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  activeSide: SideFilter;
  onAdd: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  activeSide,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    event: 'shaadi' as CeremonyEvent,
    personInCharge: 'Ketki',
    quantity: 1,
    estimatedCost: 2000,
    referenceLink: '',
    isBought: false,
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      event: 'shaadi',
      personInCharge: 'Ketki',
      quantity: 1,
      estimatedCost: 2000,
      referenceLink: '',
      isBought: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      event: item.event,
      personInCharge: item.personInCharge,
      quantity: item.quantity,
      estimatedCost: item.estimatedCost,
      referenceLink: item.referenceLink || '',
      isBought: item.isBought,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdate(editingItem.id, {
        name: formData.name.trim(),
        event: formData.event,
        personInCharge: formData.personInCharge.trim(),
        quantity: Number(formData.quantity) || 1,
        estimatedCost: Number(formData.estimatedCost) || 0,
        referenceLink: formData.referenceLink.trim() || undefined,
        isBought: formData.isBought,
      });
    } else {
      onAdd({
        weddingId: 'wedding-ketki-hardik-2027',
        name: formData.name.trim(),
        event: formData.event,
        personInCharge: formData.personInCharge.trim(),
        quantity: Number(formData.quantity) || 1,
        estimatedCost: Number(formData.estimatedCost) || 0,
        referenceLink: formData.referenceLink.trim() || undefined,
        isBought: formData.isBought,
      });
    }

    setIsModalOpen(false);
  };

  const filteredItems = items.filter(item => {
    if (statusFilter === 'pending' && item.isBought) return false;
    if (statusFilter === 'bought' && !item.isBought) return false;
    if (eventFilter !== 'all' && item.event !== eventFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.personInCharge.toLowerCase().includes(q) ||
        item.event.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const boughtCount = items.filter(i => i.isBought).length;
  const spentCost = items.filter(i => i.isBought).reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#38232B] dark:text-stone-100 tracking-tight">
            Shopping list
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            From the big outfits to the little details.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add item</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5E0D8] dark:border-[#332A37]">
          <p className="text-[11px] text-stone-500 font-medium">Total Items</p>
          <p className="text-xl font-serif font-bold text-[#38232B] dark:text-stone-100 mt-0.5">
            {items.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5E0D8] dark:border-[#332A37]">
          <p className="text-[11px] text-stone-500 font-medium">Items Bought</p>
          <p className="text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {boughtCount} / {items.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5E0D8] dark:border-[#332A37]">
          <p className="text-[11px] text-stone-500 font-medium">Estimated Budget</p>
          <p className="text-xl font-serif font-bold text-[#38232B] dark:text-stone-100 mt-0.5">
            ₹{totalCost.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5E0D8] dark:border-[#332A37]">
          <p className="text-[11px] text-stone-500 font-medium">Purchased So Far</p>
          <p className="text-xl font-serif font-bold text-[#8B4459] dark:text-rose-300 mt-0.5">
            ₹{spentCost.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#EFECE6] dark:bg-[#221C25] p-2 sm:p-2.5 rounded-2xl border border-[#E4DFD6] dark:border-[#342A37]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a shopping item, person in charge..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#2D2431] border border-[#DFD8CE] dark:border-[#3E3342] text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#4E2634]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-white/70 dark:bg-[#2D2431]/70 p-1 rounded-xl border border-[#DFD8CE] dark:border-[#3E3342] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-[#4E2634] text-white font-semibold' : 'text-stone-600 dark:text-stone-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-[#4E2634] text-white font-semibold' : 'text-stone-600 dark:text-stone-300'}`}
            >
              To Buy
            </button>
            <button
              onClick={() => setStatusFilter('bought')}
              className={`px-3 py-1 rounded-lg transition-all ${statusFilter === 'bought' ? 'bg-[#4E2634] text-white font-semibold' : 'text-stone-600 dark:text-stone-300'}`}
            >
              Bought
            </button>
          </div>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#2D2431] border border-[#DFD8CE] dark:border-[#3E3342] text-stone-700 dark:text-stone-200"
          >
            <option value="all">All Events</option>
            <option value="haldi">Haldi</option>
            <option value="mehendi">Mehendi</option>
            <option value="sangeet">Sangeet</option>
            <option value="shaadi">Shaadi</option>
            <option value="reception">Reception</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#EFECE6]/50 dark:bg-[#201A22]/50 border border-dashed border-[#DFD8CE] dark:border-[#332A37]">
            <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="font-serif text-stone-600 dark:text-stone-300 text-sm">A little breathing room.</p>
            <p className="text-stone-400 text-xs mt-1">No items found in this filter.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`
                group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#241E28]
                border transition-all
                ${item.isBought 
                  ? 'border-[#E4DFD6] dark:border-[#302634] opacity-75' 
                  : 'border-[#E4DFD6] dark:border-[#382D3D] shadow-xs hover:border-[#4E2634]/30'
                }
              `}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Checkbox button */}
                <button
                  onClick={() => onUpdate(item.id, { isBought: !item.isBought })}
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0
                    ${item.isBought 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'border-stone-300 dark:border-stone-600 hover:border-[#4E2634]'
                    }
                  `}
                >
                  {item.isBought && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-xs sm:text-sm font-medium ${item.isBought ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                      {item.name}
                    </p>
                    {item.quantity > 1 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#EAE4DC] dark:bg-[#342B38] text-[10px] text-stone-600 dark:text-stone-300 font-semibold">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500 dark:text-stone-400 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-400" />
                      {item.personInCharge}
                    </span>
                    <span className="inline-flex items-center gap-1 capitalize px-2 py-0.5 rounded-full bg-[#EAE4DC] dark:bg-[#322736] text-[10px]">
                      {item.event}
                    </span>
                    {item.referenceLink && (
                      <a 
                        href={item.referenceLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#8B4459] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Inspo
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Price and actions */}
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                  ₹{item.estimatedCost.toLocaleString('en-IN')}
                </span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
                    title="Edit item"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1E1921] rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] dark:border-[#382F3B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
              <h3 className="font-serif text-lg font-bold text-[#38232B] dark:text-stone-100">
                {editingItem ? 'Edit shopping item' : 'Add shopping item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Item name &amp; details
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haldi marigold garlands & brass bowls"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Ceremony event
                  </label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value as CeremonyEvent })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  >
                    <option value="haldi">Haldi</option>
                    <option value="mehendi">Mehendi</option>
                    <option value="sangeet">Sangeet</option>
                    <option value="shaadi">Shaadi</option>
                    <option value="reception">Reception</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Person in charge
                  </label>
                  <input
                    type="text"
                    value={formData.personInCharge}
                    onChange={(e) => setFormData({ ...formData, personInCharge: e.target.value })}
                    placeholder="e.g. Vikram Mama, Ketki"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Estimated cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                  Inspiration link / Store (optional)
                </label>
                <input
                  type="url"
                  value={formData.referenceLink}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                  placeholder="https://pinterest.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white shadow-xs"
                >
                  {editingItem ? 'Save changes' : 'Add to list'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
