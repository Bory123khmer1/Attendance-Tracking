-- =================================================================================
-- Asia Euro University (AEU) - QR QR Attendance & Resource Management System
-- Database Schema Definition (PostgreSQL Compatible)
-- =================================================================================
-- This schema represents the SQL equivalent of the client-side database used in AEU portal.
-- Implements relational foreign keys, indexes, and constraints for high-scale student tracking.
-- =================================================================================

-- 1. SEMESTERS TABLE (តារាងឆមាសសិក្សា)
CREATE TABLE semesters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL
);

-- 2. TEACHERS TABLE (តារាងសាស្ត្រាចារ្យ)
CREATE TABLE teachers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    khmer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(255),
    password VARCHAR(255) -- Hash-ready password storage
);

-- 3. STUDENTS TABLE (តារាងនិស្សិត)
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "123456" (6-digit format requested by user)
    name VARCHAR(255) NOT NULL,
    khmer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) -- Hash-ready password storage
);

-- 4. SUBJECTS TABLE (តារាងមុខវិជ្ជា/ថ្នាក់)
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "ANA-201"
    name VARCHAR(255) NOT NULL,
    khmer_name VARCHAR(255) NOT NULL,
    teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE SET NULL,
    total_days INT DEFAULT 20 NOT NULL, -- e.g., 20 days (40 scanning opportunities)
    semester VARCHAR(100) NOT NULL
);

-- 5. ENROLLMENTS TABLE (តារាងការចុះឈ្មោះចូលរៀនរបស់សិស្ស)
CREATE TABLE enrollments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(student_id, subject_id)
);

-- 6. ACTIVE SESSIONS TABLE (តារាង QR Code សកម្មបង្កើតដោយគ្រូ)
CREATE TABLE active_sessions (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
    qr_type VARCHAR(20) CHECK (qr_type IN ('MORNING', 'BREAK')) NOT NULL,
    qrcode TEXT UNIQUE NOT NULL, -- The secure signed token for scanner
    created_at BIGINT NOT NULL, -- Epoch Milliseconds timestamp
    expires_at BIGINT NOT NULL, -- Epoch Milliseconds timestamp
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 7. ATTENDANCE RECORDS TABLE (តារាងកំណត់ហេតុវត្តមានប្រចាំថ្ងៃរបស់សិស្ស)
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL, -- Format YYYY-MM-DD
    scanned_morning BOOLEAN DEFAULT FALSE NOT NULL,
    morning_time TIME, -- Format HH:mm:ss
    scanned_break BOOLEAN DEFAULT FALSE NOT NULL,
    break_time TIME, -- Format HH:mm:ss
    UNIQUE(student_id, subject_id, attendance_date)
);

-- 8. LESSON MATERIALS TABLE (តារាងឯកសារមេរៀនគ្រូបង្ហោះ)
CREATE TABLE lesson_materials (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'mp4', 'link')) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50), -- e.g., "1.4MB"
    uploaded_at DATE NOT NULL -- Format YYYY-MM-DD
);

-- 9. CAMPUS NEWS BULLETIN TABLE (តារាងសេចក្តីជូនដំណឹង និងសាលាក្រុង)
CREATE TABLE news_bulletin (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    badge VARCHAR(100) DEFAULT 'ទូទៅ' NOT NULL,
    news_date DATE NOT NULL -- Format YYYY-MM-DD
);

-- 10. STUDENT PROMOTION OFFERS TABLE (តារាងកម្មវិធីការផ្តល់ជូនប្រូម៉ូសិនពិសេស)
CREATE TABLE student_promotions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

-- 11. HELPDESK TICKETS SUPPORT TABLE (តារាងពាក្យស្នើសុំ និងគណនេយ្យទំនាក់ទំនងសិស្ស)
CREATE TABLE support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., "វត្តមាន", "បច្ចេកវិទ្យា"
    status VARCHAR(100) NOT NULL, -- e.g., "Pending", "Resolved"
    ticket_date DATE NOT NULL, -- Format YYYY-MM-DD
    reply TEXT
);


-- =================================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION (ការបង្កើតលិបិក្រមសម្រាប់បង្រួញល្បឿនស្វែងរក)
-- =================================================================================
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_subject ON enrollments(subject_id);
CREATE INDEX idx_attendance_composite ON attendance_records(student_id, subject_id, attendance_date);
CREATE INDEX idx_sessions_expiry ON active_sessions(expires_at) WHERE is_active = TRUE;
CREATE INDEX idx_lessons_subject ON lesson_materials(subject_id);
CREATE INDEX idx_tickets_student ON support_tickets(student_id);


-- =================================================================================
-- INITIAL SEED DATA SCRIPTS (ស្គ្រីបសម្រាប់បញ្ចូលទិន្នន័យគំរូដំបូង)
-- =================================================================================

-- Add Semesters
INSERT INTO semesters (id, name, is_active) VALUES 
('SEM-001', 'ឆ្នាំទី ២ - ឆមាសទី ១', true),
('SEM-002', 'ឆ្នាំទី ២ - ឆមាសទី ២', false);

-- Add Teachers
INSERT INTO teachers (id, name, khmer_name, email, phone, department, password) VALUES
('T-001', 'Prof. Sok San', 'សាស្ត្រាចារ្យ សុខ សាន', 'soksan@aeu.edu.kh', '092111222', 'ធនធានមនុស្ស & បច្ចេកវិទ្យា', 'pass123'),
('T-002', 'Dr. Chan Pich', 'លោកបណ្ឌិត ចាន់ ពេជ្រ', 'chanpich@aeu.edu.kh', '098333444', 'ព័ត៌មានវិទ្យា', 'pass123'),
('T-003', 'Dr. Chea Roth', 'អ្នកស្រីបណ្ឌិត ជា រដ្ឋ', 'chearoth@aeu.edu.kh', '012555666', 'គណនេយ្យ & ហិរញ្ញវត្ថុ', 'pass123');

-- Add Students
INSERT INTO students (id, student_id, name, khmer_name, email, phone, password) VALUES
('S-001', '101152', 'Khoeun Bory', 'ខឿន បូរី', 'boryto446@gmail.com', '096332155', 'bory123'),
('S-002', '205562', 'Sok Sophea', 'សុក សុភា', 'sok.sophea@aeu.edu.kh', '088777123', 'sophea123'),
('S-003', '307129', 'Keo Vansak', 'កែវ វ៉ាន់សាក់', 'keo.vansak@aeu.edu.kh', '010444555', 'vansak123');

-- Add Subjects
INSERT INTO subjects (id, code, name, khmer_name, teacher_id, total_days, semester) VALUES
('SUB-001', 'ANA-201', 'Anatomy & Physiology I', 'កាយវិភាគវិទ្យា និងរូបវិទ្យា ១', 'T-001', 20, 'ឆ្នាំទី ២ - ឆមាសទី ១'),
('SUB-002', 'PHY-202', 'General Physiology II', 'រូបវិទ្យាទូទៅ ២', 'T-001', 20, 'ឆ្នាំទី ២ - ឆមាសទី ១'),
('SUB-003', 'WEB-301', 'Web Application Development', 'ការអភិវឌ្ឍន៍កម្មវិធីបណ្តាញទូរស័ព្ទ', 'T-002', 15, 'ឆ្នាំទី ២ - ឆមាសទី ១'),
('SUB-004', 'DB-302', 'Database Administration', 'ការគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ', 'T-002', 20, 'ឆ្នាំទី ២ - ឆមាសទី ១'),
('SUB-005', 'ENG-102', 'Technical English II', 'ភាសាអង់គ្លេសបច្ចេកទេស ២', 'T-003', 15, 'ឆ្នាំទី ២ - ឆមាសទី ១');

-- Add Student Enrollments
INSERT INTO enrollments (id, student_id, subject_id) VALUES
('ENR-001', 'S-001', 'SUB-001'),
('ENR-002', 'S-001', 'SUB-002'),
('ENR-003', 'S-001', 'SUB-003'),
('ENR-004', 'S-001', 'SUB-004'),
('ENR-005', 'S-002', 'SUB-001'),
('ENR-006', 'S-002', 'SUB-003'),
('ENR-007', 'S-003', 'SUB-002'),
('ENR-008', 'S-003', 'SUB-004');

-- Add Initial Lesson Materials
INSERT INTO lesson_materials (id, subject_id, title, file_type, file_name, file_size, uploaded_at) VALUES 
('LES-001', 'SUB-001', 'Syllabus Course Anatomy', 'pdf', 'Syllabus_Course_ANA-201.pdf', '1.4MB', '2026-06-01'),
('LES-002', 'SUB-001', 'Lecture Overview Anatomy Week 1', 'mp4', 'Lecture_Overview_Week1.mp4', '48MB', '2026-06-02'),
('LES-003', 'SUB-002', 'Physiology Lecture S1', 'pdf', 'Physiology_Intro_PHY-202.pdf', '2.1MB', '2026-06-03');

-- Add Initial News
INSERT INTO news_bulletin (id, title, content, badge, news_date) VALUES 
('NEWS-001', 'ថ្ងៃឈប់សម្រាកបុណ្យជាតិ វិសាខបូជា នាម័យ', 'សាកលវិទ្យាល័យសូមអបអរសាទរ និងប្រកាសផ្អាកថ្នាក់សិក្សាទាំងអស់រយៈពេល ២ ថ្ងៃ ចាប់ពីថ្ងៃពុធនិងថ្ងៃព្រហស្បតិ៍សប្តាហ៍ក្រោយ។', 'ព័ត៌មានការិយាល័យ', '2026-06-10'),
('NEWS-002', 'ព័ត៌មានរៀបចំកាតនិស្សិត', 'និស្សិតគ្រប់រូបដែលមិនទាន់ទាក់ទងថតរូបកាតសមាជិកសិក្សា សូមមេត្តមកកាន់បន្ទប់រដ្ឋបាលកណ្តាលសាលាក្នុងសប្តាហ៍នេះ។', 'ទូទៅ', '2026-06-09');

-- Add Initial Promotions
INSERT INTO student_promotions (id, title, content) VALUES 
('PROM-001', 'Dell & Asus Educational Alliance (AEU Student Deal)', 'បង្ហាញកាតអត្តសញ្ញាណនិស្សិត AEU នៅគ្រប់សាខាទូទាំងប្រទេស ដើម្បីទទួលបានការបញ្ចុះតម្លៃរហូតដល់ ១៥% លើការទិញ Laptop សិក្សា។'),
('PROM-052', 'Coffee & Workspace Partnership Discount (10% Off)', 'ដៃគូហាងកាហ្វេជុំវិញបរិវេណសាលាផ្តល់ជូន ១០% off លើភេសជ្ជៈគ្រប់មុខជារៀងរាល់ថ្ងៃ។');

-- Add Initial Support Tickets
INSERT INTO support_tickets (id, student_id, student_name, subject, category, status, ticket_date, reply) VALUES 
('TKT-9952', 'S-001', 'ខឿន បូរី', 'សូមស្នើកែសម្រួលវត្តមានខកខានថ្ងៃចន្ទទី០៨', 'វត្តមាន', 'ស្រាវជ្រាវរួចរាល់', '2026-06-08', 'បុគ្គលិក៖ ក្រុមបច្ចេកទេសបានផ្ទៀងផ្ទាត់ និងកែសម្រួលដោះស្រាយរួចរាល់ហើយ។ សូមពិនិត្យឡើងវិញ។');
