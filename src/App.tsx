import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { ShoppingListView } from './components/ShoppingListView';
import { CoupleChecklistsView } from './components/CoupleChecklistsView';
import { OurPeopleView } from './components/OurPeopleView';
import { WelcomeModal } from './components/WelcomeModal';
import { WeddingEditModal } from './components/WeddingEditModal';
import { AuthModal } from './components/AuthModal';
import { OverviewView } from './components/OverviewView';
import { BudgetView } from './components/BudgetView';
import { TasksView } from './components/TasksView';
import { VendorsView } from './components/VendorsView';
import { GuestsView } from './components/GuestsView';
import { MoodboardsView } from './components/MoodboardsView';
import { PhotoVaultView } from './components/PhotoVaultView';
import { InviteFamilyModal } from './components/InviteFamilyModal';
import { JoinWeddingModal } from './components/JoinWeddingModal';
import { WeddingSwitcher } from './components/WeddingSwitcher';
import { 
  WeddingConfig, 
  BudgetItem, 
  TaskItem, 
  VendorItem, 
  GuestItem, 
  MoodboardItem, 
  AlbumPhotoItem, 
  SideFilter,
  ShoppingItem,
  ChecklistItem,
  TeamMember
} from './types/wedding';
import { useWeddingCollection, useWorkspace } from './lib/useWorkspace';
import { 
  Search, 
  Plus, 
  Menu, 
  Sun, 
  Moon, 
  Settings, 
  HelpCircle, 
  ChevronRight,
  Heart,
  UserPlus,
  Layers
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shubh_vivaah_theme');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shubh_vivaah_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shubh_vivaah_theme', 'light');
    }
  }, [isDark]);

  // Welcome Guide Modal
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('shubh_vivaah_welcomed');
    }
    return true;
  });

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    localStorage.setItem('shubh_vivaah_welcomed', 'true');
  };

  // Navigation & Side Filter State
  const [activeSide, setActiveSide] = useState<SideFilter>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isWeddingModalOpen, setIsWeddingModalOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Multi-wedding and Family Invite States
  const [isInviteFamilyModalOpen, setIsInviteFamilyModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [joinCodeInitial, setJoinCodeInitial] = useState<string>('');
  const [joinSideInitial, setJoinSideInitial] = useState<'ladkiwale' | 'ladkewale' | 'mutual'>('ladkiwale');

  const workspace = useWorkspace();
  const { currentUser, joinedWeddings, wedding, reportError } = workspace;
  const setWedding = workspace.saveWedding;
  const collectionScope = { weddingId: workspace.activeWeddingId, scope: workspace.scope };
  const budgetState = useWeddingCollection<BudgetItem>(collectionScope.weddingId, collectionScope.scope, 'budget', reportError);
  const taskState = useWeddingCollection<TaskItem>(collectionScope.weddingId, collectionScope.scope, 'tasks', reportError);
  const vendorState = useWeddingCollection<VendorItem>(collectionScope.weddingId, collectionScope.scope, 'vendors', reportError);
  const guestState = useWeddingCollection<GuestItem>(collectionScope.weddingId, collectionScope.scope, 'guests', reportError);
  const moodboardState = useWeddingCollection<MoodboardItem>(collectionScope.weddingId, collectionScope.scope, 'moodboards', reportError);
  const photoState = useWeddingCollection<AlbumPhotoItem>(collectionScope.weddingId, collectionScope.scope, 'photos', reportError);
  const shoppingState = useWeddingCollection<ShoppingItem>(collectionScope.weddingId, collectionScope.scope, 'shopping', reportError);
  const checklistState = useWeddingCollection<ChecklistItem>(collectionScope.weddingId, collectionScope.scope, 'checklists', reportError);
  const teamState = useWeddingCollection<TeamMember>(collectionScope.weddingId, collectionScope.scope, 'team', reportError);
  const { items: budgetItems, setItems: setBudgetItems } = budgetState;
  const { items: tasks, setItems: setTasks } = taskState;
  const { items: vendors, setItems: setVendors } = vendorState;
  const { items: guests, setItems: setGuests } = guestState;
  const { items: moodboards, setItems: setMoodboards } = moodboardState;
  const { items: photos, setItems: setPhotos } = photoState;
  const { items: shoppingItems, setItems: setShoppingItems } = shoppingState;
  const { items: checklistItems, setItems: setChecklistItems } = checklistState;
  const { items: teamMembers, setItems: setTeamMembers } = teamState;
  const collections = [budgetState, taskState, vendorState, guestState, moodboardState, photoState, shoppingState, checklistState, teamState];
  const loading = workspace.authLoading || workspace.loading || collections.some(state => state.loading);
  const hasWorkspace = !!currentUser && !!wedding.id && !loading;
  const saving = workspace.pending > 0 || collections.some(state => state.pending);

  const handleSelectWedding = (id: string) => {
    workspace.selectWedding(id);
    setActiveSide('all');
  };

  // URL query parameter detection for shared invite links (e.g. ?join=...&code=RR-KH27)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const joinParam = params.get('join');
      const codeParam = params.get('code');
      const sideParam = params.get('side');

      if (joinParam || codeParam) {
        if (codeParam) setJoinCodeInitial(codeParam.toUpperCase());
        if (sideParam === 'ladkiwale' || sideParam === 'ladkewale' || sideParam === 'mutual') setJoinSideInitial(sideParam);
        setIsJoinModalOpen(true);
      }
    }
  }, []);

  // Budget Auto-Sync with Vendors
  const handleSyncVendors = () => {
    setBudgetItems(prev => {
      let updated = [...prev];
      vendors.forEach(vendor => {
        const existingIndex = updated.findIndex(b => b.title.toLowerCase().includes(vendor.name.toLowerCase()));
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            estimatedAmount: vendor.totalQuotation,
            paidAmount: vendor.advancePaid,
            paymentStatus: vendor.advancePaid >= vendor.totalQuotation ? 'fully_paid' : vendor.advancePaid > 0 ? 'advance_paid' : 'unpaid',
            updatedAt: new Date().toISOString(),
          };
        } else {
          updated.push({
            id: `b-v-${vendor.id}`,
            weddingId: wedding.id,
            title: `${vendor.name} (${vendor.category})`,
            category: (vendor.category as any) || 'other',
            event: vendor.eventsCovered[0] || 'shaadi',
            estimatedAmount: vendor.totalQuotation,
            actualAmount: vendor.totalQuotation,
            paidAmount: vendor.advancePaid,
            side: vendor.side,
            paymentStatus: vendor.advancePaid >= vendor.totalQuotation ? 'fully_paid' : vendor.advancePaid > 0 ? 'advance_paid' : 'unpaid',
            notes: `Auto-synced from Vendor Directory. Contact: ${vendor.contactPerson} (${vendor.phone})`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      return updated;
    });
  };

  // CRUD: Budget
  const handleAddBudget = (item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: BudgetItem = {
      ...item,
      weddingId: wedding.id,
      id: `b-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgetItems(prev => [newItem, ...prev]);
  };

  const handleUpdateBudget = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
  };

  const handleDeleteBudget = (id: string) => {
    setBudgetItems(prev => prev.filter(b => b.id !== id));
  };

  // CRUD: Tasks
  const handleAddTask = (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: TaskItem = {
      ...task,
      weddingId: wedding.id,
      id: `t-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = (t.status === 'done' || t.status === 'completed') ? 'not_started' : 'done';
        return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  // CRUD: Vendors
  const handleAddVendor = (vendor: Omit<VendorItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVendor: VendorItem = {
      ...vendor,
      weddingId: wedding.id,
      id: `v-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVendors(prev => [newVendor, ...prev]);
  };

  const handleUpdateVendor = (id: string, updates: Partial<VendorItem>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v));
  };

  const handleDeleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  // CRUD: Guests
  const handleAddGuest = (guest: Omit<GuestItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGuest: GuestItem = {
      ...guest,
      weddingId: wedding.id,
      id: `g-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGuests(prev => [newGuest, ...prev]);
  };

  const handleUpdateGuest = (id: string, updates: Partial<GuestItem>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
  };

  const handleDeleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  // CRUD: Moodboards
  const handleUpdateMoodboard = (id: string, updates: Partial<MoodboardItem>) => {
    setMoodboards(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
  };

  // CRUD: Photos
  const handleAddPhoto = (photo: Omit<AlbumPhotoItem, 'id' | 'uploadedAt' | 'likes'>) => {
    const newPhoto: AlbumPhotoItem = {
      ...photo,
      weddingId: wedding.id,
      id: `p-${crypto.randomUUID()}`,
      uploadedAt: new Date().toISOString(),
      likes: 1,
    };
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const handleLikePhoto = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // CRUD: Shopping
  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      weddingId: wedding.id,
      id: `s-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    setShoppingItems(prev => [newItem, ...prev]);
  };

  const handleUpdateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(s => s.id !== id));
  };

  // CRUD: Checklists
  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(c => c.id === id ? { ...c, isChecked: !c.isChecked } : c));
  };

  const handleAddChecklistItem = (item: Omit<ChecklistItem, 'id'>) => {
    const newItem: ChecklistItem = {
      ...item,
      id: `c-${crypto.randomUUID()}`,
    };
    setChecklistItems(prev => [newItem, ...prev]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(c => c.id !== id));
  };

  // CRUD: Team Members
  const handleAddTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `tm-${crypto.randomUUID()}`,
    };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  // Quick Add Action Dispatcher
  const handleQuickAddAction = (action: 'task' | 'expense' | 'guest' | 'shopping' | 'celebration' | 'invite') => {
    switch (action) {
      case 'task':
        setActiveTab('tasks');
        break;
      case 'expense':
        setActiveTab('budget');
        break;
      case 'guest':
        setActiveTab('guests');
        break;
      case 'shopping':
        setActiveTab('shopping');
        break;
      case 'celebration':
        setActiveTab('moodboards');
        break;
      case 'invite':
        setActiveTab('people');
        break;
    }
  };

  // Pending tasks calculation for sidebar badge
  const pendingTasksCount = tasks.filter(t => t.status !== 'done' && t.status !== 'completed').length;

  const tabLabels: Record<string, string> = {
    overview: 'Overview',
    moodboards: 'Events & moodboards',
    tasks: 'Tasks',
    budget: 'Money tracker',
    shopping: 'Shopping list',
    checklists: 'Couple checklists',
    guests: 'Guests',
    people: 'Our people',
    album: 'Shared digital album',
    vendors: 'Vendors directory',
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFBF7] dark:bg-[#151117] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#4E2634] selection:text-white flex">
      {workspace.error && (
        <div role="alert" className="fixed top-3 left-3 right-3 z-[70] rounded-xl bg-rose-100 p-4 text-sm text-rose-950 shadow-lg">
          Could not sync with Firebase: {workspace.error}
          <button className="ml-3 underline" onClick={workspace.clearError}>Dismiss</button>
        </div>
      )}
      {!hasWorkspace && (
        <main className="m-auto max-w-lg p-6 text-center">
          <h1 className="font-serif text-3xl">RasmReady</h1>
          <p role="status" className="my-4">
            {workspace.error ? 'Workspace could not load. Check the Firebase configuration and permissions.' : loading ? 'Loading your wedding workspace...' : currentUser ? 'Create a wedding or join with an invitation code.' : 'Sign in to plan together with your family.'}
          </p>
          {currentUser && (!loading || workspace.error) && (
            <div className="flex flex-wrap justify-center gap-3">
              <button className="rounded-xl bg-[#4E2634] px-4 py-2 text-white" onClick={() => setIsAuthModalOpen(true)}>Create a wedding</button>
              <button className="rounded-xl border px-4 py-2" onClick={() => setIsJoinModalOpen(true)}>Join Wedding</button>
              <button className="rounded-xl border px-4 py-2" onClick={() => setIsAuthModalOpen(true)}>Account</button>
            </div>
          )}
        </main>
      )}
      {hasWorkspace && currentUser && <>
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        wedding={wedding}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeSide={activeSide}
        onSideChange={setActiveSide}
        pendingTasksCount={pendingTasksCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenInviteModal={() => setIsInviteFamilyModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="min-w-0 w-full flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Bar with Breadcrumbs & Universal Action */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 dark:bg-[#1A151D]/90 backdrop-blur-md border-b border-[#EFECE6] dark:border-[#2B232E] px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Mobile Toggle, Breadcrumbs & Wedding Switcher */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                title="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Multi-Wedding Workspace Switcher */}
              <WeddingSwitcher
                currentWedding={wedding}
                currentUser={currentUser}
                joinedWeddings={joinedWeddings}
                onSelectWedding={handleSelectWedding}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
                onOpenInviteModal={() => setIsInviteFamilyModalOpen(true)}
                onOpenCreateWedding={() => setIsAuthModalOpen(true)}
              />

              <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-400 truncate">
                <ChevronRight className="w-3 h-3 text-stone-300 shrink-0" />
                <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {tabLabels[activeTab] || 'Overview'}
                </span>
              </div>
            </div>

            {/* Right: Invite, Join, User Switcher, Quick Add, Settings */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Invite Family Button (1-Click WhatsApp & Share Link) */}
              <button
                onClick={() => setIsInviteFamilyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4E2634] hover:bg-[#3D1D28] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                title="Share Wedding Link via WhatsApp to Invite Family"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite Family</span>
              </button>

              {/* Join Another Wedding */}
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E0D9CE] dark:border-[#382E3D] hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors shrink-0"
                title="Join another wedding with link or code"
              >
                <Plus className="w-3.5 h-3.5 text-[#4E2634] dark:text-[#E9D5C0]" />
                <span>Join Wedding</span>
              </button>

              {/* Active User Switcher Pill */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#EFECE6] dark:bg-[#251E28] hover:bg-[#E5DFD5] dark:hover:bg-[#2F2633] text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors border border-[#E0D9CE] dark:border-[#382E3D]"
                title="Your account"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${currentUser.isAdmin ? 'bg-[#4E2634]' : 'bg-[#8B4459]'}`}>
                  {currentUser.avatarLetter}
                </div>
                <span className="hidden sm:inline font-semibold text-stone-800 dark:text-stone-100 max-w-[90px] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-stone-400 hidden lg:inline">({currentUser.isAdmin ? 'Admin' : 'Family'})</span>
              </button>

              {/* Quick Add Button */}
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                title="Quick Add Task, Expense, or Guest"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick add</span>
              </button>

              {/* Edit Wedding Modal */}
              <button
                disabled={!currentUser.isAdmin}
                onClick={() => setIsWeddingModalOpen(true)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-[#EFECE6] dark:hover:bg-[#251E28] transition-colors"
                title="Edit Wedding Details"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-[#EFECE6] dark:hover:bg-[#251E28] transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
              </button>

              {/* First-time Guide */}
              <button
                onClick={() => setIsWelcomeOpen(true)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-[#EFECE6] dark:hover:bg-[#251E28] transition-colors"
                title="First-Time Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* View Content Body */}
        <main key={wedding.id} className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <p role="status" className="mb-3 text-xs text-stone-500">{saving ? 'Saving changes...' : 'Shared wedding workspace'}</p>
          {activeTab === 'overview' && (
            <OverviewView
              wedding={wedding}
              budgetItems={budgetItems}
              tasks={tasks}
              vendors={vendors}
              guests={guests}
              activeSide={activeSide}
              onNavigateTab={setActiveTab}
              onSideChange={setActiveSide}
              onQuickAdd={(action) => handleQuickAddAction(action)}
              onToggleTask={handleToggleTaskStatus}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'moodboards' && (
            <MoodboardsView
              moodboards={moodboards}
              activeSide={activeSide}
              onUpdateMoodboard={handleUpdateMoodboard}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              activeSide={activeSide}
              onAdd={handleAddTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              budgetItems={budgetItems}
              activeSide={activeSide}
              onAdd={handleAddBudget}
              onUpdate={handleUpdateBudget}
              onDelete={handleDeleteBudget}
              onSyncVendors={handleSyncVendors}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingListView
              items={shoppingItems}
              activeSide={activeSide}
              onAdd={handleAddShoppingItem}
              onUpdate={handleUpdateShoppingItem}
              onDelete={handleDeleteShoppingItem}
            />
          )}

          {activeTab === 'checklists' && (
            <CoupleChecklistsView
              wedding={wedding}
              items={checklistItems}
              onToggleItem={handleToggleChecklistItem}
              onAddItem={handleAddChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsView
              wedding={wedding}
              tasks={tasks}
              guests={guests}
              activeSide={activeSide}
              onAdd={handleAddGuest}
              onUpdate={handleUpdateGuest}
              onDelete={handleDeleteGuest}
            />
          )}

          {activeTab === 'people' && (
            <OurPeopleView
              members={teamMembers}
              activeSide={activeSide}
              onAddMember={handleAddTeamMember}
              onDeleteMember={handleDeleteTeamMember}
              onNavigateToTasksForMember={() => setActiveTab('tasks')}
              onOpenShareInviteModal={() => setIsInviteFamilyModalOpen(true)}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              activeSide={activeSide}
              onAdd={handleAddVendor}
              onUpdate={handleUpdateVendor}
              onDelete={handleDeleteVendor}
            />
          )}

          {activeTab === 'album' && (
            <PhotoVaultView
              photos={photos}
              activeSide={activeSide}
              onAddPhoto={handleAddPhoto}
              onLikePhoto={handleLikePhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#EFECE6] dark:border-[#27212A] bg-[#FAF7F2] dark:bg-[#1A151D] py-4 px-6 text-center text-xs text-stone-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span className="font-serif font-medium text-[#38232B] dark:text-stone-200">
              🪷 Har taiyaari, apno ke saath.
            </span>
            <span className="text-[11px] text-stone-400">
              Shared wedding workspace for {wedding.brideName} &amp; {wedding.groomName} · {wedding.location}
            </span>
          </div>
        </footer>

      </div>
      </>}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleQuickAddAction}
      />

      {/* First-time User Welcome Modal */}
      <WelcomeModal
        isOpen={hasWorkspace && isWelcomeOpen}
        onClose={handleCloseWelcome}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          handleCloseWelcome();
        }}
      />

      {/* Wedding Configuration Edit Modal */}
      {isWeddingModalOpen && <WeddingEditModal
        isOpen={isWeddingModalOpen}
        wedding={wedding}
        onClose={() => setIsWeddingModalOpen(false)}
        onSave={(updated) => setWedding(updated)}
      />}

      {/* Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || (!workspace.authLoading && !currentUser)}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        wedding={wedding}
        onSelectWedding={handleSelectWedding}
        onError={reportError}
        joiningWedding={isJoinModalOpen}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      {/* Invite Family Modal (WhatsApp 1-Click Link & Code Generator) */}
      <InviteFamilyModal
        isOpen={hasWorkspace && isInviteFamilyModalOpen}
        onClose={() => setIsInviteFamilyModalOpen(false)}
        wedding={wedding}
      />

      {/* Join Wedding Modal (Direct Member Sign-Up & Multi-Wedding Enrollment) */}
      <JoinWeddingModal
        isOpen={!!currentUser && isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        currentUser={currentUser}
        onSelectWedding={handleSelectWedding}
        initialCode={joinCodeInitial}
        initialSide={joinSideInitial}
      />

    </div>
  );
}
