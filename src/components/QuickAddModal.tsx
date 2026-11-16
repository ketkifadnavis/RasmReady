import React from 'react';
import { 
  X, 
  CheckSquare, 
  IndianRupee, 
  Users, 
  ShoppingBag, 
  Sparkles, 
  UserPlus,
  ArrowRight
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'task' | 'expense' | 'guest' | 'shopping' | 'celebration' | 'invite') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'task' as const,
      title: 'New task',
      description: 'Assign a responsibility to family or bridesmaids',
      icon: CheckSquare,
      color: 'bg-rose-50 text-[#8B4459] border-rose-100',
    },
    {
      id: 'expense' as const,
      title: 'Record expense',
      description: 'Add catering, decor, or advance payments',
      icon: IndianRupee,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      id: 'guest' as const,
      title: 'Add guests',
      description: 'Track RSVP, Jain food, and room allocations',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: 'shopping' as const,
      title: 'Add shopping item',
      description: 'Haldi fabric, pooja samagri, or hampers',
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      id: 'celebration' as const,
      title: 'New celebration',
      description: 'Create a moodboard or ceremony milestone',
      icon: Sparkles,
      color: 'bg-orange-50 text-orange-700 border-orange-100',
    },
    {
      id: 'invite' as const,
      title: 'Invite family',
      description: 'Add parents, mamas, or partners to collaborate',
      icon: UserPlus,
      color: 'bg-sky-50 text-sky-700 border-sky-100',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#FAF7F2] dark:bg-[#1E1921] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE3D8] dark:border-[#382F3B] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#EFECE6] dark:border-[#2C2430]">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#38232B] dark:text-stone-100">
              A little progress, right here.
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              What would you like to add to your wedding preparations?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#251F2A] hover:bg-[#F4EFEB] dark:hover:bg-[#2E2533] border border-[#E8E2D8] dark:border-[#382F3B] text-left transition-all group shadow-xs hover:border-[#4E2634]/30"
              >
                <div className={`p-2.5 rounded-xl border ${act.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#38232B] dark:text-stone-100 group-hover:text-[#8B4459] transition-colors">
                      {act.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#8B4459] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFECE6] dark:border-[#2C2430] flex items-center justify-between text-[11px] text-stone-400">
          <span>🪷 Every step counts towards the big day.</span>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
