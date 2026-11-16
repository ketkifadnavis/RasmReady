export type SideFilter = 'all' | 'ladkiwale' | 'ladkewale';

export type CeremonyEvent = 'all' | 'general' | 'roka' | 'mehendi' | 'haldi' | 'sangeet' | 'shaadi' | 'reception';

export type BudgetCategory = 
  | 'venue' 
  | 'catering' 
  | 'decor' 
  | 'photography' 
  | 'attire' 
  | 'jewelry' 
  | 'entertainment' 
  | 'dhol_dj'
  | 'mehendi_artist'
  | 'invitations'
  | 'pandit' 
  | 'gifts' 
  | 'logistics' 
  | 'other';

export type PaymentStatus = 'unpaid' | 'advance_paid' | 'fully_paid';

export interface BudgetItem {
  id: string;
  weddingId: string;
  title: string;
  category: BudgetCategory;
  event: CeremonyEvent;
  estimatedAmount: number; // in INR
  actualAmount: number;
  paidAmount: number;
  side: 'ladkiwale' | 'ladkewale' | 'shared';
  splitRatioLadkiwale?: number; // percentage
  splitRatioLadkewale?: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'done' | 'todo' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  event: CeremonyEvent;
  status: TaskStatus;
  priority: TaskPriority;
  assignedSide: 'ladkiwale' | 'ladkewale' | 'shared';
  assignedToName: string;
  assignedFamilyRole?: string; // e.g. "Mama Ji", "Chachi Ji", "Bhabhi", "Maasi", "Bridesmaid", "Groomsman"
  assignedToPhone?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type VendorCategory = 
  | 'pandit' 
  | 'mehendi_artist' 
  | 'catering' 
  | 'photography' 
  | 'decor' 
  | 'dhol_dj' 
  | 'makeup_mua' 
  | 'attire' 
  | 'invitations' 
  | 'venue' 
  | 'transport';

export type VendorStatus = 'shortlisted' | 'booked' | 'completed' | 'cancelled';

export interface VendorItem {
  id: string;
  weddingId: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  side: 'ladkiwale' | 'ladkewale' | 'shared';
  eventsCovered: CeremonyEvent[];
  totalQuotation: number;
  advancePaid: number;
  balanceDue: number;
  status: VendorStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DietaryPreference = 'pure_veg' | 'jain' | 'non_veg' | 'swaminarayan' | 'standard';
export type RSVPStatus = 'pending' | 'attending' | 'declined' | 'tentative';

export interface GuestItem {
  id: string;
  weddingId: string;
  name: string;
  phone: string;
  email?: string;
  side: 'ladkiwale' | 'ladkewale' | 'mutual';
  familyGroup: string;
  relation: string;
  adultsCount: number;
  kidsCount: number;
  eventsInvited: CeremonyEvent[];
  eventsAttending: CeremonyEvent[];
  rsvpStatus: RSVPStatus;
  dietaryPreference: DietaryPreference;
  hotelStayRequired: boolean;
  roomAllocated?: string;
  pickupRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodboardItem {
  id: string;
  weddingId: string;
  event: CeremonyEvent;
  title: string;
  themeDescription: string;
  colorPalette: string[];
  dressCodeAdviceLadkiwale: string;
  dressCodeAdviceLadkewale: string;
  keyDecorElements: string[];
  musicPlaylistNotes?: string;
  images: Array<{
    url: string;
    caption: string;
    tag?: string;
  }>;
  updatedAt: string;
}

export interface AlbumPhotoItem {
  id: string;
  weddingId: string;
  event: CeremonyEvent;
  side: 'ladkiwale' | 'ladkewale' | 'shared';
  imageUrl: string;
  caption: string;
  uploadedByName: string;
  uploadedAt: string;
  likes: number;
}

export interface WeddingConfig {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO string e.g. 2026-12-14T18:30:00
  muhuratTime?: string;
  location: string;
  currency: string;
  primarySide: 'ladkiwale' | 'ladkewale' | 'joint';
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  weddingId: string;
  name: string;
  event: CeremonyEvent;
  personInCharge: string;
  quantity: number;
  estimatedCost: number;
  referenceLink?: string;
  isBought: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'outfits' | 'jewellery' | 'essentials' | 'rituals' | 'groom_attire' | 'groom_accessories';
  target: 'bride' | 'groom' | 'both';
  event?: CeremonyEvent;
  notes?: string;
  isChecked: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  relation: string;
  avatarLetter: string;
  isPartner?: boolean;
  tasksCount?: number;
}

export interface WeddingMembership {
  weddingId: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  location: string;
  muhuratTime?: string;
  userRole: string; // e.g. "Bride (Owner & Admin)", "Mama Ji (Logistics)", "Sister / Bridesmaid"
  userSide: 'ladkiwale' | 'ladkewale' | 'mutual';
  isAdmin: boolean;
  inviteCode: string;
  logoUrl?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  side: 'ladkiwale' | 'ladkewale' | 'mutual';
  role: string;
  isAdmin: boolean;
  avatarLetter: string;
  activeWeddingId?: string;
  weddings?: WeddingMembership[];
}

