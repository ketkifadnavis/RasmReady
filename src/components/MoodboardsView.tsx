import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Music, 
  Check, 
  Copy, 
  Plus, 
  Edit3, 
  X,
  Image as ImageIcon
} from 'lucide-react';
import { MoodboardItem, CeremonyEvent, SideFilter } from '../types/wedding';

interface MoodboardsViewProps {
  moodboards: MoodboardItem[];
  activeSide: SideFilter;
  onUpdateMoodboard: (id: string, updates: Partial<MoodboardItem>) => void;
}

export const MoodboardsView: React.FC<MoodboardsViewProps> = ({
  moodboards,
  activeSide,
  onUpdateMoodboard,
}) => {
  const [selectedBoardId, setSelectedBoardId] = useState(() => moodboards.find(board => board.event === 'haldi')?.id || moodboards[0]?.id || '');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  const currentBoard = moodboards.find(board => board.id === selectedBoardId) || moodboards[0];

  const [editFormData, setEditFormData] = useState({
    title: currentBoard?.title || '',
    themeDescription: currentBoard?.themeDescription || '',
    dressCodeAdviceLadkiwale: currentBoard?.dressCodeAdviceLadkiwale || '',
    dressCodeAdviceLadkewale: currentBoard?.dressCodeAdviceLadkewale || '',
    musicPlaylistNotes: currentBoard?.musicPlaylistNotes || '',
  });

  const eventTabs: Array<{ id: CeremonyEvent; label: string }> = [
    { id: 'roka', label: 'Roka / Engagement' },
    { id: 'haldi', label: 'Haldi' },
    { id: 'mehendi', label: 'Mehendi' },
    { id: 'sangeet', label: 'Sangeet' },
    { id: 'shaadi', label: 'Shaadi & Pheras' },
    { id: 'reception', label: 'Reception' },
  ];

  const handleCopyColor = async (hex: string) => {
    setCopiedHex(null);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch (error) {
      console.error('Color copy failed:', error);
      setCopyError('Could not copy the color. Allow clipboard access and try again.');
    }
  };

  const openEditModal = () => {
    if (!currentBoard) return;
    setEditFormData({
      title: currentBoard.title,
      themeDescription: currentBoard.themeDescription,
      dressCodeAdviceLadkiwale: currentBoard.dressCodeAdviceLadkiwale,
      dressCodeAdviceLadkewale: currentBoard.dressCodeAdviceLadkewale,
      musicPlaylistNotes: currentBoard.musicPlaylistNotes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard) return;
    onUpdateMoodboard(currentBoard.id, {
      ...editFormData,
      updatedAt: new Date().toISOString(),
    });
    setIsEditModalOpen(false);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard || !newImageUrl) return;
    const updatedImages = [
      ...currentBoard.images,
      {
        url: newImageUrl,
        caption: newImageCaption || 'Ceremony inspiration',
        tag: 'inspiration',
      }
    ];
    onUpdateMoodboard(currentBoard.id, {
      images: updatedImages,
      updatedAt: new Date().toISOString(),
    });
    setNewImageUrl('');
    setNewImageCaption('');
    setIsAddImageModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            Ceremony Moodboards &amp; Styling Guide
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Visual palettes, dress code etiquette for both sides, decor accents, and soundscapes.
          </p>
        </div>

        <button
          onClick={openEditModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Moodboard</span>
        </button>
      </div>

      {copyError && <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">{copyError}</p>}

      {/* Ceremony Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200 dark:border-stone-800">
        {eventTabs.flatMap(tab => {
          const boards = moodboards.filter(board => board.event === tab.id);
          return boards.map(board => {
            const isActive = currentBoard?.id === board.id;
            return (
              <button
                key={board.id}
                onClick={() => setSelectedBoardId(board.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-rose-700 text-rose-800 dark:text-rose-300 bg-rose-50/60 dark:bg-rose-950/30'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 hover:bg-stone-100/50'
                }`}
              >
                {boards.length > 1 ? board.title : tab.label}
              </button>
            );
          });
        })}
      </div>

      {currentBoard && (
        <div className="space-y-6">
          
          {/* Main Atmosphere Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Theme &amp; Visual Vision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              {currentBoard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed max-w-3xl">
              {currentBoard.themeDescription}
            </p>

            {/* Color Palette Swatches */}
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-3">
                Curated Color Palette (Click swatch to copy hex code):
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {currentBoard.colorPalette.map((hex, index) => (
                  <button
                    key={index}
                    onClick={() => handleCopyColor(hex)}
                    className="group relative flex flex-col items-center gap-1.5 focus:outline-none"
                    title={`Copy ${hex}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl shadow-xs border border-black/10 group-hover:scale-105 transition-transform flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                    >
                      {copiedHex === hex && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                      {hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dress Code: Ladkiwale vs Ladkewale Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ladkiwale Dress Code */}
            <div className={`p-5 rounded-xl border transition-all ${
              activeSide === 'ladkewale'
                ? 'opacity-60 bg-stone-50/50 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800'
                : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 shadow-xs'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Ladkiwale Attire Guide
                </span>
                <span className="text-[11px] text-rose-700/80 font-medium">Bride&apos;s Family</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {currentBoard.dressCodeAdviceLadkiwale}
              </p>
            </div>

            {/* Ladkewale Dress Code */}
            <div className={`p-5 rounded-xl border transition-all ${
              activeSide === 'ladkiwale'
                ? 'opacity-60 bg-stone-50/50 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800'
                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 shadow-xs'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Ladkewale Attire Guide
                </span>
                <span className="text-[11px] text-amber-700/80 font-medium">Groom&apos;s Family</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {currentBoard.dressCodeAdviceLadkewale}
              </p>
            </div>

          </div>

          {/* Key Decor Motifs & Music */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Key Ritual Decor Elements
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                {currentBoard.keyDecorElements.map((el, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-indigo-600" />
                Ceremony Music &amp; Audio Notes
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-2">
                {currentBoard.musicPlaylistNotes || 'Curate traditional shehnai, dhol beats, and Bollywood mashups for this ceremony.'}
              </p>
            </div>

          </div>

          {/* Inspiration Gallery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                Inspiration Gallery
              </h3>
              <button
                onClick={() => setIsAddImageModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Inspiration</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {currentBoard.images.map((img, idx) => (
                <div key={idx} className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-medium text-white drop-shadow">
                      {img.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Edit Moodboard Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Edit {currentBoard?.title} Moodboard
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Moodboard Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Atmosphere &amp; Theme Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.themeDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, themeDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-rose-700 dark:text-rose-400">
                  Ladkiwale Attire Guide (Bride&apos;s Family)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.dressCodeAdviceLadkiwale}
                  onChange={(e) => setEditFormData({ ...editFormData, dressCodeAdviceLadkiwale: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-amber-700 dark:text-amber-400">
                  Ladkewale Attire Guide (Groom&apos;s Family)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.dressCodeAdviceLadkewale}
                  onChange={(e) => setEditFormData({ ...editFormData, dressCodeAdviceLadkewale: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Ceremony Music Notes
                </label>
                <input
                  type="text"
                  value={editFormData.musicPlaylistNotes}
                  onChange={(e) => setEditFormData({ ...editFormData, musicPlaylistNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg shadow-xs transition-colors"
                >
                  Save Moodboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Image Inspiration Modal */}
      {isAddImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Add Image Inspiration
              </h3>
              <button
                onClick={() => setIsAddImageModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Caption / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stage lighting setup or floral entrance"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => setIsAddImageModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg shadow-xs transition-colors"
                >
                  Add Inspiration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
