/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Teacher, Student, Subject, Enrollment, Semester, ActiveSession, AttendanceRecord, QRType, LessonMaterial, NewsItem, PromotionItem, SupportTicket } from './types';

// Standard Initial Seed Data
const DEFAULT_TEACHERS: Teacher[] = [
  { id: 'T-001', name: 'Dr. Samnang Sok', khmerName: 'លោកគ្រូ សុខ សំណាង', email: 'samnang.sok@university.edu.kh', phone: '012 345 678', department: 'Medicine', password: '123' },
  { id: 'T-002', name: 'Prof. Sophy Chhim', khmerName: 'អ្នកគ្រូ ឈីម សូភី', email: 'sophy.chhim@university.edu.kh', phone: '085 987 654', department: 'Science', password: '123' },
  { id: 'T-003', name: 'Dr. Vandan Chan', khmerName: 'លោកគ្រូ ចាន់ វណ្ណដន', email: 'vandan.chan@university.edu.kh', phone: '093 111 222', department: 'Pharmacy', password: '123' },
];

const DEFAULT_STUDENTS: Student[] = [
  { id: 'S-001', studentId: '64945', name: 'Khoeun Borey', khmerName: 'ខឿន បូរី', email: 'boryto446@gmail.com', phone: '096 888 777', password: '123' }, // Default User
  { id: 'S-002', studentId: '100002', name: 'Sopheap Chan', khmerName: 'ចាន់ សុភាព', email: 'sopheap.chan@gmail.com', phone: '011 222 333', password: '123' },
  { id: 'S-003', studentId: '100003', name: 'Rotha Kim', khmerName: 'គីម រដ្ឋា', email: 'rotha.kim@gmail.com', phone: '077 444 555', password: '123' },
  { id: 'S-004', studentId: '100004', name: 'Sreypich Bou', khmerName: 'ប៊ូ ស្រីពេជ្រ', email: 'sreypich.bou@gmail.com', phone: '015 666 777', password: '123' },
  { id: 'S-005', studentId: '100005', name: 'Nika Heng', khmerName: 'ហេង នីកា', email: 'nika.heng@gmail.com', phone: '088 999 000', password: '123' },
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'SUB-001', code: 'ANA-201', name: 'Anatomy', khmerName: 'កាយវិភាគវិទ្យា', teacherId: 'T-001', totalDays: 20, semester: 'ឆមាសទី ១' },
  { id: 'SUB-002', code: 'PHY-202', name: 'Physiology', khmerName: 'សរីរវិទ្យា', teacherId: 'T-002', totalDays: 20, semester: 'ឆមាសទី ១' },
  { id: 'SUB-003', code: 'BIO-103', name: 'Biochemistry', khmerName: 'ជីវគីមីវិទ្យា', teacherId: 'T-001', totalDays: 20, semester: 'ឆមាសទី ១' },
  { id: 'SUB-004', code: 'PHA-301', name: 'Pharmacology', khmerName: 'ឱសថសាស្ត្រ', teacherId: 'T-003', totalDays: 15, semester: 'ឆមាសទី ២' },
];

const DEFAULT_ENROLLMENTS: Enrollment[] = [
  // Enroll Bory To
  { id: 'E-001', studentId: 'S-001', subjectId: 'SUB-001' },
  { id: 'E-002', studentId: 'S-001', subjectId: 'SUB-002' },
  { id: 'E-003', studentId: 'S-001', subjectId: 'SUB-003' },
  // Enroll Sopheap Chan
  { id: 'E-004', studentId: 'S-002', subjectId: 'SUB-001' },
  { id: 'E-005', studentId: 'S-002', subjectId: 'SUB-002' },
  // Enroll Rotha Kim
  { id: 'E-006', studentId: 'S-003', subjectId: 'SUB-001' },
  { id: 'E-007', studentId: 'S-003', subjectId: 'SUB-003' },
  // Enroll Sreypich Bou
  { id: 'E-008', studentId: 'S-004', subjectId: 'SUB-002' },
  { id: 'E-009', studentId: 'S-004', subjectId: 'SUB-004' },
  // Enroll Nika Heng
  { id: 'E-010', studentId: 'S-005', subjectId: 'SUB-001' },
  { id: 'E-011', studentId: 'S-005', subjectId: 'SUB-002' },
  { id: 'E-012', studentId: 'S-005', subjectId: 'SUB-003' },
  { id: 'E-013', studentId: 'S-005', subjectId: 'SUB-004' },
];

const DEFAULT_SEMESTERS: Semester[] = [
  { id: 'SEM-001', name: 'ឆ្នាំទី ២ - ឆមាសទី ១', isActive: true },
  { id: 'SEM-002', name: 'ឆ្នាំទី ២ - ឆមាសទី ២', isActive: false },
];

const DEFAULT_LESSONS: LessonMaterial[] = [
  { id: 'LES-001', subjectId: 'SUB-001', title: 'Syllabus Course Anatomy', fileType: 'pdf', fileName: 'Syllabus_Course_ANA-201.pdf', fileSize: '1.4MB', uploadedAt: '2026-06-01' },
  { id: 'LES-002', subjectId: 'SUB-001', title: 'Lecture Overview Anatomy Week 1', fileType: 'mp4', fileName: 'Lecture_Overview_Week1.mp4', fileSize: '48MB', uploadedAt: '2026-06-02' },
  { id: 'LES-003', subjectId: 'SUB-002', title: 'Physiology Lecture S1', fileType: 'pdf', fileName: 'Physiology_Intro_PHY-202.pdf', fileSize: '2.1MB', uploadedAt: '2026-06-03' }
];

const DEFAULT_NEWS: NewsItem[] = [
  { id: 'NEWS-001', title: 'ថ្ងៃឈប់សម្រាកបុណ្យជាតិ វិសាខបូជា នាម័យ', content: 'សាកលវិទ្យាល័យសូមអបអរសាទរ និងប្រកាសផ្អាកថ្នាក់សិក្សាទាំងអស់រយៈពេល ២ ថ្ងៃ ចាប់ពីថ្ងៃពុធនិងថ្ងៃព្រហស្បតិ៍សប្តាហ៍ក្រោយ។', badge: 'ព័ត៌មានការិយាល័យ', date: '2026-06-10' },
  { id: 'NEWS-002', title: 'ព័ត៌មានរៀបចំកាតនិស្សិត', content: 'និស្សិតគ្រប់រូបដែលមិនទាន់ទាក់ទងថតរូបកាតសមាជិកសិក្សា សូមមេត្តាមកកាន់បន្ទប់រដ្ឋបាលកណ្តាលសាលាក្នុងសប្តាហ៍នេះ។', badge: 'ទូទៅ', date: '2026-06-09' }
];

const DEFAULT_PROMOTIONS: PromotionItem[] = [
  { id: 'PROM-001', title: 'Dell & Asus Educational Alliance (AEU Student Deal)', content: 'បង្ហាញកាតអត្តសញ្ញាណនិស្សិត AEU នៅគ្រប់សាខាទូទាំងប្រទេស ដើម្បីទទួលបានការបញ្ចុះតម្លៃរហូតដល់ ១៥% លើការទិញ Laptop សិក្សា។' },
  { id: 'PROM-052', title: 'Coffee & Workspace Partnership Discount (10% Off)', content: 'ដៃគូហាងកាហ្វេជុំវិញបរិវេណសាលាផ្តល់ជូន ១០% off លើភេសជ្ជៈគ្រប់មុខជារៀងរាល់ថ្ងៃ។' }
];

const DEFAULT_TICKETS: SupportTicket[] = [
  { id: 'TKT-9952', studentId: 'S-001', studentName: 'ខឿន បូរី', subject: 'សូមស្នើកែសម្រួលវត្តមានខកខានថ្ងៃចន្ទទី០៨', category: 'វត្តមាន', status: 'ស្រាវជ្រាវរួចរាល់', date: '2026-06-08', reply: 'បុគ្គលិក៖ ក្រុមបច្ចេកទេសបានផ្ទៀងផ្ទាត់ និងកែសម្រួលដោះស្រាយរួចរាល់ហើយ។ សូមពិនិត្យឡើងវិញ។' }
];

// Seed some past attendance dates for dynamic statistics
// Let's create some records for past 4 days: 2026-06-06, 2026-06-07, 2026-06-08, 2026-06-09
const generateSeedAttendance = (): AttendanceRecord[] => {
  const dates = ['2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09'];
  const records: AttendanceRecord[] = [];
  let idCounter = 1;

  DEFAULT_ENROLLMENTS.forEach((enroll) => {
    dates.forEach((date, index) => {
      // Simulate attendance status
      // Student 1 (Bory To) is nearly perfect (9 organic total points, some missed)
      // Others have some absences to look realistic
      let scannedMorning = true;
      let scannedBreak = true;
      let mTime = '07:34:12';
      let bTime = '09:12:45';

      if (enroll.studentId === 'S-001' && index === 2) {
        // Bory To missed break scan on 2026-06-08 (1 point)
        scannedBreak = false;
        bTime = undefined;
      } else if (enroll.studentId === 'S-002' && index === 1) {
        // Sopheap missed entire day on 2026-06-07 (0 points)
        scannedMorning = false;
        scannedBreak = false;
        mTime = undefined;
        bTime = undefined;
      } else if (enroll.studentId === 'S-003' && index === 3) {
        // Rotha missed morning scan on 2026-06-09 (1 point)
        scannedMorning = false;
        mTime = undefined;
      } else if (enroll.studentId === 'S-004' && index === 0) {
        // Sreypich missed break scan on 2026-06-06
        scannedBreak = false;
        bTime = undefined;
      }

      records.push({
        id: `ATT-${idCounter++}`,
        studentId: enroll.studentId,
        subjectId: enroll.subjectId,
        date,
        scannedMorning,
        morningTime: mTime,
        scannedBreak,
        breakTime: bTime,
      });
    });
  });

  return records;
};

// Global Store Helper
export class DBStore {
  static getLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static setLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // Retrieve Entire State
  static getTeachers(): Teacher[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_teachers', isDeleted ? [] : DEFAULT_TEACHERS); 
  }
  static getStudents(): Student[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_students', isDeleted ? [] : DEFAULT_STUDENTS); 
  }
  static getSubjects(): Subject[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_subjects', isDeleted ? [] : DEFAULT_SUBJECTS); 
  }
  static getEnrollments(): Enrollment[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_enrollments', isDeleted ? [] : DEFAULT_ENROLLMENTS); 
  }
  static getSemesters(): Semester[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_semesters', isDeleted ? [] : DEFAULT_SEMESTERS); 
  }
  static getActiveSessions(): ActiveSession[] { return this.getLocalStorage('qr_sessions', []); }
  static getAttendanceRecords(): AttendanceRecord[] { 
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_attendance', isDeleted ? [] : generateSeedAttendance()); 
  }
  static getLessons(): LessonMaterial[] {
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_lessons', isDeleted ? [] : DEFAULT_LESSONS);
  }
  static getNews(): NewsItem[] {
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_news', isDeleted ? [] : DEFAULT_NEWS);
  }
  static getPromotions(): PromotionItem[] {
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_promotions', isDeleted ? [] : DEFAULT_PROMOTIONS);
  }
  static getTickets(): SupportTicket[] {
    const isDeleted = localStorage.getItem('qr_demo_deleted') === 'true';
    return this.getLocalStorage('qr_tickets', isDeleted ? [] : DEFAULT_TICKETS);
  }

  // Set All State
  static saveTeachers(teachers: Teacher[]) { this.setLocalStorage('qr_teachers', teachers); }
  static saveStudents(students: Student[]) { this.setLocalStorage('qr_students', students); }
  static saveSubjects(subjects: Subject[]) { this.setLocalStorage('qr_subjects', subjects); }
  static saveEnrollments(enrollments: Enrollment[]) { this.setLocalStorage('qr_enrollments', enrollments); }
  static saveSemesters(semesters: Semester[]) { this.setLocalStorage('qr_semesters', semesters); }
  static saveActiveSessions(sessions: ActiveSession[]) { this.setLocalStorage('qr_sessions', sessions); }
  static saveAttendanceRecords(records: AttendanceRecord[]) { this.setLocalStorage('qr_attendance', records); }
  static saveLessons(lessons: LessonMaterial[]) { this.setLocalStorage('qr_lessons', lessons); }
  static saveNews(news: NewsItem[]) { this.setLocalStorage('qr_news', news); }
  static savePromotions(promotions: PromotionItem[]) { this.setLocalStorage('qr_promotions', promotions); }
  static saveTickets(tickets: SupportTicket[]) { this.setLocalStorage('qr_tickets', tickets); }

  // Reset System State
  static resetToDefault(): void {
    localStorage.removeItem('qr_demo_deleted');
    localStorage.removeItem('qr_teachers');
    localStorage.removeItem('qr_students');
    localStorage.removeItem('qr_subjects');
    localStorage.removeItem('qr_enrollments');
    localStorage.removeItem('qr_semesters');
    localStorage.removeItem('qr_sessions');
    localStorage.removeItem('qr_attendance');
    localStorage.removeItem('qr_lessons');
    localStorage.removeItem('qr_news');
    localStorage.removeItem('qr_promotions');
    localStorage.removeItem('qr_tickets');
  }

  static deleteDemoData(): void {
    localStorage.setItem('qr_demo_deleted', 'true');
    this.saveTeachers([]);
    this.saveStudents([]);
    this.saveSubjects([]);
    this.saveEnrollments([]);
    this.saveSemesters([]);
    this.saveActiveSessions([]);
    this.saveAttendanceRecords([]);
    this.saveLessons([]);
    this.saveNews([]);
    this.savePromotions([]);
    this.saveTickets([]);
  }

  // Teacher CRUD operations
  static createTeacher(teacher: Omit<Teacher, 'id'>): Teacher {
    const teachers = this.getTeachers();
    const newTeacher = { ...teacher, id: `T-${Date.now()}` };
    teachers.push(newTeacher);
    this.saveTeachers(teachers);
    return newTeacher;
  }

  static updateTeacher(id: string, updated: Omit<Teacher, 'id'>): void {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      teachers[index] = { ...updated, id };
      this.saveTeachers(teachers);
    }
  }

  static deleteTeacher(id: string): void {
    const teachers = this.getTeachers();
    this.saveTeachers(teachers.filter(t => t.id !== id));
  }

  // Student CRUD operations
  static createStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const newStudent = { ...student, id: `S-${Date.now()}` };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  }

  static updateStudent(id: string, updated: Omit<Student, 'id'>): void {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...updated, id };
      this.saveStudents(students);
    }
  }

  static deleteStudent(id: string): void {
    const students = this.getStudents();
    this.saveStudents(students.filter(s => s.id !== id));
    // Also remove their enrollments
    const enrollments = this.getEnrollments();
    this.saveEnrollments(enrollments.filter(e => e.studentId !== id));
  }

  // Subject CRUD operations
  static createSubject(subject: Omit<Subject, 'id'>): Subject {
    const subjects = this.getSubjects();
    const newSubject = { ...subject, id: `SUB-${Date.now()}` };
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  static updateSubject(id: string, updated: Omit<Subject, 'id'>): void {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      subjects[index] = { ...updated, id };
      this.saveSubjects(subjects);
    }
  }

  static deleteSubject(id: string): void {
    const subjects = this.getSubjects();
    this.saveSubjects(subjects.filter(s => s.id !== id));
    // Clean up associated enrollments
    const enrollments = this.getEnrollments();
    this.saveEnrollments(enrollments.filter(e => e.subjectId !== id));
  }

  // Enrollment operations
  static enrollStudent(studentId: string, subjectId: string): Enrollment | null {
    const enrollments = this.getEnrollments();
    const exists = enrollments.find(e => e.studentId === studentId && e.subjectId === subjectId);
    if (exists) return null;

    const newEnroll = { id: `E-${Date.now()}`, studentId, subjectId };
    enrollments.push(newEnroll);
    this.saveEnrollments(enrollments);
    return newEnroll;
  }

  static unenrollStudent(studentId: string, subjectId: string): void {
    const enrollments = this.getEnrollments();
    this.saveEnrollments(enrollments.filter(e => !(e.studentId === studentId && e.subjectId === subjectId)));
  }

  // Semester operations
  static setSemesterActive(id: string): void {
    const semesters = this.getSemesters();
    const updated = semesters.map(s => ({ ...s, isActive: s.id === id }));
    this.saveSemesters(updated);
  }

  static createSemester(name: string): Semester {
    const semesters = this.getSemesters();
    const newSem = { id: `SEM-${Date.now()}`, name, isActive: false };
    semesters.push(newSem);
    this.saveSemesters(semesters);
    return newSem;
  }

  static deleteSemester(id: string): void {
    const semesters = this.getSemesters();
    const toDelete = semesters.find(s => s.id === id);
    const updated = semesters.filter(s => s.id !== id);
    // If we deleted the active one, mark the first other as active
    if (toDelete?.isActive && updated.length > 0) {
      updated[0].isActive = true;
    }
    this.saveSemesters(updated);
  }

  static updateSemester(id: string, name: string): void {
    const semesters = this.getSemesters();
    const index = semesters.findIndex(s => s.id === id);
    if (index !== -1) {
      semesters[index].name = name;
      this.saveSemesters(semesters);
    }
  }

  // Teacher session operations
  static startSession(subjectId: string, qrType: QRType): ActiveSession {
    const sessions = this.getActiveSessions();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes in milliseconds
    
    // Deactivate previous active sessions for this subject and type
    const updatedSessions = sessions.map(s => {
      if (s.subjectId === subjectId && s.qrType === qrType) {
        return { ...s, isActive: false };
      }
      return s;
    });

    const randToken = `QR-${subjectId}-${qrType}-${Math.floor(100000 + Math.random() * 900000)}-${now}`;
    
    const newSession: ActiveSession = {
      id: `SESS-${Date.now()}`,
      subjectId,
      qrType,
      qrcode: randToken,
      createdAt: now,
      expiresAt,
      isActive: true,
    };

    updatedSessions.push(newSession);
    this.saveActiveSessions(updatedSessions);
    return newSession;
  }

  // Validate QR and scan
  static scanQRCode(studentId: string, qrcodeValue: string): { success: boolean; message: string; record?: AttendanceRecord } {
    const sessions = this.getActiveSessions();
    const normalizedInput = qrcodeValue.trim();
    const active = sessions.find(s => {
      if (!s.isActive) return false;
      const parts = s.qrcode.split('-');
      const shortCode = parts.length >= 2 ? parts[parts.length - 2] : '';
      return s.qrcode === normalizedInput || shortCode === normalizedInput;
    });
    const now = Date.now();

    if (!active) {
      return { success: false, message: 'កូដ QR មិនត្រឹមត្រូវ ឬអស់សុពលភាពហើយ! (QR Code invalid or inactive)' };
    }

    if (now > active.expiresAt) {
      // Deactivate it
      active.isActive = false;
      this.saveActiveSessions(sessions);
      return { success: false, message: 'កូដ QR អស់សុពលភាពហើយ (កន្លងហួស ១០ នាទី) (QR Code expired - past 10 minutes)' };
    }

    // Standardize date in GMT+7 / local
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0]; // HH:MM:ss

    const records = this.getAttendanceRecords();
    let record = records.find(r => r.studentId === studentId && r.subjectId === active.subjectId && r.date === dateStr);

    if (!record) {
      record = {
        id: `ATT-${Date.now()}`,
        studentId,
        subjectId: active.subjectId,
        date: dateStr,
        scannedMorning: false,
        scannedBreak: false,
      };
      records.push(record);
    }

    if (active.qrType === 'MORNING') {
      if (record.scannedMorning) {
        return { success: true, message: 'អ្នកបានស្កេន «ចូលរៀន» រួចរាល់ហើយសម្រាប់ថ្ងៃនេះ! (Already scanned Morning)', record };
      }
      record.scannedMorning = true;
      record.morningTime = timeStr;
    } else {
      if (record.scannedBreak) {
        return { success: true, message: 'អ្នកបានស្កេន «ចេញលេង» រួចរាល់ហើយសម្រាប់ថ្ងៃនេះ! (Already scanned Break)', record };
      }
      record.scannedBreak = true;
      record.breakTime = timeStr;
    }

    this.saveAttendanceRecords(records);
    return { 
      success: true, 
      message: `ស្កេនជោគជ័យសម្រាប់ ${active.qrType === 'MORNING' ? 'ចូលរៀន (Morning)' : 'ចេញលេង (Break)'}! ម៉ោង៖ ${timeStr}`,
      record 
    };
  }

  // High-fidelity statistics calculator
  static getAttendanceStats(studentId: string, subjectId: string) {
    const subject = this.getSubjects().find(s => s.id === subjectId);
    if (!subject) return { scannedDays: 0, scannedPoints: 0, maxPoints: 0, percentage: 0, absentDays: 0 };

    const records = this.getAttendanceRecords().filter(r => r.studentId === studentId && r.subjectId === subjectId);
    
    // Max points = Days of subject * 2 scans per day
    const maxPoints = Math.max(1, subject.totalDays * 2);

    let scannedPoints = 0;
    records.forEach(r => {
      if (r.scannedMorning) scannedPoints += 1;
      if (r.scannedBreak) scannedPoints += 1;
    });

    const scannedDays = records.length;
    // Simple Percentage calculation
    const percentage = Math.round((scannedPoints / maxPoints) * 100);

    // Absent is estimated based on completed school days vs points
    // Let's assume out of the maximum allocated slots, any day with 0 scans is recorded.
    // Also, we can just display the numeric fields clearly.
    return {
      scannedDays,
      scannedPoints,
      maxPoints,
      percentage: Math.min(100, percentage),
      absentDays: Math.max(0, subject.totalDays - records.filter(r => r.scannedMorning || r.scannedBreak).length),
    };
  }
}
