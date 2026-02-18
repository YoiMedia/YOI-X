# FlowX: Enterprise Resource & Workflow Management

FlowX is a comprehensive project and resource management system designed to bridge the gap between clients, sales teams, and execution staff. It provides a structured lifecycle for service requirements, task management, and client collaboration.

---

## 🚀 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Icons & UI** | Lucide React, Framer Motion, React Hot Toast |
| **Backend** | Convex (Real-time Database & Functions) |
| **Authentication** | Custom Magic Link (via n8n) & Credentials-based |
| **Storage** | Cloudflare R2 (integrated via Convex Actions) |
| **Deployment** | Self-hosted Convex & Vite (configured for HTTP/HTTPS) |

---

## 📂 Project Structure

### `/src` (Frontend)
- **`/pages`**: Component-based routing structure.
  - `auth/`: Login (Client, Admin, Superadmin) and Verification flows.
  - `clients/`: Client listing and detailed profiles.
  - `requirements/`: The core dashboard for service requests and the "New Requirement" builder.
  - `tasks/`: Employee-facing task management and the "My Tasks" board.
  - `submissions/`: Review portal for work deliverables.
  - `meetings/`: Scheduling and outcomes management.
  - `dashboard/`: Admin-level user management and analytics.
- **`/components`**: Reusable UI elements.
  - `layout/`: Sidebar (role-aware), Header, and Layout wrappers.
  - `ui/`: Common cards, modals, and status badges.
- **`/services`**: Client-side logic for Authentication and API interaction.
- **`/constants`**: Global configurations, sidebar menus, and Service Package definitions.

### `/convex` (Backend)
- **`schema.ts`**: Centralized data model with strict TypeScript-like validation using `v.union` and `v.object`.
- **`requirements.ts`**: CRUD logic for service requirements, pricing calculations, and role-based visibility.
- **`tasks.ts`**: Management of tasks and subtasks.
- **`submissions.ts`**: Deliverable handling and review state machine.
- **`files.ts`**: Interface for Cloudflare R2 storage, including entity-based file mapping.
- **`meetings.ts` / `meetingOutcomes.ts`**: Logic for scheduling calls and storing private/shared notes.

---

## 🔄 Core Business Flows

### 1. The Requirement Lifecycle
1.  **Creation**: Sales/Admin creates a requirement for a Client.
2.  **Configuration**: Selection of Service Type (e.g., Website Dev) and Package Tier (e.g., Empire).
3.  **Pricing**: The system calculates a fixed **MRP** (base price). Admins set a **Deal Price** (negotiated).
4.  **Submission**: Requirement is submitted and becomes visible to the execution team.

### 2. Execution & Assignment
1.  **Requesting**: Employees view unassigned requirements and "Request Assignment."
2.  **Assignment**: Admins/Superadmins review requests and assign a lead employee.
3.  **Tasking**: The requirement is broken down into individual Tasks and Subtasks.

### 3. Submission & Review
1.  **Work**: Employees upload deliverables to a Task.
2.  **Submission**: A formal "Submission" is created with R2-hosted file links.
3.  **Client Review**: Clients view the submission in their portal to Approve, Request Changes, or Reject.
4.  **Feedback**: Upon approval, clients provide ratings and testimonials.

---

## 👥 Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Superadmin** | Full system access, bypasses all restrictions, master user management. |
| **Admin** | Manages users, clients, and assignments; oversees all requirements and pricing. |
| **Sales** | Creates clients and requirements; tracks their own accounts and deal prices. |
| **Employee** | Views assigned requirements, creates tasks, and submits work. Cannot see pricing. |
| **Client** | Views their own requirements, schedules meetings, and reviews work submissions. |

---

## 🛠️ Key Technical Implementations

### Dynamic Pricing & Packages
Located in `src/constants/servicePackages.js`, the system defines a complex hierarchical structure of services, tiers, and regional pricing (INR, USD, AED) which is consumed by the `NewRequirement` builder to ensure data consistency.

### Entity-File Mapping
The system uses a centralized `files` table in Convex that maps R2 storage keys to specific system entities (Tasks, Outcomes, Requirements) using a polymorphic `entityType` and `entityId` pattern.

### Defensive Frontend Architecture
Most components implement "Safety Checks" (optional chaining and existence guards) to prevent crashes when partial data is returned from the backend, ensuring a smooth experience even during rapid schema updates.
