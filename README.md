# 🎓 Asia Euro University (AEU) - QR Attendance & Resource Management System

A high-fidelity, fully interactive web portal designed for **Asia Euro University (AEU)**. This platform empowers professors to generate secure, dynamic attendance QR codes (for both morning check-ins and mid-class break opportunities) and enables students to scan from their phones to log real-time attendance. In addition, the system includes a fully developed Admin Dashboard for curriculum management, dynamic notice board bullentin, student coupon promotions, and a support helpdesk.

---

## 🚀 Core Modules & Features

### 1. 👨‍🎓 Student Portal
* **Live Camera QR Scanner**: Accesses the device camera securely to scan classroom QR codes. Includes fallback mock-scanning for desktop environments.
* **Double-Check Ins**: Supports the AEU standard "Morning" & "Break" scanning requirements per class session.
* **Subject & Progress Cards**: View absolute attendance percentages, countdowns, and lesson handouts (PDFs, Videos, Web Links) uploaded by professors.
* **Support Ticket Helpdesk**: Submit digital petitions to request attendance corrections or report technical difficulties directly to the registrar's office.
* **Notice Board & Deals**: Displays verified campus notifications and exclusive student retail discounts.

### 2. 👩‍🏫 Teacher Portal
* **QR Code Engine**: Generate short-lived, timed QR codes for Morning & Break scanning.
* **Real-time Attendance Grid**: Monitor live check-ins during lectures, with manual override sliders (Present/Absent).
* **Attendance Auditing**: Check overall course metrics, export-ready rosters, and class summaries.
* **Handout Uploader**: Post lecture slides, reference videos, and homework links for student download.

### 3. 🛡️ Admin Dashboard
* **Dynamic Curriculums**: Create, update, and manage Semesters, Course Subjects, Teachers, and Student Registrations.
* **Student Enrollments**: Assign students to their respective classrooms in bulk with real-time class capacity limits.
* **Resources & Bulletin Manager**: 
  * Upload and monitor all uploaded lesson materials.
  * Write, edit, and publish school bulletins (with customized badge categories).
  * Update student discounts and partnership offers on-the-fly.
  * Answer dynamic tech-support tickets with instant automated notifications.

---

## 🔑 Default Authentication Credentials

For easy evaluation, use any of the pre-loaded roles below. All state transitions are dynamically stored in the browser's `localStorage` via the custom `DBStore` reactive database manager.

| Role | Username / ID | Password | Access Rights | name |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Campus Control | - |
| **Professor** | `soksan@aeu.edu.kh` | `pass123` | Anatomy & Physiology | សម្រេច សុខ សាន |
| **Professor** | `chanpich@aeu.edu.kh` | `pass123` | Web Development & DB | ចាន់ ពេជ្រ |
| **Student** | `101152` | `bory123` | Year 2 Student A | ខឿន បូរី |
| **Student** | `205562` | `sophea123` | Year 2 Student B | សុក សុភា |

---

## 🗄️ Database Architecture (`schema.sql`)

A standard enterprise-grade PostgreSQL relational database schema has been drafted in `/schema.sql` showcasing:
1. Solid primary/foreign key mappings (e.g. `enrollments` referencing `students` and `subjects`).
2. Composite indices for sub-millisecond querying of historical attendance sheets (`idx_attendance_composite`).
3. Constraints preventing duplicate scanned signatures on the same calendar day.

---

## 🛠️ Technology Stack & Styling

- **Frontend Core**: React (TypeScript) + Vite
- **Animations**: `motion/react` for buttery-smooth modal/tab transitions.
- **Icons**: 100% vector SVG icons via `lucide-react`.
- **CSS Engine**: Tailwind CSS. Built with high-contrast slate aesthetics, elegant typography, with a robust Swiss/Modern responsive layout.
