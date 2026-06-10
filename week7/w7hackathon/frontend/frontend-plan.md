# POS & Inventory Management System - Implementation Plan

**Project:** Production-grade POS & Inventory Management System  
**Stack:** Next.js 15 (App Router) + Material UI v5 + RTK Query + TypeScript  
**Current State:** Minimal Next.js starter, zero infrastructure  
**Target:** Fully functional multi-page system with auth, state management, and real-time data sync

---

## Phase 1: Project Setup & Dependencies

### 1.1 Install Core Dependencies

- **Material UI:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- **State Management:** `@reduxjs/toolkit`, `react-redux`, `@tanstack/react-query` (RTK Query included in toolkit)
- **Form Management:** `react-hook-form`, `zod` (validation)
- **Date Handling:** `date-fns` (date formatting, range selection)
- **Charts:** `@mui/x-charts` (MUI native charting, or `recharts` as alternative)
- **Utilities:** `js-cookie` (JWT token storage), `axios` (optional HTTP client wrapper)

### 1.2 Update `tsconfig.json`

- Ensure `strict: true`
- Verify path aliases: `@/*` → `./src/*`
- Add: `"skipLibCheck": true, "forceConsistentCasingInFileNames": true`

### 1.3 Update `next.config.ts`

- No special config needed initially, but prepare for future features (image optimization, etc.)

---

## Phase 2: Core Architecture & Infrastructure

### 2.1 TypeScript Types (`src/types/index.ts`)

Define complete type model matching the prompt:

- `RawMaterial` (id, name, unit, currentStock, minAlertLevel, costPerUnit, createdAt, updatedAt)
- `Product` (id, name, category, price, description, imageUrl, status, recipe[], **availableStock: calculated by backend**, **limitedBy?: string** — name of limiting raw material)
- `ProductRecipeItem` (id, rawMaterialId, quantity, unit, rawMaterialName?, rawMaterialCurrentStock?)
- `ProductSummary` — for dashboard "products at risk": id, name, **canMake: number**, **requiredMaterials: {materialName, need, have, shortage}[]**
- `Order` (id, orderNumber, timestamp, items[], subtotal, tax, discount, total, paymentMethod, changeGiven, customerName, processedBy, status)
- `OrderLineItem` (id, productId, quantity, unitPrice, lineTotal)
- `DashboardSummary` (totalSalesToday, ordersToday, totalProducts, lowStockAlertCount, **productsAtRisk: ProductSummary[]**, chartData, inventoryStatus[])
- `StockHistoryEvent` (id, timestamp, eventType: "Sale"|"Restock"|"Manual", materialId, quantityChange, resultingStock, reference: string)
- `User` (id, email, name, role: "admin"|"cashier", status, createdAt)
- `AppConfig` (businessName, currencySymbol, taxRate, emailAlerts, alertEmail)

### 2.2 Redux Store Setup (`src/store/store.ts`)

```
- configureStore with RTK Query middleware
- Setup api slices with apiSlice as base
- Initialize state shape (cart, user, theme, notifications)
```

### 2.3 RTK Query API Slices

Create modular slices in `src/store/api/`:

**rawMaterialsApi.ts**

- getAll() — paginated, filterable
- getById(id)
- create(payload)
- update(id, payload)
- restock(id, quantity)
- delete(id)
- getHistory(id) — stock history
- bulkRestock(payload)

**productsApi.ts**

- getAll() — includes availableStock
- getById(id) — includes full recipe
- create(payload)
- update(id, payload)
- delete(id)
- duplicate(id)
- getByBarcode(barcode) — scanner support

**ordersApi.ts**

- getAll(filters) — date range, payment method, cashier
- getById(id)
- create(payload) — POS sale completion
- void(id) — void order, restore stock
- export(dateRange) — CSV export

**dashboardApi.ts**

- getSummary(dateRange) — KPI cards, chart data, inventory status
- Setup polling: `pollingInterval: 60000` (60 seconds)

**authApi.ts** (for JWT-based custom auth)

- login(email, password)
- logout()
- refresh() — refresh JWT token
- verifyToken() — check if token is valid

**settingsApi.ts**

- getConfig()
- updateGeneral(payload)
- updateNotifications(payload)
- changePassword(payload)
- getUsers()
- inviteUser(payload)
- updateUser(id, payload)

### 2.4 CRITICAL ARCHITECTURE PRINCIPLE: Backend-Driven Stock Calculation

**This system is raw-material-driven, not product-stocked.**

The frontend MUST NEVER calculate product availability:

- **NEVER** store `productStock` as a database field
- **NEVER** calculate "available units" on the frontend
- **ALWAYS** treat `availableStock` as a backend-computed field

**How it works:**

1. Backend stores ONLY raw material quantities
2. When product is fetched, backend calculates: `availableStock = MIN(stock[mat1] / recipe[mat1].qty, stock[mat2] / recipe[mat2].qty, ...)`
3. Frontend receives `availableStock` in API response and displays it
4. When sale is completed:
   - Frontend sends order to backend
   - Backend validates stock is still sufficient (prevents race conditions)
   - Backend deducts raw materials
   - Frontend receives updated product with new `availableStock` via cache invalidation

**Why this matters:**

- Race condition prevention: two users can't sell the same product simultaneously
- Audit trail: raw materials are the source of truth
- Flexibility: can change recipes without losing sales history
- Multi-warehouse support: easy to add location-based stock later

**Frontend responsibilities:**

- Display `availableStock` as-is from backend
- Show tooltip/hint: "Limited by [Material]" when hovering
- Handle errors if sale fails due to insufficient stock
- Show real-time preview while editing recipes

**What NOT to do:**

- Don't calculate stock client-side
- Don't assume frontend state is accurate (always request fresh data from API)
- Don't allow selling products with insufficient raw materials
- Don't store intermediate calculation results

**SAFETY RULE: Products without recipes are unsellable**

- Every product MUST have at least one recipe item (enforced in ProductForm validation)
- Backend returns `availableStock = 0` for products with empty recipes
- POS prevents adding products with no recipe (disabled button)
- Dashboard "Products at Risk" includes products with missing recipes (show warning)

### 2.5 Tag-Based Cache Invalidation

Document complete `invalidatesTags` → mutation map. This ensures frontend always reflects backend state:

```
Sale completion → invalidate: Products, RawMaterials, Orders, Dashboard
Void order → invalidate: Orders, RawMaterials, Dashboard
Restock material → invalidate: RawMaterials, Dashboard, Products
Add/Edit product → invalidate: Products, Dashboard
Delete raw material → invalidate: RawMaterials, Products, Dashboard
Update settings → invalidate: Dashboard
```

### 2.6 Auth Utility (`src/lib/auth.ts`)

- `setToken(token)` — store JWT in cookie + localStorage
- `getToken()` — retrieve token
- `clearToken()` — logout
- `isTokenExpired(token)` — check expiry
- `refreshAccessToken()` — RTK Query mutation call
- Type: `AuthToken { accessToken, expiresIn, refreshToken? }`

### 2.7 API Client Configuration (`src/lib/apiClient.ts`)

- Base URL from `process.env.NEXT_PUBLIC_API_BASE_URL`
- If not set: use mock data mode (RTK Query mocks enabled)
- Axios/fetch wrapper with interceptor for JWT injection
- Error handling: 401 → refresh token → retry; 5xx → error snackbar

### 2.8 Middleware (`src/middleware.ts`)

- Protect all routes except `/login`
- Verify JWT in request (check token exists, not expired)
- If invalid → redirect to `/login`
- If unauthenticated user → `/login` always

---

## Phase 3: Theme & Global Styling

### 3.1 MUI Theme (`src/theme/theme.ts`)

- Create `createTheme()` with:
  - Palette: primary (blue), secondary (purple), error (red), warning (amber), success (green)
  - Typography: using Geist fonts
  - Component overrides:
    - `MuiButton`: default variants (contained, outlined, text)
    - `MuiTable`: striped rows, sticky header
    - `MuiDialog`: responsive fullScreen on mobile (xs)
    - `MuiDrawer`: 240px desktop, full-width mobile
  - Dark mode support

### 3.2 Theme Provider Setup

- Create `src/theme/ThemeProvider.tsx` component
- Manage `isDarkMode` state via Redux
- Apply to MUI `<ThemeProvider>`
- Persist preference to localStorage
- Hydration-safe (detect system preference on first load)

### 3.3 Global Styles (`src/app/globals.css`)

- Replace placeholder CSS with MUI-compatible base
- Reset default styles
- Define CSS variables for spacing, shadows
- Responsive breakpoints: 768px (mobile), 1024px (tablet)

---

## Phase 4: Shared Components Library

Build reusable components in `src/components/shared/`:

### 4.1 Layout Components

`ShellLayout.tsx` — Main layout wrapper

- Integrates Sidebar + Topbar + main content
- Responsive: sidebar hidden on mobile, bottom nav appears
- Grid layout: sidebar, topbar, main content area

`Sidebar.tsx`

- Permanent drawer (240px)
- Logo/branding at top
- Nav items with icons (Dashboard, POS, Products, Materials, Orders, Settings)
- Active item highlighting
- Collapse animation on mobile trigger

`Topbar.tsx`

- Dynamic page title from route
- Right side: notification bell (with badge), theme toggle, user avatar menu
- Responsive: slim on mobile
- Avatar menu: user name, logout button

`NotificationPopover.tsx`

- Anchors below notification bell
- Header: "Alerts" + "Mark all read"
- List of low-stock alerts (unread have background tint)
- Each alert: material name, current vs threshold, "Restock" action button
- Click alert → navigate to `/raw-materials` with row highlighted
- 360px wide, max-height 480px scrollable

### 4.2 Data Display Components

`SkeletonTable.tsx` — Loading state for tables

- Renders 5 rows of shimmer skeleton cells

`SkeletonCard.tsx` — Loading state for cards

- Rectangle shimmer matching card dimensions

`EmptyState.tsx` — Consistent empty list UI

- Icon (MUI SvgIcon or custom), message, optional CTA button

`StatusChip.tsx` — Status badge component

- Maps status string to color + icon (OK/green, Low/amber, Critical/red, Active/blue, Inactive/grey, Pending/orange, Voided/red)

### 4.3 Dialog / Modal Components

`ConfirmDialog.tsx`

- Reusable confirmation modal
- Props: title, message, confirmLabel, onConfirm, isDestructive (color)
- Dismissible via escape/backdrop
- For: delete actions, clear cart, void orders

`DirtyFormWarning.tsx`

- Auto-shows if form dirty + user tries to close
- "You have unsaved changes" confirmation
- Used in all form dialogs

### 4.4 Form Components

`FormField.tsx` — Wrapper for controlled inputs

- Integrates with React Hook Form `useController`
- Renders MUI TextField with error state
- Props: name, label, type, required, validation rules

`RichSelect.tsx` — Autocomplete/searchable select

- MUI Autocomplete wrapper
- Props: options[], loading, onSelect
- Used for raw material selection, category selection

`ImageUpload.tsx` — Product image upload

- Drag-drop zone (120x120px)
- Click to open file picker (jpg/png/webp, max 2MB)
- Preview with remove button
- Returns file + preview URL

### 4.5 Global Components

`GlobalSnackbar.tsx`

- Redux store: snackbarSlice with queue
- Hook: `useSnackbar()` → `snackbar.show(message, type)`
- Auto-dismiss for success (3s), manual dismiss for error
- Position: bottom-right desktop, bottom-center mobile

`GlobalError.tsx` — Error boundary wrapper

- Catches unhandled errors
- Shows MUI Alert with retry button
- Logs to console in dev

`BottomNavigation.tsx` — Mobile bottom nav

- Visible only on `<768px`
- 5 items: Dashboard, POS, Products, Materials, Orders
- Sticky to bottom, above safe area
- Active item highlighted

---

## Phase 5: Feature Implementation

All pages are built inside `/app` with server component shell, client component content.

### 5.1 Authentication

`/app/login/page.tsx`

- Centered card layout (no shell)
- Fields: Email, Password (with show/hide toggle), "Remember me" checkbox
- Primary "Sign In" button
- Form validation via React Hook Form + Zod
- On error: MUI Alert above form
- On success: redirect to `/dashboard`
- CSS module: `login.module.css` (card styling)

`src/hooks/useAuth.ts`

- `useAuth()` hook returns: user, isAuthenticated, login(email, password), logout()
- Manages token in Redux + localStorage
- Auto-refresh token on expiry

`src/middleware.ts` (as defined in Phase 2.7)

### 5.2 Dashboard (`/app/dashboard/page.tsx`)

**Layout:**

- Top: page title + date range control (Today / 7 Days / 30 Days / Custom)
  - Custom: two DatePicker inputs appear inline
  - Selection updates RTK Query params, refetches all data
- Grid layout: KPI row, Charts row, Inventory table

**Components:**

`KpiCard.tsx` — 4 cards in row, 2x2 on mobile

- Icon, label, primary number (large), subtext
- Cards: Total Sales Today, Orders Today, Total Products, Low Stock Alerts
- Low Stock card is clickable → navigate to `/raw-materials?filter=low`
- Each shows skeleton while loading

`SalesChart.tsx` — Line/Bar chart (7-day revenue trend)

- X: dates, Y: revenue
- Uses `@mui/x-charts` (or recharts)
- Empty state if no data: MUI Alert "No sales recorded in this period"
- Skeleton loading state

`TopProductsChart.tsx` — Horizontal bar chart (top 5 best-selling)

- Y: product name, X: units sold
- Bar click → navigate to `/products` with product details modal (nice-to-have)
- Skeleton loading state
- Empty state if no sales

`ProductsAtRiskTable.tsx` — NEW CRITICAL SECTION (Production Planning)

- Shows products that CANNOT be fully produced due to insufficient raw materials
- Columns: Product Name, Can Make (X units), Missing Material, Shortage
- Example: "Small Pizza | 0 units | Dough | Need 200g, Have 0g"
- Each row shows: product name, units achievable, which material is most limiting, exact shortage
- Click "Restock [Material]" button → navigate to `/raw-materials` with that material highlighted
- Empty state if all products can be made: "All products can be produced with current stock"
- This is essential for managers to understand production constraints

`InventoryStatusTable.tsx` — Raw materials summary

- Columns: Name, Unit, Current Stock, Min Threshold, Status chip
- Sortable by status (Low/Critical first by default)
- Paginate: show 8 rows, "View All" link → `/raw-materials`
- Each row is a link to material detail
- Skeleton loading state
- Note: This shows the SOURCE of product constraints (raw materials are what's actually stocked)

**RTK Query Integration:**

- `useDashboardGetSummaryQuery(dateRange)` — fetches KPI data
- Polling: 60 seconds
- On mount: check `filter=low` query param → activate Low Stock chip if present

**UI State:**

- All sections show skeletons while fetching
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop

### 5.3 POS (`/app/pos/page.tsx`)

**Layout — Two panels side-by-side (desktop), stacked (mobile):**

**Left Panel: Product Catalog (~60% width desktop)**

- Search bar (auto-focused on mount, `F2` refocus, scanner input detection)
- Category tabs: "All" + dynamic tabs per category
- Product grid: 3 columns desktop, 2 tablet, 1 mobile
- Products sorted by availability (in-stock first)

`ProductCard.tsx`

- Image (or placeholder background), name, price, available qty badge
- **CRITICAL: Available qty is ALWAYS backend-calculated from raw materials**
- States:
  - Normal: Add button active, shows "12 available"
  - Low Stock (1-3): amber warning chip "Only 3 left" (calculated from raw materials)
  - Out of Stock (0): dimmed/greyed, Add disabled, "Out of Stock" chip
- **Hover/Tooltip:** Shows limiting factor: "Limited by Flour (5g short)" if raw material constraint exists
- Click Add → increment cart, card pulses briefly
- `useProductCatalog()` hook: manages product grid state (search, category filter, pagination)
- **Never** store/calculate product stock client-side; always reflect backend value

**Right Panel: Order Builder (~40% width desktop)**

- Header: "Current Order" + item count badge
- Order items list (scrollable)

`OrderLineItem.tsx` — Each line in cart

- Product name, unit price, quantity control `[−] [2] [+]`
- Decrement to 0 removes item
- Increment beyond stock disabled (button disabled, tooltip)
- Line total
- Trash icon → remove
- Quantity input updates local Redux cart state (optimistic)

**Order Summary (sticky bottom of right panel):**

- Subtotal, Tax (if configured), Discount (optional % or flat amount)
- **Total** (bold, large)
- Action buttons: Clear Order (secondary), Complete Sale (primary, full-width)

**Clear Order Flow:**

- Confirmation dialog: "Clear this order?"
- Cancel / Clear buttons

**Complete Sale Flow:**

- Modal opens with order review
- Step 1: Order summary (itemized list + total)
- Step 2: Payment method (Cash / Card toggle buttons)
  - If Cash: "Amount Received" input + auto-calculate change (red if insufficient)
  - If Card: no additional input
- Step 3: Optional customer name/note text field
- Confirm button (disabled until step 2 valid)
- On confirm: mutate `/orders` POST, show spinner, disable button
- On success: close modal, clear cart, show success snackbar "Order #[id] completed!", refresh product catalog
- **On error (CRITICAL):** Backend returns which products cannot be made + which raw materials are insufficient
  - Show error modal: "Cannot complete order"
  - For each problematic product:
    - Product name
    - Material shortage: "Dough: need 500g, have 200g (short 300g)" in red
  - Buttons: "Adjust Order" (close modal, user can edit), "Cancel"
  - This prevents confusion — user sees EXACTLY what material constraint is blocking the sale

**Receipt Screen (after success):**

- Display order number, timestamp, itemized receipt, subtotal, tax, discount, total, payment method, change (if cash)
- Buttons: "Print Receipt" (triggers `window.print()` on a print-optimized receipt div), "New Sale" (clears modal + cart)

**Discount Feature:**

- Below item list: optional "Discount" row (small input)
- Toggle chip: "% | $" (percentage or flat amount)
- Applied to subtotal, shown as negative line
- Affects total calculation
- Stored in local cart state

**Hold Order Feature:**

- "Hold Order" button (secondary) next to "Clear Order"
- Saves current cart to `cartSlice.heldOrders[]` array
- "Held Orders" badge appears in topbar of POS page (shows count)
- Click badge → drawer listing held orders (timestamp, item count, total)
- Click held order → restore as current cart (with confirmation if current cart has items)

**Keyboard / Scanner Support:**

- Search bar `autoFocus` on mount
- Barcode scanner detection: if input > 6 chars + Enter within 100ms → treat as barcode
- Call `useProductGetByBarcodeQuery(barcode)` → if found, add to cart; if not, snackbar "No product found for barcode [value]"
- Global `F2` shortcut → focus search bar

**Empty Category Tab State:**

- If category has products but all out of stock: show dimmed product cards
- If category has zero products: hide the tab entirely

**Empty Cart State:**

- Right panel shows centered EmptyState: "No items added yet. Select products from the left."

**RTK Query Integration:**

- `useProductsGetAllQuery()` — fetch all products on mount, cache
- `useProductsGetByBarcodeQuery(barcode)` — lazy query for scanner
- `useOrdersCreateMutation()` — complete sale
- Invalidate on success: Products, RawMaterials, Orders, Dashboard

**Mobile UX for POS (Critical for Production Cashiers):**

- **On mobile (<768px):** Panels stack vertically, but cart must ALWAYS be visible
- Option A: Cart as sticky bottom header (collapsible bar showing total + item count)
  - Expand/collapse toggles full cart panel above product catalog
  - Prevents user from losing sight of current order
- Option B: Split-pane with 60% catalog, 40% cart (scrollable independently)
  - Both visible simultaneously even on small phones
- **Search bar:** Must remain auto-focused and sticky at top of catalog
- **Add product flow:** Quantity increment should show quick feedback (toast or inline confirmation)
- **Checkout:** Full-screen modal with payment flow (not confined to cart panel)
- **Keyboard:** Virtual keyboard shouldn't hide search bar (test on real mobile devices)

### 5.4 Products (`/app/products/page.tsx`)

**Layout:**

- Top bar: page title, search input, "+ Add Product" button
- Tab bar: "Products | Categories"

**Products Tab:**

`ProductTable.tsx`

- Columns: Name, Category, Price, Available Stock, Recipe Items (count), Status (toggle), Actions (Edit, Duplicate, Delete)
- Searchable by name (client-side filter on fetched list, or server-side via query param)
- Pagination: 10 rows per page
- Click row or Edit icon → open ProductForm dialog

`ProductForm.tsx` — Add / Edit dialog

- **Section 1: Basic Info**
  - Product Name (text, required)
  - Category (select, creatable)
  - Price (number, required, > 0)
  - Description (optional textarea)
  - Product Image (optional file upload, 120x120px)
    - ImageUpload component, returns URL
  - Status toggle (Active/Inactive)
- **Section 2: Recipe / Composition** — This is the HEART of the raw-material system
  - Header: "Recipe / Composition"
  - Subtext: "Define exact quantities of raw materials needed to produce one unit"
  - Dynamic ingredient rows list

  `RecipeRow.tsx` — Each ingredient row
  - Raw Material selector (Autocomplete, searchable)
    - Shows material name + current stock badge (e.g., "Flour (500g available)")
    - Prevents selecting same material twice (disable already-selected in dropdown)
  - Quantity (number input, > 0)
  - Unit (read-only, auto-populated from selected material)
  - Remove row (trash icon)
  - **Row-level validation:** Show inline error if duplicate material selected
  - **"+ Add Ingredient"** button appends new empty row
  - **Validation:** at least 1 ingredient required to save
  - **Warning (if no raw materials exist):** "No raw materials found. Please add raw materials first." + link to Raw Materials page
- **Section 3: Real-Time Production Preview** — CRITICAL for manufacturing planning
  - **Shows LIVE calculation:** "Based on current raw material stock, this product can be made **X units**."
  - Updates in real-time as recipe is built (not just on save)
  - Shows breakdown:

    ```
    Dough: 500g needed per unit × 1 unit = 500g (have 2000g) ✓
    Chicken: 200g needed × 1 unit = 200g (have 50g) ⚠ Limiting factor
    Cheese: 100g needed × 1 unit = 100g (have 300g) ✓
    
    Result: Can make 1 unit (limited by Chicken)
    ```
  - If any material is missing/below threshold: show warning chip
  - Helps product manager understand constraints before saving
  - Updates after recipe is saved (for existing products)
- **Form Actions (bottom):**
  - Cancel (checks isDirty, shows DirtyFormWarning if needed)
  - Save Product (primary)
    - Validates all fields
    - Shows spinner on submit
    - On success: close dialog, refresh product list, success snackbar
    - On error: show inline field errors or general alert
    - Invalidate tags: Products, Dashboard

**Delete Product Flow:**

- Confirmation dialog: "Delete [Product Name]? This will remove its recipe. Sales history will not be affected."
- Cancel / Delete buttons
- On delete: invalidate Products, Dashboard

**Duplicate Product Flow:**

- Icon button in Actions column
- Mutation: `POST /products/:id/duplicate`
- On success: new product created as "[Name] (Copy)", full recipe copied, table refreshes
- Snackbar: "Product duplicated. Click to edit." (with action button opening edit form for new product)

**Categories Tab:**

- List of all categories: Name, Product count, Edit (inline rename), Delete
- "+ Add Category" button at top
- Edit: inline rename, blur/Enter confirms
- Delete: warning if products assigned
- Canonical place for category CRUD

### 5.5 Raw Materials (`/app/raw-materials/page.tsx`)

**Top Bar:**

- Page title, search input, "Show Low Stock Only" toggle chip, "+ Add Raw Material" button

`RawMaterialTable.tsx`

- Columns: Name, Unit, Current Stock, Min Alert Level, Status chip, Actions (Edit, Restock, History, Delete)
- Row-level styling: Low stock = amber left border, Critical = red left border
- Searchable by name
- Filterable: if `filter=low` query param present on mount, activate "Show Low Stock Only" chip
- Pagination: 10 rows per page
- Click row or Edit → RawMaterialForm dialog

`RawMaterialForm.tsx` — Add / Edit dialog

- Fields:
  - Name (text, required)
  - Unit (select: g, ml, pcs — required, locked in edit mode)
  - Current Stock (number, required, ≥ 0)
  - Minimum Alert Level (number, optional)
  - Cost per Unit (optional, currency symbol from Settings)
- Form Actions:
  - Cancel (checks isDirty)
  - Save (validates, shows spinner, invalidates RawMaterials, Dashboard, Products)

`RestockDialog.tsx` — Quick restock popover

- Anchors to "Restock" button (row action)
- Shows: current stock, "Add quantity" input (positive only), unit label auto-populated
- Confirm button (primary) → `PATCH /raw-materials/:id/restock` mutation
- Dismissible: click outside or Escape (no save)
- On success: snackbar confirmation, invalidate RawMaterials, Dashboard, Products

**Stock History Action:** — Complete Audit Trail (Critical for Inventory Control)

- Icon button in Actions → opens right-side Drawer (400px wide on desktop, full on mobile)
- Title: "[Material Name] — Stock History" + current stock badge
- **EVERY transaction logged:** shows exact reason, quantities, and links to orders
- Chronological list (newest first), each entry:
  - Timestamp (e.g., "2024-01-15 14:30")
  - Event type chip (Sale/Restock/Manual Adjustment) with color
  - Quantity change: "+500g" (green, restock) or "−50g" (red, sale/usage)
  - Resulting stock after transaction (e.g., "Stock: 2000g → 1950g")
  - Reference link:
    - Sale: "Order #1042" (clickable → navigate to order detail)
    - Restock: "Manual Restock"
    - Usage: Product name + order number if applicable
- Paginated (show 10 per page)
- Fetched from `GET /raw-materials/:id/history`
- Export button: download history as CSV (audit compliance)

**Delete Raw Material Flow:**

- If used in product recipe: **blocking dialog** with clear manufacturing impact:

  ```
  Cannot delete "Flour"
  
  This raw material is used in these products:
  • Small Pizza (needs 100g per unit)
  • Large Pizza (needs 200g per unit)
  • Bread Loaf (needs 150g per unit)
  
  Those products will no longer be producible.
  Remove Flour from these recipes first before deleting.
  
  [Cancel] [Go to Products]
  ```
  - "Go to Products" button navigates to Products page with filtering/highlighting of dependent products
- If not used: standard confirmation "Are you sure?" — brief, safe to delete
- On delete: invalidate RawMaterials, Products, Dashboard

**Bulk Restock Feature:**

- "Bulk Restock" button (secondary) above table
- Activates "bulk edit mode": all Current Stock cells become inline number inputs
- Floating action bar at bottom: "X materials modified — Save All | Cancel"
- Save: `PATCH /raw-materials/bulk-restock` mutation
- Cancel: revert all edits, close floating bar

### 5.6 Orders History (`/app/orders/page.tsx`)

**Top Bar:**

- Page title, date range picker (From / To date), search input (order ID / customer name), "Payment Method" select filter, "Cashier" select filter (if multi-user), "Export CSV" button

`OrderTable.tsx`

- Columns: Order #, Date & Time, Items (count), Total Amount, Processed By, Actions (View Details)
- Pagination: 10/25/50 rows per page selector (MUI table pagination)
- Date range, search, filters applied as query params to `useOrdersGetAllQuery()`
- Click "View Details" → OrderDetailDrawer

**Export CSV:**

- Button shows spinner while loading
- Fires `GET /orders/export?startDate=X&endDate=Y` with active filters
- Browser downloads file directly

`OrderDetailDrawer.tsx` — Right-side drawer (600px wide on desktop, full on mobile)

- Shows: Order ID, timestamp
- Itemized list:
  - Product name, Quantity, Unit Price, Line Total
- Summary: Subtotal, Tax, Discount (if any), Total
- Optional: Customer name/note if captured at POS
- "Void Order" button (error color, sticky bottom, only if order < 24 hours old)
  - Backend enforces the actual rule
  - Confirmation: "Voiding this order will restore raw material stock. This cannot be undone."
  - On confirm: `DELETE /orders/:id` or `PATCH /orders/:id/void`
  - On success: status chip changes to "Voided" (red), stock restored, invalidate Orders, RawMaterials, Dashboard

### 5.7 Settings (`/app/settings/page.tsx`)

**Tab Structure:**

- Tab bar: General | Notifications | Users | Account

**General Tab:**

- Business name (text, required)
- Currency symbol (text, required, e.g. "$")
- Tax rate (%, number, 0-100)
- Save button, success snackbar on save

**Notifications Tab:**

- Toggle: "Email low stock alerts"
- Alert Email (text input, enabled only if toggle on, pre-filled with current user email)
- Toggle: "Dashboard alert badge"
- Save button

**Users Tab:**

- Table: Name, Email, Role chip (Admin/Cashier), Status (Active/Inactive), Actions (Edit, Deactivate)
- "+ Invite User" button → dialog:
  - Name (text), Email (text), Role select (Admin: full access | Cashier: POS and orders only)
  - On submit: `POST /auth/invite` mutation
  - Invited user appears in table with "Pending" status chip
  - Success snackbar
- Deactivate action: confirmation dialog → `PATCH /users/:id` (set status: Inactive)

**Account Tab:**

- Current password (password field)
- New password (password field)
- Confirm password (password field)
- Change Password button (primary)
- On submit: `PATCH /auth/change-password` mutation
- Show spinner, disable button
- On error: show inline error alert
- On success: snackbar "Password changed successfully", clear fields

### 5.8 Additional Pages

`/app/not-found.tsx`

- Centered layout (no shell)
- Large "404" text, "Page not found" message
- "Go to Dashboard" button, optional "Go back" link

`/app/loading.tsx` — Server-side loading skeleton

- Not needed per-route, but root can show a fallback
- Alternatively, each page shows skeletons for its own sections (already planned above)

`/app/error.tsx` — Error boundary

- Centered error card: error icon, "Something went wrong", error message (dev only), "Try Again" button (calls `reset()`), "Go to Dashboard" link

---

## Phase 6: Responsive Design & Mobile UX

### 6.1 Breakpoints (tailored to MUI defaults)

- xs: 0px (mobile)
- sm: 600px (mobile-landscape)
- md: 768px (tablet portrait)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)

### 6.2 Responsive Rules

- **Sidebar:** permanent drawer (240px) on lg+, hamburger-triggered drawer overlay on md-
- **Topbar:** full on all breakpoints, slim on mobile (no page title — logo + hamburger)
- **Bottom Nav:** visible only on md- (hidden lg+)
- **POS Panels:** side-by-side on lg+, stacked (catalog top, cart bottom drawer) on md-
- **Tables:** horizontally scrollable on sm-, sticky first column
- **Dialogs:** `fullScreen` prop on xs
- **Grids:** responsive column counts (1/2/3 as needed)
- **Cards:** stack to 1 column on sm-

### 6.3 Safe Area & Notches

- Bottom nav: CSS `padding-bottom: env(safe-area-inset-bottom)`
- Fixed popovers: account for notches

---

## Phase 7: Forms & Validation

### 7.1 React Hook Form + Zod Integration

- Every form uses `useForm({ mode: "onBlur" or "onSubmit" })`
- Zod schema for each form (e.g., `ProductFormSchema`, `LoginFormSchema`)
- Inline field errors below each input
- Submit button disabled until form is valid

### 7.2 Form Patterns

- All dialogs: check `form.formState.isDirty` on close attempt
- Show `<DirtyFormWarning>` if dirty
- Backend errors: map to form fields via `setError()` where possible
- Otherwise: show inline MUI Alert below form

---

## Phase 8: Theming & Dark Mode

### 8.1 Theme Toggle

- Sun/Moon icon button in topbar (left of notification bell)
- Click → Redux dispatch `toggleDarkMode()`
- ThemeProvider re-renders MUI theme
- Persist preference to localStorage

### 8.2 Hydration Safety

- Wrap theme toggle logic in `useEffect` with client-side flag
- On first load: read localStorage, if not set, use system preference (via `window.matchMedia`)
- Prevent flash of wrong theme

---

## Phase 9: Global State & Side Effects

### 9.1 Redux Slices

- `authSlice` — user, token, isAuthenticated
- `cartSlice` — current order items, heldOrders[]
- `snackbarSlice` — queue of messages (success/error/info)
- `themeSlice` — isDarkMode boolean
- `notificationsSlice` — low-stock alerts count, unread alerts

### 9.2 Hooks

- `useAuth()` — returns user, login, logout, isAuthenticated
- `useSnackbar()` — returns snackbar.show(message, type)
- `useConfirm()` — opens confirmation dialog, returns promise
- `useTheme()` — returns isDarkMode, toggleTheme()

---

## Phase 10: Error Handling & Loading States

### 10.1 RTK Query Error Handling

- All queries check `isError` state
- Show inline MUI Alert with error message + Retry button
- Retry fires `refetch()` from query hook

### 10.2 Form Submission Errors

- Catch mutation error, map to form fields
- If unmappable: show MUI Alert below form

### 10.3 Global Errors

- ErrorBoundary component wraps app
- Unhandled errors → alert modal with retry option

---

## Phase 11: Skeleton & Empty States

Every section with async data shows:

- **While loading:** Skeleton component matching the layout
- **While empty (after load):** EmptyState component with icon, message, CTA
- **While error:** MUI Alert with Retry button

---

## Phase 12: RTK Query Mock Data

Since API integration uses env variable placeholders:

- Each RTK Query slice includes a mock implementation
- If `NEXT_PUBLIC_API_BASE_URL` not set: RTK Query returns mock data
- Mock data is realistic (e.g., 10 products, 5 raw materials, 20 orders)
- Allows frontend dev/testing independent of backend

---

## Implementation Sequence (Build Order)

1. **Setup Phase 1-3:** Dependencies, types, store, theme, auth utils
2. **Shared Components (Phase 4):** Layout, dialogs, form components, global snackbar
3. **Authentication (Phase 5.1):** Login page, middleware, useAuth hook
4. **Dashboard (Phase 5.2):** KPI cards, charts, inventory table, date range control
5. **POS (Phase 5.3):** Catalog, order builder, complete sale flow, payment & receipt, discount, hold orders, scanner support
6. **Products (Phase 5.4):** Product table, form, recipe builder, duplicate, categories
7. **Raw Materials (Phase 5.5):** Table, form, restock dialog, stock history, bulk restock
8. **Orders (Phase 5.6):** Table, detail drawer, void order, export CSV, filters
9. **Settings (Phase 5.7):** All tabs
10. **Error Pages (Phase 5.8):** 404, error boundary
11. **Responsive & Mobile (Phase 6):** Test breakpoints, bottom nav, drawer behaviors
12. **Polish & Testing (Phase 7-12):** Form validation, theme toggle, mock data, edge cases

---

## Key Architecture Decisions

1. **State Management:** Redux + RTK Query (better for server state + API caching)
2. **Auth:** Simple JWT in cookies + localStorage, manual refresh logic
3. **Forms:** React Hook Form + Zod (type-safe, minimal boilerplate)
4. **API Integration:** Environment variable placeholders + mock fallback
5. **Error Handling:** Granular (field-level errors where possible, global snackbar for fatal)
6. **Performance:** RTK Query caching, optimistic updates in cart, lazy load modals
7. **Mobile:** Breakpoint-driven (768px is primary threshold), safe-area aware

---

## Success Criteria

### Functional Pages

- All 6 main pages fully functional (Dashboard, POS, Products, Raw Materials, Orders, Settings)
- Authentication working (login/logout, token refresh, route protection)

### Core System (Raw-Material-Driven Inventory)

- **Product availability ALWAYS calculated from raw materials** (never stored as product stock)
- Product with no recipe shows availableStock = 0 (unsellable)
- Selling a product correctly deducts raw materials (backend-enforced)
- Cannot sell if raw materials insufficient (order rejected with specific material shortage info)
- Dashboard shows "Products at Risk" section highlighting products that cannot be produced
- Stock history tracks every deduction with audit trail (Sale #XXXX link, Restock, Manual Adjustment)

### API & Data Consistency

- RTK Query fully integrated with mock data + real API support via env vars
- `invalidatesTags` correctly triggers cache refresh after mutations
- Frontend always reflects backend state (no client-side stock calculations)
- Race condition prevention: two simultaneous sales don't double-deduct

### UI/UX

- Responsive design tested on mobile, tablet, desktop
- Form validation + error handling complete
- Dark mode toggle functional
- Snackbar/notification system working
- All dialogs + modals have dirty form warning
- Skeleton loaders + empty states for all async sections
- POS page optimized (fast, keyboard-friendly, barcode scanner support)
- Recipe builder shows real-time "can make X units" calculation
- Recipe dropdown prevents duplicate materials in same product

### Code Quality

- TypeScript strict mode, no `any` types
- Clean frontend/backend separation (no business logic in frontend)

---

## Notes for Developer

### Implementation Order

- This is a detailed specification. Each phase should be completed before moving to the next.
- Start with Phase 1-3 (setup, types, store) before touching UI components.
- Build shared components (Phase 4) before building pages.
- Test each page independently with mock data before moving to next.

### Critical Raw-Material System Rules

- **NEVER store product inventory directly.** Always calculate from raw materials.
- **NEVER compute stock calculations on the frontend.** Backend is the source of truth.
- **ALWAYS invalidate Product + Dashboard caches after a sale** to ensure UI reflects latest availability.
- **Every recipe must have at least 1 ingredient** (enforce in frontend validation + backend constraint).
- **Products at Risk should be prominently shown on Dashboard** for manufacturing planning.

### Testing Checklist (Before Calling Ready)

1. **Create a product with a recipe:** Verify dashboard shows correct "can make X units"
2. **Complete a sale:** Verify raw material stock decreases correctly
3. **Attempt to sell with insufficient stock:** Verify error modal shows which material is short
4. **Edit recipe quantities:** Verify "can make X units" updates in real-time
5. **Delete a raw material used in recipes:** Verify blocking dialog shows dependent products
6. **View stock history:** Verify every sale is logged with order number + exact quantity deducted
7. **Restock raw material:** Verify product availability immediately updates on POS
8. **Test on mobile:** Verify POS cart is always visible, search remains focused

### Performance Notes

- RTK Query caching is critical — avoid refetching product list on every action.
- POS page should cache all products on mount; only invalidate after sales.
- Dashboard polling: 60 seconds is a reasonable balance (adjust if backend is burdened).
- Mock data should include at least: 5 raw materials, 3 products with recipes, 10 orders.

### Dark Mode & Theming

- Theme should be implemented alongside setup, not as an afterthought.
- Test dark mode on every component to ensure readability.
- Save theme preference to localStorage immediately on toggle.

### Form Validation

- All forms must validate before submit button is enabled.
- Duplicate materials in recipe must be prevented (error or disabled dropdown).
- Product requires at least 1 recipe item (inline validation message).
- Raw material unit cannot change after creation (lock field in edit mode).

### Error Scenarios to Handle

1. Sale fails due to stock insufficiency → show which materials are short
2. Recipe has raw material that was deleted → show warning, block saving
3. Network error during order completion → show retry with modal (don't lose cart)
4. User navigates away with unsaved changes → confirm via DirtyFormWarning
5. Product with no recipe → show as unsellable (disabled on POS)