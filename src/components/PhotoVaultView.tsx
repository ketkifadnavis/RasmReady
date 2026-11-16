import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Heart, 
  Trash2, 
  X, 
  Sparkles,
  Filter,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AlbumPhotoItem, SideFilter, CeremonyEvent } from '../types/wedding';

interface PhotoVaultViewProps {
  photos: AlbumPhotoItem[];
  activeSide: SideFilter;
  onAddPhoto: (photo: Omit<AlbumPhotoItem, 'id' | 'uploadedAt' | 'likes'>) => void;
  onLikePhoto: (id: string) => void;
  onDeletePhoto: (id: string) => void;
}

const CEREMONY_DEFAULT_CAPTIONS: Record<string, string> = {
  roka: 'Roka Ceremony Blessings',
  haldi: 'Golden Haldi Smiles & Sunshine',
  mehendi: 'Henna Hands & Sitar Tunes',
  sangeet: 'Dhol Beats & Sangeet Madness',
  shaadi: 'Sacred Pheras & Wedding Vows',
  reception: 'Grand Royal Reception Gala',
  general: 'Cherished Family Celebration',
  all: 'Special Wedding Milestone',
};

export const PhotoVaultView: React.FC<PhotoVaultViewProps> = ({
  photos,
  activeSide,
  onAddPhoto,
  onLikePhoto,
  onDeletePhoto,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<AlbumPhotoItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: '',
    event: 'shaadi' as CeremonyEvent,
    side: 'shared' as 'ladkiwale' | 'ladkewale' | 'shared',
    uploadedByName: '',
  });

  const filtered = photos.filter(p => {
    const matchesSide = activeSide === 'all' || p.side === activeSide || p.side === 'shared';
    const matchesEvent = selectedEvent === 'all' || p.event === selectedEvent;
    return matchesSide && matchesEvent;
  });

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, HEIC).');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setUploadError('Please take a photo or select an image from your gallery.');
      return;
    }

    const finalCaption = formData.caption.trim() || CEREMONY_DEFAULT_CAPTIONS[formData.event] || 'Cherished Wedding Memory';

    onAddPhoto({
      weddingId: 'wedding-ketki-hardik-2027',
      imageUrl: formData.imageUrl,
      caption: finalCaption,
      event: formData.event,
      side: formData.side,
      uploadedByName: formData.uploadedByName.trim() || 'Family Member',
    });

    setFormData({
      imageUrl: '',
      caption: '',
      event: 'shaadi',
      side: 'shared',
      uploadedByName: '',
    });
    setUploadError(null);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            Shared Digital Photo Vault &amp; Memories
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Capture and preserve every candid moment across Haldi, Mehendi, Sangeet, and the sacred Pheras.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Memory</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mr-2 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Photos:</span>
        </div>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Ceremonies</option>
          <option value="roka">Roka Ceremony</option>
          <option value="haldi">Haldi</option>
          <option value="mehendi">Mehendi</option>
          <option value="sangeet">Sangeet</option>
          <option value="shaadi">Shaadi / Pheras</option>
          <option value="reception">Reception</option>
        </select>

        <span className="ml-auto text-stone-400">
          Showing {filtered.length} of {photos.length} memories
        </span>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-stone-400 text-xs">
            No memories uploaded for this ceremony yet. Be the first to add a snapshot!
          </div>
        ) : (
          filtered.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs flex flex-col justify-between"
            >
              <div 
                className="relative overflow-hidden cursor-pointer"
                onClick={() => setLightboxPhoto(photo)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] uppercase font-semibold text-white tracking-wider">
                  {photo.event}
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs font-medium text-stone-900 dark:text-stone-100 line-clamp-2">
                  {photo.caption}
                </p>

                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <span className="truncate max-w-[120px]">
                    By {photo.uploadedByName}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLikePhoto(photo.id)}
                      className="flex items-center gap-1 text-rose-600 hover:scale-110 transition-transform"
                      title="Like memory"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                      <span className="font-mono text-[11px] font-semibold">{photo.likes}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this photo memory?')) {
                          onDeletePhoto(photo.id);
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-rose-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.caption}
              className="max-h-[75vh] w-auto rounded-xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 text-center text-white">
              <p className="text-sm font-medium">{lightboxPhoto.caption}</p>
              <p className="text-xs text-stone-400 mt-1">
                Shared by {lightboxPhoto.uploadedByName} · {lightboxPhoto.event.toUpperCase()} · {lightboxPhoto.likes} Likes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Memory Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            {/* Hidden native file inputs */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                  Upload Wedding Memory
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Capture from camera or select high-res photos from your gallery
                </p>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadError(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Photo Source Selector & Preview */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Select Photo <span className="text-rose-600">*</span>
                </label>

                {!formData.imageUrl ? (
                  <div className="space-y-2.5">
                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium transition-all shadow-2xs group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-xs leading-tight">Use Camera</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Take a live photo</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium transition-all shadow-2xs group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-xs leading-tight">Choose Gallery</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Select photo file</p>
                        </div>
                      </button>
                    </div>

                    {/* Drag and drop dropzone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => galleryInputRef.current?.click()}
                      className={`cursor-pointer p-5 border-2 border-dashed rounded-xl text-center transition-all ${
                        isDragging
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30'
                          : 'border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/30 hover:border-stone-400'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 mx-auto text-stone-400 dark:text-stone-500 mb-1.5" />
                      <p className="font-medium text-stone-700 dark:text-stone-300 text-xs">
                        Drag &amp; drop your wedding photo here
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        Supports high-res JPG, PNG, WebP or direct camera snaps
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Photo preview state */
                  <div className="relative rounded-xl overflow-hidden border border-[#E7DFD5] dark:border-[#2E2833] bg-stone-900">
                    <img
                      src={formData.imageUrl}
                      alt="Upload preview"
                      className="w-full h-48 object-contain bg-black/40"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-medium shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to Upload</span>
                    </div>

                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="px-2.5 py-1 rounded-lg bg-rose-700/80 hover:bg-rose-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-stone-700 dark:text-stone-300">
                    Memory Caption <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-stone-400 italic">Leave blank for auto-caption</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Sangeet dance rehearsal or Baraat entry (optional)"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none placeholder:text-stone-400"
                />
              </div>

              {/* Ceremony & Uploader Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Ceremony Function *
                  </label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value as CeremonyEvent })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="roka">Roka Ceremony</option>
                    <option value="haldi">Haldi</option>
                    <option value="mehendi">Mehendi</option>
                    <option value="sangeet">Sangeet</option>
                    <option value="shaadi">Shaadi / Pheras</option>
                    <option value="reception">Reception</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hardik, Ketki, or Vikram Mama"
                    value={formData.uploadedByName}
                    onChange={(e) => setFormData({ ...formData, uploadedByName: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Family Side Attribution */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Family Side Attribution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkiwale' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkiwale'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Ladkiwale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'ladkewale' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'ladkewale'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Ladkewale
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'shared' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                      formData.side === 'shared'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Shared
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE2D7] dark:border-[#2D2832]">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadError(null);
                  }}
                  className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.imageUrl}
                  className={`px-5 py-2 font-medium rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                    formData.imageUrl
                      ? 'bg-[#4E2634] hover:bg-[#3D1D28] text-white cursor-pointer'
                      : 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Memory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
