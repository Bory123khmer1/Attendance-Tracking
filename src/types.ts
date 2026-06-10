/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Teacher {
  id: string;
  name: string;
  khmerName: string;
  email: string;
  phone: string;
  department: string;
  password?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g., "123456" (6-digit format requested by user)
  name: string;
  khmerName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g., "ANA-101"
  name: string;
  khmerName: string;
  teacherId: string; // Links to Teacher
  totalDays: number; // e.g., 20 days (40 scanning points)
  semester: string; // e.g., "Semester 1"
}

export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
}

export interface Semester {
  id: string;
  name: string;
  isActive: boolean;
}

export type QRType = 'MORNING' | 'BREAK';

export interface ActiveSession {
  id: string;
  subjectId: string;
  qrType: QRType;
  qrcode: string; // The token for QR code content
  createdAt: number; // timestamp
  expiresAt: number; // timestamp
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  scannedMorning: boolean;
  morningTime?: string; // HH:mm:ss
  scannedBreak: boolean;
  breakTime?: string; // HH:mm:ss
}

export type RoleMode = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface LessonMaterial {
  id: string;
  subjectId: string;
  title: string;
  fileType: 'pdf' | 'mp4' | 'link';
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  badge: string;
  date: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  content: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  studentName?: string;
  subject: string;
  category: string;
  status: string;
  date: string;
  reply?: string;
}


