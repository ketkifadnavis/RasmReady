import React, { useState } from 'react';
import { 
  Heart, 
  UserPlus, 
  Mail, 
  Phone, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  Crown, 
  Sparkles,
  X,
  ShieldCheck,
  Send,
  Share2
} from 'lucide-react';
import { TeamMember, SideFilter } from '../types/wedding';

interface OurPeopleViewProps {
  members: TeamMember[];
  activeSide: SideFilter;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onNavigateToTasksForMember?: (memberName: string) => void;
  onOpenShareInviteModal?: () => void;
}

export const OurPeopleView: React.FC<OurPeopleViewProps> = ({
  members,
  activeSide,
  onAddMember,
  onDeleteMember,
  onNavigateToTasksForMember,
  onOpenShareInviteModal,
}) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('Mama Ji (Bride side)');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  const relationPresets = [
    'Mama Ji (Bride side)',
    'Mami Ji (Bride side)',
    'Chacha Ji (Groom side)',
    'Chachi Ji (Groom side)',
    'Bhabhi (Sister-in-Law)',
    'Bridesmaid / Sister',
    'Groomsman / Brother',
    'Parents (Bride side)',
    'Parents (Groom side)',
    'Maasi Ji (Maternal Aunt)',
    'Bua Ji (Paternal Aunt)',
    'Wedding Coordinator',
    'Best Friend',
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      role: role.trim() || 'Wedding Committee Member',
      email: email.trim(),
      relation: relation,
      avatarLetter: name.trim().charAt(0).toUpperCase(),
      tasksCount: 0,
    });

    setInviteSuccessMsg(`Directory entry added for ${name.trim()}.`);
    setTimeout(() => {
      setInviteSuccessMsg('');
      setIsInviteModalOpen(false);
      setName('');
      setRole('');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#38232B] dark:text-stone-100 tracking-tight">
            Our people
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Your wedding team directory. Adding or removing entries does not change workspace access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenShareInviteModal && (
            <button
              onClick={onOpenShareInviteModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors"
              title="Share 1-Click WhatsApp or Web Link for family to join"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Wedding Join Link</span>
            </button>
          )}

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member Directly</span>
          </button>
        </div>
      </div>

      {/* Intro Quote Banner */}
      <div className="p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#201A22] border border-[#E5DFD6] dark:border-[#332A37] flex items-center gap-3">
        <span className="text-2xl">🪷</span>
        <div>
          <p className="font-serif font-semibold text-xs text-[#38232B] dark:text-stone-200">
            Har taiyaari, apno ke saath.
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Family delegates make an Indian wedding sing. Assign tasks, track responsibilities, and collaborate effortlessly.
          </p>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#231D27] border border-[#E8E2D8] dark:border-[#362C3A] shadow-xs flex flex-col justify-between group hover:border-[#4E2634]/30 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center font-serif font-bold text-base shadow-xs
                    ${member.isPartner 
                      ? 'bg-[#4E2634] text-white' 
                      : 'bg-[#EAE4DC] dark:bg-[#342A38] text-[#38232B] dark:text-stone-200'
                    }
                  `}>
                    {member.avatarLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif font-bold text-sm text-[#38232B] dark:text-stone-100">
                        {member.name}
                      </h3>
                      {member.isPartner && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                {!member.isPartner && (
                  <button
                    onClick={() => onDeleteMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE4DC] dark:bg-[#342A38] text-stone-700 dark:text-stone-300">
                  {member.relation}
                </span>
                {member.tasksCount !== undefined && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {member.tasksCount} tasks
                  </span>
                )}
              </div>
            </div>

            {/* Contact & Footer */}
            <div className="mt-4 pt-3 border-t border-[#EFECE6] dark:border-[#2F2533] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span className="truncate max-w-[150px]">{member.email}</span>
              <span className="font-medium text-[#8B4459] dark:text-rose-300">
                {member.isPartner ? 'Organizer' : 'Family Team'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1E1921] rounded-3xl p-6 shadow-2xl border border-[#EAE3D8] dark:border-[#382F3B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-[#2C2430]">
              <h3 className="font-serif text-lg font-bold text-[#38232B] dark:text-stone-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#8B4459]" />
                <span>Add to wedding team directory</span>
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="font-serif font-bold text-stone-800 dark:text-stone-100">{inviteSuccessMsg}</p>
                <p className="text-xs text-stone-400">To give them workspace access, share a link using Invite Family.</p>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Mama, Pooja Bhabhi"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Family relation / Side
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  >
                    {relationPresets.map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Responsibility / Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Logistics & Baraat Welcome Lead"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                    Email or WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram@family.com or +91 98200 11223"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#29222E] border border-[#DFD8CE] dark:border-[#3A303F] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add to directory</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
