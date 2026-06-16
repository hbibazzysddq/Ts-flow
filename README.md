# TaskFlow — Modern Kanban Board

TaskFlow is a modern, clean, and performant Kanban board built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**. It brings the power of visual task management with real-time team collaboration — think Trello, but self-hosted and lightweight.

---

## Why TaskFlow?

| Advantage | What it means for you |
|---|---|
| **Real-time everything** | Tasks, comments, assignments — updates appear instantly across all connected users via Supabase Realtime. No page refresh needed. |
| **Team collaboration** | Invite members by email, assign tasks to specific people, and discuss work in task-level comments. |
| **Responsive & clean UI** | Works beautifully on desktop and mobile. No bloat, no clutter. |
| **Drag & drop** | Move tasks between columns seamlessly with `@dnd-kit`. Smooth, intuitive, fast. |
| **Priorities & deadlines** | Mark urgency (Low / Medium / High) and set due dates to keep work on track. |
| **Secure by default** | Row-Level Security (RLS) ensures users only see boards they own or have been invited to. |
| **Free & self-hosted** | Powered by Supabase's generous free tier. No subscription lock-in. |

---

## ✨ Features

- **Multiple boards** — Create separate boards for different projects
- **Kanban columns** — Add, rename, delete, and reorder columns
- **Drag & drop tasks** — Move tasks within and across columns
- **Team collaboration** — Invite members via email; accept or decline invitations
- **Task comments** — Discuss work directly on each task card
- **Assignee** — Assign tasks to specific team members
- **Priority labels** — Low / Medium / High with color-coded badges
- **Deadlines** — Set due dates with visual indicators
- **Task detail page** — Full-screen editor for title, description, priority, deadline, assignee, and comments
- **Real-time sync** — Live updates for tasks, columns, comments, and member changes
- **Bell notifications** — Pending invitation badge and modal in the navbar
- **Google OAuth** — Sign in with Google in one click
- **Collaboration Hub** — Dedicated page to manage boards, members, and invitations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React (TypeScript) |
| Styling | Tailwind CSS v4 |
| State & Data | TanStack Query (React Query) |
| Backend & Auth | Supabase (PostgreSQL, Auth, Realtime) |
| Icons | Lucide React |
| Drag & Drop | @dnd-kit |

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 18+)

### 1. Install dependencies
```bash
bun install
```

### 2. Configure environment
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up the database
Run the SQL from `SUPABASE_SETUP.md` in Supabase SQL Editor. This creates all required tables, RLS policies, and helper functions.

### 4. Start the dev server
```bash
bun dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Project Structure

```
src/
├── context/       # AuthContext — user session management
├── hooks/         # Custom hooks using TanStack Query
├── pages/         # Dashboard, Board, TaskDetail, Collaboration, Auth
├── services/      # Supabase API layer
└── components/    # Reusable UI components
```

---
