import React, { useState } from 'react';
import { X, Calendar, MapPin, Heart, Clock } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface WeddingEditModalProps {
  isOpen: boolean;
  wedding: WeddingConfig;
  onClose: () => void;
  onSave: (updated: WeddingConfig) => void;
}

export const WeddingEditModal: React.FC<WeddingEditModalProps> = ({
  isOpen,
  wedding,
  onClose,
  onSave,
}) => {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(wedding.weddingDate);
  const [dateChanged, setDateChanged] = useState(false);
  const [formData, setFormData] = useState<WeddingConfig>(() => {
    const date = new Date(dateOnly ? `${wedding.weddingDate}T00:00:00` : wedding.weddingDate);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return { ...wedding, weddingDate: localDate.toISOString().slice(0, 16) };
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      weddingDate: dateChanged ? new Date(formData.weddingDate).toISOString() : wedding.weddingDate,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D7] dark:border-[#2D2832]">
          <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            Edit Wedding Details
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Bride&apos;s Full Name
              </label>
              <input
                type="text"
                required
                value={formData.brideName}
                onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Groom&apos;s Full Name
              </label>
              <input
                type="text"
                required
                value={formData.groomName}
                onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-700" />
              Main Ceremony / Pheras Date &amp; Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.weddingDate}
              onChange={(e) => { setDateChanged(true); setFormData({ ...formData, weddingDate: e.target.value }); }}
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {dateOnly && <p className="mt-1 text-stone-500">No time was saved for this wedding. Choose the correct time if you change the date.</p>}
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Auspicious Muhurat Note
            </label>
            <input
              type="text"
              placeholder="e.g. 7:45 PM (Godhuli Muhurat)"
              value={formData.muhuratTime || ''}
              onChange={(e) => setFormData({ ...formData, muhuratTime: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-700" />
              Wedding Venue &amp; City
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chandra Mahal Palace & Gardens, Jaipur"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#EAE2D7] dark:border-[#2D2832]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4E2634] hover:bg-[#3D1D28] text-white font-medium rounded-xl shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
