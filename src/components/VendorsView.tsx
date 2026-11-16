import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  X,
  Filter
} from 'lucide-react';
import { 
  VendorItem, 
  SideFilter, 
  VendorCategory, 
  VendorStatus, 
  CeremonyEvent 
} from '../types/wedding';

interface VendorsViewProps {
  vendors: VendorItem[];
  activeSide: SideFilter;
  onAdd: (vendor: Omit<VendorItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<VendorItem>) => void;
  onDelete: (id: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  activeSide,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'decor' as VendorCategory,
    contactPerson: '',
    phone: '',
    email: '',
    side: 'ladkiwale' as 'ladkiwale' | 'ladkewale' | 'shared',
    eventsCovered: ['shaadi'] as CeremonyEvent[],
    totalQuotation: 100000,
    advancePaid: 50000,
    status: 'booked' as VendorStatus,
    notes: '',
  });

  const filtered = vendors.filter(v => {
    const matchesSide = activeSide === 'all' || v.side === activeSide || v.side === 'shared';
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSide && matchesCat && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'catering',
      contactPerson: '',
      phone: '+91 ',
      email: '',
      side: activeSide === 'all' ? 'shared' : activeSide,
      eventsCovered: ['shaadi'],
      totalQuotation: 100000,
      advancePaid: 30000,
      status: 'booked',
      notes: '',
    });
    setModalMode('create');
  };

  const openEditModal = (v: VendorItem) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      category: v.category,
      contactPerson: v.contactPerson,
      phone: v.phone,
      email: v.email || '',
      side: v.side,
      eventsCovered: v.eventsCovered,
      totalQuotation: v.totalQuotation,
      advancePaid: v.advancePaid,
      status: v.status,
      notes: v.notes || '',
    });
    setModalMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Math.max(0, formData.totalQuotation - formData.advancePaid);
    if (modalMode === 'create') {
      onAdd({
        weddingId: 'wedding-ketki-hardik-2027',
        name: formData.name,
        category: formData.category,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        side: formData.side,
        eventsCovered: formData.eventsCovered,
        totalQuotation: Number(formData.totalQuotation),
        advancePaid: Number(formData.advancePaid),
        balanceDue: balance,
        status: formData.status,
        notes: formData.notes,
      });
    } else if (modalMode === 'edit' && editingVendor) {
      onUpdate(editingVendor.id, {
        name: formData.name,
        category: formData.category,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        side: formData.side,
        eventsCovered: formData.eventsCovered,
        totalQuotation: Number(formData.totalQuotation),
        advancePaid: Number(formData.advancePaid),
        balanceDue: balance,
        status: formData.status,
        notes: formData.notes,
      });
    }
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            Wedding Vendor Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Pandit Ji, royal caterers, mehendi artists, photographers, dhol troupe, and floral decorators.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#4E2634] hover:bg-[#3D1D28] dark:bg-[#683345] dark:hover:bg-[#572939] rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mr-2 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Vendors:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Vendor Categories</option>
          <option value="pandit">Pandit Ji / Purohit</option>
          <option value="catering">Royal Catering</option>
          <option value="decor">Decor &amp; Mandap</option>
          <option value="photography">Photo &amp; Cinematography</option>
          <option value="mehendi_artist">Mehendi Artist</option>
          <option value="dhol_dj">Dhol &amp; DJ</option>
          <option value="makeup_mua">Bridal Makeup / MUA</option>
          <option value="attire">Couture &amp; Attire</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">All Booking Statuses</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="booked">Booked &amp; Contracted</option>
          <option value="completed">Completed / Cleared</option>
        </select>

        <span className="ml-auto text-stone-400">
          Showing {filtered.length} of {vendors.length} vendors
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] rounded-xl text-stone-400 text-xs">
            No vendors found. Click &quot;Add Vendor&quot; to register contacts and contracts.
          </div>
        ) : (
          filtered.map((vendor) => {
            const cleanPhone = vendor.phone.replace(/[^0-9]/g, '');
            return (
              <div
                key={vendor.id}
                className="p-5 rounded-xl bg-white dark:bg-[#1D1B20] border border-[#EBE4DA] dark:border-[#2D2833] shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-400">
                        {vendor.category.replace('_', ' ')}
                      </span>
                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mt-0.5">
                        {vendor.name}
                      </h3>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      vendor.status === 'booked' || vendor.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800 dark:text-stone-200">Contact:</span>
                      <span>{vendor.contactPerson}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800 dark:text-stone-200">Side:</span>
                      <span className={`capitalize font-medium ${
                        vendor.side === 'ladkiwale'
                          ? 'text-rose-700 dark:text-rose-400'
                          : vendor.side === 'ladkewale'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {vendor.side === 'shared' ? 'Jointly Shared' : `${vendor.side}`}
                      </span>
                    </div>

                    {vendor.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 line-clamp-2">
                        {vendor.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Strip & Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-3">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-sans">Total Quote</span>
                      <strong className="text-stone-900 dark:text-stone-100">
                        ₹{vendor.totalQuotation.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-sans">Balance Due</span>
                      <strong className="text-rose-600 dark:text-rose-400">
                        ₹{vendor.balanceDue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(vendor.contactPerson)},%20regarding%20the%20wedding%20services%20for%20Ketki%20%26%20Hardik.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit Vendor"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete vendor "${vendor.name}"?`)) {
                            onDelete(vendor.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Delete Vendor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFBF7] dark:bg-[#1C1A1F] border border-[#E7DFD5] dark:border-[#2E2833] rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D7] dark:border-[#2D2832]">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                {modalMode === 'create' ? 'Add Vendor Contract' : 'Edit Vendor Contract'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Vendor Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pandit Rakesh Shastri"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="pandit">Pandit Ji / Purohit</option>
                    <option value="catering">Royal Catering</option>
                    <option value="decor">Decor &amp; Mandap</option>
                    <option value="photography">Photo &amp; Cinematography</option>
                    <option value="mehendi_artist">Mehendi Artist</option>
                    <option value="dhol_dj">Dhol &amp; DJ</option>
                    <option value="makeup_mua">Bridal Makeup / MUA</option>
                    <option value="attire">Couture &amp; Attire</option>
                    <option value="invitations">Cards &amp; Hampers</option>
                    <option value="venue">Venue Booking</option>
                    <option value="transport">Vintage Car / Transport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pt. Rakesh"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Phone (with +91) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Responsible Family Side *
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
                    Joint / Shared
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Total Quotation (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.totalQuotation}
                    onChange={(e) => setFormData({ ...formData, totalQuotation: Number(e.target.value) })}
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
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VendorStatus })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked (Token Paid)</option>
                    <option value="completed">Completed / Settled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="vendor@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Deliverables &amp; Inclusions Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pure-veg Jain counter, drone license included, trial makeup details..."
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
                  {modalMode === 'create' ? 'Save Vendor' : 'Update Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
