# Shubh Vivaah — Indian Wedding Planning & Collaboration Platform

An end-to-end Indian wedding planning suite that harmonizes the celebrations of both the Bride's family (*Ladkiwale*) and the Groom's family (*Ladkewale*). It integrates multi-event ceremonies, side-specific and split budget tracking, family delegation, vendor management, event-level RSVPs with Indian dietary preferences (Jain, Pure Veg), per-function moodboards, a wedding countdown, and a shared digital photo album.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural blueprint incorporates the confirmed choice of a **Joint Planner with Ladkiwale and Ladkewale split tracking**. Every module supports filtering and attributing actions to either the Bride's side, Groom's side, or Jointly shared.

- **Confirmed Decision (Family & Budget Split)**: Both families collaborate in a unified workspace with clear attribution (`side: 'ladkiwale' | 'ladkewale' | 'shared'`). Budgets and expenses track who committed, paid advances, and remains accountable.
- **Data Persistence Architecture**: Cloud Firestore with a strongly typed schema (`firebase-blueprint.json` and hardened `firestore.rules`), backed by full CRUD operations and local responsive state fallback for real-time responsiveness.
- **Indian Wedding Ceremonies Included**: Pre-configured support for traditional celebrations: *Roka / Sagan, Mehendi, Haldi, Sangeet, Baraat & Pheras (Vivaah), Vidai, and Reception*, with customizable dates and venues.

---

### 1. Overview & Core Concept

- **What It Does**: A complete Indian wedding preparation platform enabling couples and their extended families (Parents, Chacha, Mama, Bhabhi, Maasi, bridesmaids, groomsmen) to manage vendor contracts, split finances, assign ritual chores, curate visual aesthetics for each ceremony, collect guest RSVPs with dietary/stay details, track the countdown to the *Muhurat*, and capture moments in a shared digital album.
- **Target Audience / Persona**: Indian couples, wedding coordinators, and family elders managing 2 to 5-day destination or city weddings with 200–1,500+ guests.
- **Key Value**: Eliminates the chaotic multi-WhatsApp group confusion and fragmented Excel spreadsheets by establishing single-source-of-truth accountability between both sides of the family.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Aesthetic Direction**: Royal Indian heritage meets refined contemporary elegance. Inspired by royal Rajputana and Mughal wedding artistry, marigold festivity, and raw silk textures, styled with strict anti-slop typography and zero-pill discipline.
- **Color Palette**:
  - *Dominant Canvas (60%)*: Warm Ivory Linen (`#FCFBF7`) in light mode; Obsidian Silk (`#121113`) in dark mode.
  - *Structural Surfaces (30%)*: Subdued Sandstone (`#F4EFEA`) and Warm Card Surface (`#FFFFFF` / `#1C1A1E`), with subtle hairline borders (`#E7DFD5` / `#2D2830`).
  - *High-Intent Accents (10%)*: 
    - Royal Sindoor / Deep Crimson (`#9F1239` / `#881337`) for primary actions and bridal motifs.
    - Festive Marigold & Antique Gold (`#D97706` / `#B45309`) for celebratory highlights and countdown numerals.
    - Henna Emerald (`#065F46`) for Mehendi-specific cues and verified confirmations.
- **Typography & Hierarchy**:
  - *Display Headings*: `Playfair Display` or `Outfit` for regal, balanced titles.
  - *Body Prose*: `Plus Jakarta Sans` for effortless readability across tasks, vendor notes, and guest tables.
  - *Financial & Date Metrics*: `tabular-nums font-mono` for all Indian Rupee (`₹`) amounts, guest headcounts, and countdown timers.
- **Zero-Pill & Metadata Discipline**: Tags like `Ladkiwale`, `Ladkewale`, `Pure Veg`, `Jain`, and `Pending` render as quiet unboxed text separated by typographic middots (`·`). Interactive filter switches use clean segmented tab controls.

#### Key User Flows & Modules
1. **Header & Countdown Bar**:
   - Live countdown timer to the wedding date / *Pheras Muhurat* (Days, Hours, Minutes, Seconds).
   - Global Side Switcher: Toggle view between `All Events & Items`, `Ladkiwale (Bride)`, and `Ladkewale (Groom)`.
2. **Budget & Expense Ledger**:
   - Total Estimated vs. Actual Paid with side-by-side comparison (Ladkiwale vs Ladkewale vs 50/50 Shared).
   - Summary cards: Total Budget, Paid Advances, Pending Due, and Side Contributions.
   - Categorized by functions (e.g. Sangeet DJ, Mandap Floral Decor, Gold/Jewelry, Catering per plate).
   - Modal to Add / Edit / Delete line items with invoice notes and payment status.
3. **Tasks & Family Delegation**:
   - Checklist organized by Ceremony & Timeline (e.g. 3 Months Before, Wedding Week, Day of Pheras).
   - Assignee selection with Indian family titles (e.g., *Mama ji - Baraat Welcome*, *Chachi ji - Mithai Boxes*, *Friends - Joota Chupai*, *Bhabhi - Haldi Prep*).
   - Status toggles: `To Do`, `In Progress`, `Completed`.
4. **Vendor Directory**:
   - Dedicated vendor categories: *Pandit Ji / Purohit, Mehendi Artists, Catering & Sweet Stalls, Photography & Cinematography, Decor & Floral Mandap, Dhol & DJ / Sangeet Choreographer, Bridal Couture & Makeup (MUA), Transport / Baraat Ghodi/Car*.
   - Contract amount, token advance paid, balance due, contact person, WhatsApp quick-message, and notes.
5. **Guest List & Multi-Event RSVP**:
   - Guest details: Name, side (`Ladkiwale` / `Ladkewale` / `Mutual`), contact number, plus-ones.
   - Function-level invites (e.g. guest only invited to Reception vs all rituals).
   - Dietary preferences: `Pure Veg`, `Jain (No Onion/Garlic)`, `Non-Veg`, `Swaminarayan / Special`.
   - Logistics: Room / Hotel Stay required (`Yes/No`), airport pickup needed.
   - WhatsApp invite link generator with pre-formatted personalized message.
6. **Ceremony Moodboards**:
   - Dedicated visual cards per function: *Haldi (Sunny Marigold & Yellow)*, *Mehendi (Henna Green & Boho Terracotta)*, *Sangeet (Glam Navy & Mirror Work)*, *Pheras (Regal Crimson & Gold Floral)*, *Reception (Black Tie / Champagne)*.
   - Color swatches, dress codes, decor themes, song playlists/notes, and image inspirations.
7. **Digital Photo Vault**:
   - Shared gallery categorized by ceremony.
   - Upload & caption capability, memory download, and viewer modal.

---

### 3. Key Product Decisions & Trade-Offs

- **Firestore Collections Structure**:
  - We use first-class collections for `'weddings'`, `'budget'`, `'tasks'`, `'vendors'`, `'guests'`, and `'moodboards'`.
  - Every document contains an indexed `side` attribute (`'ladkiwale' | 'ladkewale' | 'shared'`) and a `weddingId` reference for multi-tenant scalability.
- **Real-Time Synchronicity & ABAC Security**:
  - Firestore security rules enforce Attribute-Based Access Control, ensuring that family members can create and update tasks or view their assigned items while preventing accidental deletion of master wedding records.
- **Indian Financial Nuance**:
  - Supports standard Indian numbering formats (`₹ Lakhs` and `₹ Crores` as well as full formatted numeric inputs with `Intl.NumberFormat('en-IN')`).

---

### 4. Technical Architecture & Firestore Data Strategy

#### Component & System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Shubh Vivaah Top Bar                            │
│  [Couple Names: Priya & Rohan] ── [Countdown: 42d 14h 32m] ── [Side]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴────────────────────────────────┐
    │ Navigation Tabs: [Overview] [Budget] [Tasks] [Vendors]        │
    │                  [Guests & RSVP] [Moodboards] [Photo Album]    │
    └───────────────────────────────┬────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ Budget View  │             │ Tasks & Team │             │ Guests & RSVP│
│ - Totals     │             │ - By Function│             │ - Side Filter│
│ - Split View │             │ - Family Role│             │ - Diet (Jain)│
│ - Due Dates  │             │ - Assignee   │             │ - WhatsApp   │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Firestore SDK Integration / Offline Cache                 │
│      Collections: budget | tasks | vendors | guests | moodboards       │
│      Security: strict rules on `side`, `weddingId`, and timestamps     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Firestore Data Schema Specification

##### 1. `weddings/{weddingId}`
```typescript
interface WeddingDocument {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO 8601
  location: string;
  currency: string; // 'INR'
  primarySide: 'ladkiwale' | 'ladkewale' | 'joint';
  createdAt: string;
  updatedAt: string;
}
```

##### 2. `budget/{budgetId}`
```typescript
interface BudgetItemDocument {
  id: string;
  weddingId: string;
  title: string;
  category: 'venue' | 'catering' | 'decor' | 'photography' | 'attire' | 'jewelry' | 'entertainment' | 'pandit' | 'gifts' | 'logistics' | 'other';
  event: 'all' | 'roka' | 'mehendi' | 'haldi' | 'sangeet' | 'shaadi' | 'reception';
  estimatedAmount: number; // in INR
  actualAmount: number;
  paidAmount: number;
  side: 'ladkiwale' | 'ladkewale' | 'shared'; // Distinguishes family obligation
  splitRatioLadkiwale?: number; // e.g., 50 for 50-50 split
  splitRatioLadkewale?: number; // e.g., 50
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  vendorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

##### 3. `tasks/{taskId}`
```typescript
interface TaskDocument {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  event: 'general' | 'roka' | 'mehendi' | 'haldi' | 'sangeet' | 'shaadi' | 'reception';
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedSide: 'ladkiwale' | 'ladkewale' | 'shared'; // Side responsible
  assignedToName: string; // e.g. "Vikram Mama", "Neha Bhabhi", "Anjali"
  assignedFamilyRole?: string; // e.g., "Mama", "Chacha", "Bhabhi", "Maasi", "Bridesmaid", "Groomsman"
  assignedToPhone?: string;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
```

##### 4. `vendors/{vendorId}`
```typescript
interface VendorDocument {
  id: string;
  weddingId: string;
  name: string;
  category: 'pandit' | 'mehendi_artist' | 'catering' | 'photography' | 'decor' | 'dhol_dj' | 'makeup_mua' | 'attire' | 'invitations' | 'venue' | 'transport';
  contactPerson: string;
  phone: string;
  email?: string;
  side: 'ladkiwale' | 'ladkewale' | 'shared'; // Who hired / manages the vendor
  eventsCovered: string[]; // ['haldi', 'mehendi', 'sangeet', 'shaadi']
  totalQuotation: number;
  advancePaid: number;
  balanceDue: number;
  status: 'shortlisted' | 'booked' | 'completed' | 'cancelled';
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

##### 5. `guests/{guestId}`
```typescript
interface GuestDocument {
  id: string;
  weddingId: string;
  name: string;
  phone: string;
  email?: string;
  side: 'ladkiwale' | 'ladkewale' | 'mutual'; // Bride or Groom side guest
  familyGroup: string; // e.g., "Sharma Family", "College Friends", "Kanpur Relatives"
  relation: string; // e.g., "Mama Ji", "College Friend", "Colleague"
  adultsCount: number;
  kidsCount: number;
  eventsInvited: string[]; // e.g. ['mehendi', 'sangeet', 'shaadi', 'reception']
  eventsAttending: string[];
  rsvpStatus: 'pending' | 'attending' | 'declined' | 'tentative';
  dietaryPreference: 'pure_veg' | 'jain' | 'non_veg' | 'swaminarayan' | 'standard';
  hotelStayRequired: boolean;
  roomAllocated?: string;
  pickupRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

##### 6. `moodboards/{moodboardId}`
```typescript
interface MoodboardDocument {
  id: string;
  weddingId: string;
  event: 'roka' | 'mehendi' | 'haldi' | 'sangeet' | 'shaadi' | 'reception';
  title: string;
  themeDescription: string;
  colorPalette: string[]; // Hex codes e.g. ['#F59E0B', '#D97706', '#FEF3C7']
  dressCodeAdvice: {
    ladkiwale: string; // e.g. "Yellow Lehengas & Floral Jewelry"
    ladkewale: string; // e.g. "Mustard Kurtas & Nehru Jackets"
  };
  keyDecorElements: string[]; // ['Marigold garlands', 'Brass Urlis with rose petals', 'Phoolon ki Chaadar']
  musicPlaylistNotes?: string;
  images: Array<{
    url: string;
    caption: string;
    tag: 'attire' | 'decor' | 'stage' | 'entry' | 'floral';
  }>;
  updatedAt: string;
}
```

##### 7. `albums/{photoId}`
```typescript
interface AlbumPhotoDocument {
  id: string;
  weddingId: string;
  event: 'roka' | 'mehendi' | 'haldi' | 'sangeet' | 'shaadi' | 'reception' | 'candid';
  side: 'ladkiwale' | 'ladkewale' | 'shared';
  imageUrl: string;
  caption: string;
  uploadedByName: string;
  uploadedAt: string;
  likes: number;
}
```

---

### 5. Implementation Roadmap Upon Approval

1. **Phase 1: Firebase Configuration & Blueprint**:
   - Setup `firebase-blueprint.json` with the exact schema above.
   - Configure Firestore rules ensuring proper ABAC and safe write limits.
2. **Phase 2: Core State & Seed Data**:
   - Provide an authentic Indian wedding mock dataset (Rohan & Priya's Vivaah) so the user experiences rich data right out of the box with realistic amounts in INR (₹), Indian family roles, and traditional ceremonies.
3. **Phase 3: Multi-Module Views & Working CRUD Handlers**:
   - Responsive Header with Countdown & Ladkiwale/Ladkewale global filter.
   - Budget Tracker with split calculator and payment status toggles.
   - Task Board with family member assignment & status controls.
   - Vendor Manager with quick WhatsApp click-to-chat links.
   - Guest & RSVP Tracker with function selection, dietary badges (Jain/Pure Veg), and room stay markers.
   - Per-Event Moodboard with color palettes, dress codes, and decor ideas.
   - Shared Digital Photo Album with ceremony filters and photo upload modal.
4. **Phase 4: Verification & Polish**:
   - Build compilation and linting verification.
   - Dual-theme (Light/Dark) compatibility and mobile responsiveness.
