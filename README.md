# 🏗️ Construction Task Tracker

## Overview
The **Construction Task Tracker** is a mobile application designed for property builders and construction supervisors. It helps a team of 4 supervisors efficiently assign, track, and manage construction tasks across multiple sites. By documenting tasks with photos and notes, the app ensures smooth communication between supervisors and prevents missed assignments.

---

## 👤 Users
- **Supervisors:** 4 property supervisors who rotate across construction sites.
- **Laborers:** Indirectly interact through tasks assigned by supervisors.

---

## 📱 Features

### 1. Landing Page (Login)
- Secure login system with unique IDs for each supervisor.
- Simple, intuitive interface for fast access.

### 2. Dashboard
- Lists all active construction sites.
- Options to:
  - **Add** a new site.
  - **Edit** or **Delete** existing sites.

### 3. Site Details Page
- Define:
  - Number of floors.
  - Number of flats per floor (optional and editable).
- Visual layout of floors and flats for easier navigation.

### 4. Task Assignment
- Navigate to a specific floor or flat.
- Options to:
  - Capture a photo or upload an image.
  - Add a short note describing the task (e.g., "Fix wiring in Bedroom 2").
  - Save task – visible to all supervisors.

### 5. Task Visibility
- Shared **Task Board** for each site and floor.
- Displays tasks with:
  - Image thumbnail
  - Note
  - Assigned by: [User Name]
  - Date and Time

### 6. Mark Task as Done
- Supervisors can mark tasks as completed when visiting the site.
- Completed tasks are:
  - Removed from the active view.
  - Logged in the database with:
    - Marked as done by: [User Name]
    - Date and Time

---

## ⚡ User Flow
1. **Login** → Supervisor enters unique ID.  
2. **Dashboard** → Supervisor selects or adds a construction site.  
3. **Site Details** → Supervisor defines floors/flats.  
4. **Assign Task** → Upload photo + add note → Save task.  
5. **Task Board** → Supervisors view active tasks.  
6. **Mark Complete** → Supervisor marks tasks done → Auto-logged.  

---

## 🗂️ Technology Stack
- **Frontend:** React Native / Flutter (for mobile app)
- **Backend:** Node.js / Django / Firebase (for database & authentication)
- **Database:** Firestore / MongoDB / SQL
- **Storage:** Cloud storage for task photos (e.g., Firebase Storage or AWS S3)
- **Authentication:** Secure login with unique supervisor IDs
