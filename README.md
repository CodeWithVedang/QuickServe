# 🍽️ QuickServe India — Modern Restaurant Management System

QuickServe India is a high-performance, real-time operating system for modern restaurants. It bridges the gap between **Waiters**, **Kitchen Staff**, **Billing Counters**, and **Administrators** through a unified, live-synced dashboard experience.

---

## 🚀 Key Features

### 🟢 Completed & Functional
- [x] **Role-Based Auth**: Secure login for Admin, Waiter, Kitchen, and Counter roles.
- [x] **Smart Waiter App**: Real-time menu search, category filtering, and cart-to-kitchen firing.
- [x] **Interactive KDS**: Kitchen Display System with Kanban boards for incoming and preparing orders.
- [x] **Automated Billing**: Grouping table orders, 5% GST calculation, and multi-mode payments (UPI/Cash/Card).
- [x] **Thermal Receipt Engine**: Optimized print views for standard browser-based receipt printing.
- [x] **BI Dashboard**: Admin analytics for revenue tracking, category performance, and kitchen load monitoring.
- [x] **Menu CRUD**: centralized interface for admins to manage pricing, availability, and images.

---

## 🛠️ Tech Stack
- **Frontend**: `React 19`, `Vite`, `TypeScript`, `Tailwind CSS v4`, `Lucide Icons`.
- **State & Data**: `Zustand` (Global State), `TanStack Query` (Server State).
- **Backend & Realtime**: `Supabase` (Postgres, Auth, Realtime Channels).
- **UI Components**: Radix-compatible custom primitives for `Cards`, `Badges`, and `Skeletons`.

---

## 📅 Project Roadmap (TODOs)

Keep track of the remaining features for the v1.0 release. 

### 🏗️ In Progress / Current Focus
- [ ] **Auth Guards**: Implement higher-order components to prevent cross-role URL navigation.
- [ ] **Live Table Occupancy**: Dynamic table indicator on the "Fire Order" screen to show real-time table status.
- [ ] **Order Editing**: Allow waiters to modify active orders before they are marked as "Preparing".

### 🗓️ Upcoming Features (Backlog)
- [ ] **Graphical Floor Plan**: Visual drag-and-drop restaurant layout instead of table lists.
- [ ] **Inventory System**: Ingredients tracking and automated stock deduction per order.
- [ ] **Historical Analytics**: Exportable CSV/PDF reports for daily closing and monthly performance.
- [ ] **System Settings**: UI to change Restaurant Name, Address, GSTIN, and Tax Rates.
- [ ] **Staff Management**: Admin interface to add/remove employees and reset passwords.
- [ ] **PWA Support**: Offline order taking capability for spotty kitchen WiFi.
- [ ] **Advanced Kitchen Stats**: Average "Ticket-to-Table" time tracking.

---

## 📦 Getting Started

### 1. Database Configuration
1. Create a [Supabase](https://supabase.com) project.
2. Execute the schema in `/backend/supabase/migrations/01_initial_schema.sql`.
3. Use `/backend/supabase/run_this_once_v3.sql` to seed the Indian menu and test accounts.

### 2. Environment Setup
Create `apps/web/.env`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Installation
```powershell
cd apps/web
npm install
npm run dev
```

---

## 🔑 Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@quickserve.com` | `password123` |
| **Waiter** | `waiter@quickserve.com` | `password123` |
| **Kitchen** | `kitchen@quickserve.com` | `password123` |
| **Counter** | `counter@quickserve.com` | `password123` |

---

## 📂 Project Structure
- `apps/web`: React Next-style structure with `/modules` for each concern.
- `backend/supabase`: SQL scripts for schema, triggers, and seeds.
- `packages`: Shared logic and components for monorepo scalability.

