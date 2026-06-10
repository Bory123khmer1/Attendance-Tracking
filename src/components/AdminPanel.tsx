/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DBStore } from '../dbStore';
import { Teacher, Student, Subject, Enrollment, Semester, LessonMaterial, NewsItem, PromotionItem, SupportTicket } from '../types';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Bookmark, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UserCheck, 
  RefreshCw, 
  Check, 
  X,
  Sparkles,
  Megaphone,
  Download,
  Video,
  FileText,
  MessageSquare
} from 'lucide-react';

interface AdminPanelProps {
  onDataChange: () => void;
}

export default function AdminPanel({ onDataChange }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'teachers' | 'students' | 'enroll' | 'semesters' | 'resources'>('subjects');
  const [activeResourceSubTab, setActiveResourceSubTab] = useState<'lessons' | 'news' | 'promotions' | 'tickets'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data lists
  const [teachers, setTeachers] = useState<Teacher[]>(() => DBStore.getTeachers());
  const [students, setStudents] = useState<Student[]>(() => DBStore.getStudents());
  const [subjects, setSubjects] = useState<Subject[]>(() => DBStore.getSubjects());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => DBStore.getEnrollments());
  const [semesters, setSemesters] = useState<Semester[]>(() => DBStore.getSemesters());

  // Dynamic Resource Lists
  const [lessons, setLessons] = useState<LessonMaterial[]>(() => DBStore.getLessons());
  const [news, setNews] = useState<NewsItem[]>(() => DBStore.getNews());
  const [promotions, setPromotions] = useState<PromotionItem[]>(() => DBStore.getPromotions());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => DBStore.getTickets());

  // Edit/Create Modal states
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', khmerName: '', email: '', phone: '', department: '', password: '' });

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ studentId: '', name: '', khmerName: '', email: '', phone: '', password: '' });

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', khmerName: '', teacherId: '', totalDays: 20, semester: 'ឆមាសទី ១' });

  const [enrollForm, setEnrollForm] = useState({ studentId: '', subjectId: '' });
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ name: '', isActive: false });

  // 1. Lessons Form
  const [editingLesson, setEditingLesson] = useState<LessonMaterial | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ subjectId: '', title: '', fileType: 'pdf' as 'pdf' | 'mp4' | 'link', fileName: '', fileSize: '' });

  // 2. News Form
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', badge: 'ព័ត៌មានការិយាល័យ' });

  // 3. Promotions Form
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionForm, setPromotionForm] = useState({ title: '', content: '' });

  // 4. Ticket Form
  const [replyingTicket, setReplyingTicket] = useState<SupportTicket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ reply: '', status: '' });

  // Refresh lists
  const refreshAll = () => {
    setTeachers(DBStore.getTeachers());
    setStudents(DBStore.getStudents());
    setSubjects(DBStore.getSubjects());
    setEnrollments(DBStore.getEnrollments());
    setSemesters(DBStore.getSemesters());
    setLessons(DBStore.getLessons());
    setNews(DBStore.getNews());
    setPromotions(DBStore.getPromotions());
    setTickets(DBStore.getTickets());
    onDataChange();
  };

  const handleResetData = () => {
    if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្ន័យឡើងវិញទាំងស្រុងមែនទេ? (Are you sure you want to reset all data to default?)')) {
      DBStore.resetToDefault();
      refreshAll();
    }
  };

  const handleDeleteDemo = () => {
    if (confirm('តើអ្នកចង់លុបទិន្នន័យគំរូ (Demo Data) ទាំងអស់ចេញដើម្បីចាប់ផ្ដើមទិន្នន័យទទេរមែនទេ? (Are you sure you want to delete all demo data and start with an empty database?)')) {
      DBStore.deleteDemoData();
      refreshAll();
    }
  };

  // --- TEACHER CRUD ---
  const handleOpenTeacherModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setTeacherForm({ 
        name: teacher.name, 
        khmerName: teacher.khmerName, 
        email: teacher.email, 
        phone: teacher.phone, 
        department: teacher.department,
        password: teacher.password || '123'
      });
    } else {
      setEditingTeacher(null);
      setTeacherForm({ name: '', khmerName: '', email: '', phone: '', department: 'Medicine', password: '123' });
    }
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.khmerName || !teacherForm.email) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់ (Please fill in the required fields)');
      return;
    }

    if (editingTeacher) {
      DBStore.updateTeacher(editingTeacher.id, teacherForm);
    } else {
      DBStore.createTeacher(teacherForm);
    }
    setShowTeacherModal(false);
    refreshAll();
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបគ្រូ៖ "${name}" មែនទេ? (Do you want to delete this teacher?)`)) {
      DBStore.deleteTeacher(id);
      refreshAll();
    }
  };

  // --- STUDENT CRUD ---
  const handleOpenStudentModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({ 
        studentId: student.studentId, 
        name: student.name, 
        khmerName: student.khmerName, 
        email: student.email, 
        phone: student.phone,
        password: student.password || '123'
      });
    } else {
      setEditingStudent(null);
      // Auto-create code of student with 6 digits instantly
      const random6DigitId = `${Math.floor(100000 + Math.random() * 900000)}`;
      setStudentForm({ studentId: random6DigitId, name: '', khmerName: '', email: '', phone: '', password: '123' });
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.studentId || !studentForm.name || !studentForm.khmerName || !studentForm.email) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់ (Please fill in the required fields)');
      return;
    }

    // Validate Student ID must be a 6 digit number
    if (!/^\d{6}$/.test(studentForm.studentId)) {
      alert('អត្តសញ្ញាណនិស្សិតត្រូវតែជាលេខ ៦ ខ្ទង់! (Student ID must be exactly a 6-digit number, e.g., 446123)');
      return;
    }

    if (editingStudent) {
      DBStore.updateStudent(editingStudent.id, studentForm);
    } else {
      DBStore.createStudent(studentForm);
    }
    setShowStudentModal(false);
    refreshAll();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបនិស្សិត៖ "${name}" មែនទេ? (Do you want to delete this student?)`)) {
      DBStore.deleteStudent(id);
      refreshAll();
    }
  };

  // --- SUBJECT CRUD ---
  const handleOpenSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({ code: subject.code, name: subject.name, khmerName: subject.khmerName, teacherId: subject.teacherId, totalDays: subject.totalDays, semester: subject.semester });
    } else {
      setEditingSubject(null);
      // Auto-create code with school standard design
      const randomCode = `AEU-${Math.floor(100 + Math.random() * 900)}`;
      setSubjectForm({
        code: randomCode,
        name: '',
        khmerName: '',
        teacherId: teachers[0]?.id || '',
        totalDays: 20,
        semester: semesters.find(s => s.isActive)?.name || 'ឆមាសទី ១'
      });
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name || !subjectForm.khmerName || !subjectForm.teacherId) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់ និងជ្រើសរើសគ្រូបង្រៀន (Please fill all fields and select teacher)');
      return;
    }

    if (editingSubject) {
      DBStore.updateSubject(editingSubject.id, {
        ...subjectForm,
        totalDays: Number(subjectForm.totalDays)
      });
    } else {
      DBStore.createSubject({
        ...subjectForm,
        totalDays: Number(subjectForm.totalDays)
      });
    }
    setShowSubjectModal(false);
    refreshAll();
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបមុខវិជ្ជា៖ "${name}" មែនទេ? (Do you want to delete this subject? All enrollments will be deleted!)`)) {
      DBStore.deleteSubject(id);
      refreshAll();
    }
  };

  // --- ENROLLMENT ---
  const handleSaveEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.studentId || !enrollForm.subjectId) {
      alert('សូមជ្រើសរើសនិស្សិត និងមុខវិជ្ជា (Please select both student and subject)');
      return;
    }

    const res = DBStore.enrollStudent(enrollForm.studentId, enrollForm.subjectId);
    if (!res) {
      alert('និស្សិតនេះបានចុះឈ្មោះក្នុងមុខវិជ្ជាវត្តមានរួចហើយ (Student already enrolled in this subject)');
    } else {
      setShowEnrollModal(false);
      refreshAll();
    }
  };

  const handleUnenroll = (studentId: string, subjectId: string) => {
    if (confirm('តើអ្នកចង់លុបឈ្មោះនិស្សិតនេះចេញពីមុខវិជ្ជាមែនទេ? (Do you want to unenroll this student?)')) {
      DBStore.unenrollStudent(studentId, subjectId);
      refreshAll();
    }
  };

  // --- SEMESTERS ---
  const handleOpenSemesterModal = (semester?: Semester) => {
    if (semester) {
      setEditingSemester(semester);
      setSemesterForm({ name: semester.name, isActive: semester.isActive });
    } else {
      setEditingSemester(null);
      setSemesterForm({ name: '', isActive: false });
    }
    setShowSemesterModal(true);
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterForm.name) {
      alert('សូមបំពេញឈ្មោះឆមាស (Please enter semester name)');
      return;
    }

    if (editingSemester) {
      DBStore.updateSemester(editingSemester.id, semesterForm.name);
      if (semesterForm.isActive) {
        DBStore.setSemesterActive(editingSemester.id);
      }
    } else {
      const added = DBStore.createSemester(semesterForm.name);
      if (semesterForm.isActive) {
        DBStore.setSemesterActive(added.id);
      }
    }
    setShowSemesterModal(false);
    refreshAll();
  };

  const handleDeleteSemester = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបឆមាស៖ "${name}" មែនទេ?`)) {
      DBStore.deleteSemester(id);
      refreshAll();
    }
  };

  const handleMarkSemesterActive = (id: string) => {
    DBStore.setSemesterActive(id);
    refreshAll();
  };

  // --- LESSON CRUD ---
  const handleOpenLessonModal = (lesson?: LessonMaterial) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        subjectId: lesson.subjectId,
        title: lesson.title,
        fileType: lesson.fileType,
        fileName: lesson.fileName,
        fileSize: lesson.fileSize || ''
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        subjectId: subjects[0]?.id || '',
        title: '',
        fileType: 'pdf',
        fileName: '',
        fileSize: '1.5MB'
      });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title || !lessonForm.fileName) {
      alert('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }
    const currentLessons = DBStore.getLessons();
    if (editingLesson) {
      const updated = currentLessons.map(l => l.id === editingLesson.id ? {
        ...l,
        ...lessonForm
      } : l);
      DBStore.saveLessons(updated);
    } else {
      const newLesson: LessonMaterial = {
        id: `LES-${Date.now()}`,
        subjectId: lessonForm.subjectId,
        title: lessonForm.title,
        fileType: lessonForm.fileType,
        fileName: lessonForm.fileName,
        fileSize: lessonForm.fileSize || '1.0MB',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      DBStore.saveLessons([...currentLessons, newLesson]);
    }
    setShowLessonModal(false);
    refreshAll();
  };

  const handleDeleteLesson = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបមេរៀន៖ "${name}" មែនទេ?`)) {
      const updated = DBStore.getLessons().filter(l => l.id !== id);
      DBStore.saveLessons(updated);
      refreshAll();
    }
  };

  // --- NEWS CRUD ---
  const handleOpenNewsModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        title: item.title,
        content: item.content,
        badge: item.badge
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        content: '',
        badge: 'ព័ត៌មានការិយាល័យ'
      });
    }
    setShowNewsModal(true);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      alert('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }
    const currentNews = DBStore.getNews();
    if (editingNews) {
      const updated = currentNews.map(n => n.id === editingNews.id ? {
        ...n,
        ...newsForm
      } : n);
      DBStore.saveNews(updated);
    } else {
      const newItem: NewsItem = {
        id: `NEWS-${Date.now()}`,
        title: newsForm.title,
        content: newsForm.content,
        badge: newsForm.badge,
        date: new Date().toISOString().split('T')[0]
      };
      DBStore.saveNews([...currentNews, newItem]);
    }
    setShowNewsModal(true); // close or reset
    setShowNewsModal(false);
    refreshAll();
  };

  const handleDeleteNews = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបសេចក្តីជូនដំណឹង៖ "${name}" មែនទេ?`)) {
      const updated = DBStore.getNews().filter(n => n.id !== id);
      DBStore.saveNews(updated);
      refreshAll();
    }
  };

  // --- PROMOTION CRUD ---
  const handleOpenPromotionModal = (item?: PromotionItem) => {
    if (item) {
      setEditingPromotion(item);
      setPromotionForm({
        title: item.title,
        content: item.content
      });
    } else {
      setEditingPromotion(null);
      setPromotionForm({
        title: '',
        content: ''
      });
    }
    setShowPromotionModal(true);
  };

  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotionForm.title || !promotionForm.content) {
      alert('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }
    const currentPromos = DBStore.getPromotions();
    if (editingPromotion) {
      const updated = currentPromos.map(p => p.id === editingPromotion.id ? {
        ...p,
        ...promotionForm
      } : p);
      DBStore.savePromotions(updated);
    } else {
      const newPromo: PromotionItem = {
        id: `PROM-${Date.now()}`,
        title: promotionForm.title,
        content: promotionForm.content
      };
      DBStore.savePromotions([...currentPromos, newPromo]);
    }
    setShowPromotionModal(false);
    refreshAll();
  };

  const handleDeletePromotion = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបប្រូម៉ូសិន៖ "${name}" មែនទេ?`)) {
      const updated = DBStore.getPromotions().filter(p => p.id !== id);
      DBStore.savePromotions(updated);
      refreshAll();
    }
  };

  // --- TICKET REPLY ---
  const handleOpenTicketModal = (item: SupportTicket) => {
    setReplyingTicket(item);
    setTicketForm({
      reply: item.reply || '',
      status: item.status
    });
    setShowTicketModal(true);
  };

  const handleSaveTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket) return;
    const currentTickets = DBStore.getTickets();
    const updated = currentTickets.map(t => t.id === replyingTicket.id ? {
      ...t,
      reply: ticketForm.reply,
      status: ticketForm.status
    } : t);
    DBStore.saveTickets(updated);
    setShowTicketModal(false);
    refreshAll();
  };

  const handleDeleteTicket = (id: string, name: string) => {
    if (confirm(`តើអ្នកចង់លុបសំបុត្រទំនាក់ទំនង៖ "${name}" មែនទេ?`)) {
      const updated = DBStore.getTickets().filter(t => t.id !== id);
      DBStore.saveTickets(updated);
      refreshAll();
    }
  };

  // Helper resolvers
  const getTeacherName = (tId: string) => {
    const t = teachers.find(x => x.id === tId);
    return t ? `${t.khmerName} (${t.name})` : 'មិនស្គាល់គ្រូ';
  };

  const getStudentDetails = (sId: string) => {
    return students.find(x => x.id === sId) || { name: 'N/A', khmerName: 'N/A', studentId: 'N/A' };
  };

  const getSubjectDetails = (subId: string) => {
    return subjects.find(x => x.id === subId) || { name: 'N/A', khmerName: 'N/A', code: 'N/A' };
  };

  // Filter systems
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.khmerName.includes(searchQuery) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.khmerName.includes(searchQuery) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.khmerName.includes(searchQuery) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => {
    const s = getStudentDetails(e.studentId);
    const sub = getSubjectDetails(e.subjectId);
    return (
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.khmerName && s.khmerName.includes(searchQuery)) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.khmerName && sub.khmerName.includes(searchQuery)) ||
      (sub.code && sub.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6" id="admin_panel_wrapper">
      {/* Search query & title row - Highly compact to replace deleted large banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-200" id="admin_top_row">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            <GraduationCap className="text-teal-700" size={24} />
            ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យរួម <span className="text-teal-800 font-mono text-xs uppercase bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Admin Setup Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            រៀបចំគណនីគ្រូ និស្សិត មុខវិជ្ជា និងចុះឈ្មោះសិស្ស។
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={handleDeleteDemo}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            id="delete_demo_btn"
          >
            <Trash2 size={12} /> លុបទិន្នន័យគំរូវត្តមាន (Delete Demo)
          </button>
          <button 
            type="button"
            onClick={handleResetData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            id="reset_system_btn"
          >
            <RefreshCw size={12} /> កំណត់ឡើងវិញទាំងស្រុង (Reset DB)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin_core_layout">
        
        {/* Navigation Sidebar Hub */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-2" id="admin_sidebar_menu">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">តួនាទីគ្រប់គ្រង (Panels)</h3>
            
            <nav className="flex lg:flex-col flex-wrap gap-1">
              <button 
                onClick={() => { setActiveSubTab('subjects'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'subjects' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <BookOpen size={18} className={activeSubTab === 'subjects' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>មុខវិជ្ជា (Subjects)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'subjects' ? 'bg-white/20' : 'bg-slate-100'}`}>{subjects.length}</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveSubTab('teachers'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'teachers' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Users size={18} className={activeSubTab === 'teachers' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>គ្រូបង្រៀន (Teachers)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'teachers' ? 'bg-white/20' : 'bg-slate-100'}`}>{teachers.length}</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveSubTab('students'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'students' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <GraduationCap size={18} className={activeSubTab === 'students' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>និស្សិត (Students)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'students' ? 'bg-white/20' : 'bg-slate-100'}`}>{students.length}</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveSubTab('enroll'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'enroll' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <UserCheck size={18} className={activeSubTab === 'enroll' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>ចាត់សិស្សចូលថ្នាក់ (Enroll)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'enroll' ? 'bg-white/20' : 'bg-slate-100'}`}>{enrollments.length}</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveSubTab('semesters'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'semesters' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Calendar size={18} className={activeSubTab === 'semesters' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>ឆមាស (Semesters)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'semesters' ? 'bg-white/20' : 'bg-slate-100'}`}>{semesters.length}</span>
                </div>
              </button>

              <button 
                onClick={() => { setActiveSubTab('resources'); setSearchQuery(''); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activeSubTab === 'resources' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Megaphone size={18} className={activeSubTab === 'resources' ? 'text-blue-200' : 'text-slate-400'} />
                <div className="flex justify-between items-center w-full">
                  <span>ធនធាន & ព័ត៌មាន (Resources & Support)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'resources' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {lessons.length + news.length + promotions.length + tickets.filter(t => !t.reply).length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Quick System Stats Visual widget */}
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow">
            <h4 className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <Sparkles size={11} /> ស្ថិតិប្រព័ន្ធសរុប
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">គ្រូសរុប</p>
                <p className="text-lg font-bold text-white font-sans">{teachers.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">និស្សិតសរុប</p>
                <p className="text-lg font-bold text-white font-sans">{students.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium">មុខវិជ្ជាសរុប</p>
                <p className="text-lg font-bold text-white font-sans">{subjects.length}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium font-sans">Enroll</p>
                <p className="text-lg font-bold text-white font-sans">{enrollments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="col-span-1 lg:col-span-9" id="admin_main_content">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Search Bar & Action Button Controller */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  placeholder={`ស្វែងរក... (${activeSubTab})`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-400"
                  id="admin_universal_search_input"
                />
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center gap-2">
                {activeSubTab === 'teachers' && (
                  <button 
                    onClick={() => handleOpenTeacherModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-155 active:scale-95 cursor-pointer shadow-sm"
                    id="add_teacher_intent_btn"
                  >
                    <Plus size={16} /> បង្កើតគ្រូថ្មី (New Teacher)
                  </button>
                )}
                {activeSubTab === 'students' && (
                  <button 
                    onClick={() => handleOpenStudentModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-155 active:scale-95 cursor-pointer shadow-sm"
                    id="add_student_intent_btn"
                  >
                    <Plus size={16} /> បង្កើតនិស្សិតថ្មី (New Student)
                  </button>
                )}
                {activeSubTab === 'subjects' && (
                  <button 
                    onClick={() => handleOpenSubjectModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-155 active:scale-95 cursor-pointer shadow-sm"
                    id="add_subject_intent_btn"
                  >
                    <Plus size={16} /> បង្កើតមុខវិជ្ជាថ្មី (New Subject)
                  </button>
                )}
                {activeSubTab === 'enroll' && (
                  <button 
                    onClick={() => {
                      if (students.length === 0 || subjects.length === 0) {
                        alert('សូមបង្កើតនិស្សិត និងមុខវិជ្ជាជាមុនសិន! (Create students and subjects first)');
                        return;
                      }
                      setEnrollForm({ studentId: students[0].id, subjectId: subjects[0].id });
                      setShowEnrollModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-155 active:scale-95 cursor-pointer shadow-sm"
                    id="enroll_student_intent_btn"
                  >
                    <Plus size={16} /> ចុះឈ្មោះនិស្សិតចូលថ្នាក់
                  </button>
                )}
                {activeSubTab === 'semesters' && (
                  <button 
                    onClick={() => handleOpenSemesterModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-155 active:scale-95 cursor-pointer shadow-sm"
                    id="add_semester_intent_btn"
                  >
                    <Plus size={16} /> បង្កើតឆមាសថ្មី
                  </button>
                )}
              </div>
            </div>


            {/* Sub-Views */}
            <div className="p-4" id="admin_dynamic_subview_area">
              
              {/* SUBVIEW 1: SUBJECTS */}
              {activeSubTab === 'subjects' && (
                <div className="overflow-x-auto" id="admin_subjects_table_parent">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                        <th className="py-2.5 px-3">កូដថ្នាក់</th>
                        <th className="py-2.5 px-3">ឈ្មោះមុខវិជ្ជា (Subject)</th>
                        <th className="py-2.5 px-3">គ្រូបង្រៀន (Lecturer)</th>
                        <th className="py-2.5 px-3 text-center">ឆមាស</th>
                        <th className="py-2.5 px-3 text-center">ចំនួនថ្ងៃរៀន (២ ស្កេន/ថ្ងៃ)</th>
                        <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredSubjects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">មិនមានទិន្នន័យស្របនឹងការស្វែងរកទេ</td>
                        </tr>
                      ) : (
                        filteredSubjects.map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs font-semibold text-teal-800">{sub.code}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{sub.khmerName}</div>
                              <div className="text-xs text-slate-500 font-sans">{sub.name}</div>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-600">
                              {getTeacherName(sub.teacherId)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {sub.semester}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-xs font-semibold text-slate-800 font-sans">
                              {sub.totalDays} ថ្ងៃ ({sub.totalDays * 2} ពិន្ទុ)
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenSubjectModal(sub)}
                                  className="p-1 px-2 text-xs bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors flex items-center gap-1"
                                >
                                  <Edit3 size={13} /> កែ
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubject(sub.id, sub.khmerName)}
                                  className="p-1 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBVIEW 2: TEACHERS */}
              {activeSubTab === 'teachers' && (
                <div className="overflow-x-auto" id="admin_teachers_table_parent">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                        <th className="py-2.5 px-3">គ្រូបង្គោល</th>
                        <th className="py-2.5 px-3">អុីមែល និងផែនកា</th>
                        <th className="py-2.5 px-3">លេខទូរស័ព្ទ</th>
                        <th className="py-2.5 px-3">ដេប៉ាតឺម៉ង់</th>
                        <th className="py-2.5 px-3">លេខសម្ងាត់ (Password)</th>
                        <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">មិនមានគណនីគ្រូទេ</td>
                        </tr>
                      ) : (
                        filteredTeachers.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{t.khmerName}</div>
                              <div className="text-xs text-slate-500 font-sans">{t.name}</div>
                            </td>
                            <td className="py-3 px-3 font-sans text-xs text-slate-600">
                              {t.email}
                            </td>
                            <td className="py-3 px-3 font-sans text-xs text-slate-600">
                              {t.phone}
                            </td>
                            <td className="py-3 px-3">
                              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                {t.department}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                                {t.password || '123'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenTeacherModal(t)}
                                  className="p-1 px-2 text-xs bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors flex items-center gap-1"
                                >
                                  <Edit3 size={13} /> កែ
                                </button>
                                <button 
                                  onClick={() => handleDeleteTeacher(t.id, t.khmerName)}
                                  className="p-1 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBVIEW 3: STUDENTS */}
              {activeSubTab === 'students' && (
                <div className="overflow-x-auto" id="admin_students_table_parent">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                        <th className="py-2.5 px-3">អត្តសញ្ញាណ (Student ID)</th>
                        <th className="py-2.5 px-3">ឈ្មោះនិស្សិត (Name)</th>
                        <th className="py-2.5 px-3">អុីមែល</th>
                        <th className="py-2.5 px-3">លេខទូរស័ព្ទ</th>
                        <th className="py-2.5 px-3">លេខសម្ងាត់ (Password)</th>
                        <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">មិនមានគណនីនិស្សិតទេ</td>
                        </tr>
                      ) : (
                        filteredStudents.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs font-semibold text-teal-800">{s.studentId}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{s.khmerName}</div>
                              <div className="text-xs text-slate-500 font-sans">{s.name}</div>
                            </td>
                            <td className="py-3 px-3 font-sans text-xs text-slate-600">
                              {s.email}
                            </td>
                            <td className="py-3 px-3 font-sans text-xs text-slate-600">
                              {s.phone}
                            </td>
                            <td className="py-3 px-3">
                              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                                {s.password || '123'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenStudentModal(s)}
                                  className="p-1 px-2 text-xs bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors flex items-center gap-1"
                                >
                                  <Edit3 size={13} /> កែ
                                </button>
                                <button 
                                  onClick={() => handleDeleteStudent(s.id, s.khmerName)}
                                  className="p-1 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBVIEW 4: ENROLLMENTS */}
              {activeSubTab === 'enroll' && (
                <div id="admin_enrollments_subview">
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-800 mb-4 font-medium flex items-center gap-2">
                    <Sparkles size={14} className="text-teal-600 shrink-0" />
                    <span>និស្សិតម្នាក់ៗអាចចុះឈ្មោះរៀនបានច្រើនមុខវិជ្ជា។ វត្តមានរបស់ពួកគេនឹងត្រូវបានផ្លាស់ប្ដូរភ្លាមៗនៅពេលចុះឈ្មោះចូលថ្នាក់រួច។</span>
                  </div>

                  <div className="overflow-x-auto" id="admin_enrollments_table_parent">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                          <th className="py-2.5 px-3">និស្សិត</th>
                          <th className="py-2.5 px-3">អត្តសញ្ញាណ</th>
                          <th className="py-2.5 px-3">មុខវិជ្ជាថ្នាក់វត្តមាន (Subject)</th>
                          <th className="py-2.5 px-3">កូដថ្នាក់</th>
                          <th className="py-2.5 px-3 text-right">ដកសិស្សចេញ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredEnrollments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">មិនមានបញ្ជីឈ្មោះសិស្សតាមថ្នាក់នៅឡើយទេ</td>
                          </tr>
                        ) : (
                          filteredEnrollments.map(e => {
                            const student = getStudentDetails(e.studentId);
                            const subject = getSubjectDetails(e.subjectId);
                            return (
                              <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-slate-800">{student.khmerName}</div>
                                  <div className="text-xs text-slate-500 font-sans">{student.name}</div>
                                </td>
                                <td className="py-3 px-3 font-mono text-xs">{student.studentId}</td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-700">{subject.khmerName}</div>
                                  <div className="text-xs text-slate-500 font-sans">{subject.name}</div>
                                </td>
                                <td className="py-3 px-3 font-mono text-xs text-teal-800 font-semibold">{subject.code}</td>
                                <td className="py-3 px-3 text-right">
                                  <button 
                                    onClick={() => handleUnenroll(e.studentId, e.subjectId)}
                                    className="p-1 px-2.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors inline-flex items-center gap-1"
                                  >
                                    <Trash2 size={12} /> លុបចេញ (Remove)
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBVIEW 5: SEMESTERS */}
              {activeSubTab === 'semesters' && (
                <div className="max-w-xl" id="admin_semesters_subview">
                  <div className="overflow-x-auto" id="admin_semesters_table_parent">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                          <th className="py-2.5 px-3">ឈ្មោះឆមាស (Semester Name)</th>
                          <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
                          <th className="py-2.5 px-3 text-right">សកម្មភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {semesters.map(sem => (
                          <tr key={sem.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-800">{sem.name}</td>
                            <td className="py-3 px-3 text-center">
                              {sem.isActive ? (
                                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                  <Check size={12} /> កំពុងប្រើប្រាស់
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleMarkSemesterActive(sem.id)}
                                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium transition-colors"
                                >
                                  កំណត់ជាសកម្ម
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleOpenSemesterModal(sem)}
                                  className="p-1 px-2 text-xs bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors"
                                >
                                  កែ
                                </button>
                                <button 
                                  onClick={() => handleDeleteSemester(sem.id, sem.name)}
                                  disabled={sem.isActive && semesters.length > 1}
                                  className={`p-1 px-2 text-xs rounded transition-colors ${sem.isActive && semesters.length > 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                                >
                                  លុប
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBVIEW 6: RESOURCES & PORTALS */}
              {activeSubTab === 'resources' && (
                <div id="admin_resources_portal_section" className="space-y-6">
                  
                  {/* Nest Selection Tab Bar */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveResourceSubTab('lessons')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeResourceSubTab === 'lessons'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <BookOpen size={12} />
                      <span>មេរៀន/ឯកសារ ({lessons.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResourceSubTab('news')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeResourceSubTab === 'news'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Megaphone size={12} />
                      <span>ព័ត៌មាន/សេចក្តីជូនដំណឹង ({news.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResourceSubTab('promotions')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeResourceSubTab === 'promotions'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Sparkles size={12} />
                      <span>ការផ្តល់ជូនប្រូម៉ូសិន ({promotions.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResourceSubTab('tickets')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeResourceSubTab === 'tickets'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <MessageSquare size={12} />
                      <span>ពាក្យស្នើសុំ/ទំនាក់ទំនង ({tickets.length})</span>
                      {tickets.filter(t => !t.reply).length > 0 && (
                        <span className="bg-red-500 text-white text-[8px] font-mono px-1 rounded-full">{tickets.filter(t => !t.reply).length}</span>
                      )}
                    </button>
                  </div>

                  {/* 1. LESSON MATERIALS SUBTAB */}
                  {activeResourceSubTab === 'lessons' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-650 font-bold">📚 គ្រប់គ្រងឯកសារ និងស្លាយមេរៀន (Course Handouts Manager)</p>
                        <button
                          type="button"
                          onClick={() => handleOpenLessonModal()}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus size={12} /> បង្ហោះមេរៀនថ្មី (Upload Lesson)
                        </button>
                      </div>

                      <div className="overflow-x-auto text-[13px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-xs font-bold text-slate-550 bg-slate-50">
                              <th className="py-2 px-3">មុខវិជ្ជា/ថ្នាក់</th>
                              <th className="py-2 px-3">ចំណងជើងមេរៀន</th>
                              <th className="py-2 px-3">ប្រភេទឯកសារ</th>
                              <th className="py-2 px-3">ឈ្មោះហ្វាល់</th>
                              <th className="py-2 px-3">ទំហំ</th>
                              <th className="py-2 px-3 text-right">សកម្មភាព</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lessons.map(l => {
                              const sub = getSubjectDetails(l.subjectId);
                              return (
                                <tr key={l.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3">
                                    <span className="bg-slate-100 text-slate-705 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">
                                      {sub.code}
                                    </span>
                                    <div className="text-xs text-slate-500 mt-0.5">{sub.khmerName}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-800">{l.title}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                      l.fileType === 'pdf' ? 'bg-red-50 border-red-200 text-red-700' :
                                      l.fileType === 'mp4' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                      'bg-amber-50 border-amber-200 text-amber-700'
                                    }`}>
                                      {l.fileType.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{l.fileName}</td>
                                  <td className="py-2.5 px-3 text-xs text-slate-400">{l.fileSize || 'N/A'}</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenLessonModal(l)}
                                        className="p-1 px-1.5 text-xs bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors cursor-pointer"
                                      >
                                        កែសម្រួល
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(l.id, l.title)}
                                        className="p-1 px-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors cursor-pointer"
                                      >
                                        លុប
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 2. CAMPUS NEWS SUBTAB */}
                  {activeResourceSubTab === 'news' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-650 font-bold">📢 គ្រប់គ្រងព័ត៌មាន និងសេចក្តីជូនដំណឹង (Notice Board Manager)</p>
                        <button
                          type="button"
                          onClick={() => handleOpenNewsModal()}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus size={12} /> បង្កើតព័ត៌មានថ្មី (Public Notice)
                        </button>
                      </div>

                      <div className="space-y-3 pt-1">
                        {news.map(item => (
                          <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-2xs transition-all relative">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenNewsModal(item)}
                                className="p-1 px-2 text-[10.5px] bg-slate-100 hover:bg-blue-50 text-blue-700 rounded font-bold cursor-pointer"
                              >
                                កែប្រែ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNews(item.id, item.title)}
                                className="p-1 px-2 text-[10.5px] bg-red-50 hover:bg-red-100 text-red-600 rounded font-bold cursor-pointer"
                              >
                                លុប
                              </button>
                            </div>
                            <span className="text-[10px] bg-rose-50 text-rose-850 border border-rose-200 px-2 py-0.5 rounded font-extrabold shadow-4xs">
                              {item.badge}
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-850 mt-2.5 max-w-[80%]">{item.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed max-w-[85%]">{item.content}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-2 block">កាលបរិច្ឆេទប្រកាស៖ {item.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. PROMOTION OFFERS SUBTAB */}
                  {activeResourceSubTab === 'promotions' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-650 font-bold">🎁 គ្រប់គ្រងកម្មវិធីប្រូម៉ូសិននិស្សិត AEU (Student Offers Manager)</p>
                        <button
                          type="button"
                          onClick={() => handleOpenPromotionModal()}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus size={12} /> បង្កើតកម្មវិធីថ្មី (Add Offer)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promotions.map(item => (
                          <div key={item.id} className="border border-purple-100 rounded-xl p-4 bg-gradient-to-tr from-white to-purple-50/5 hover:shadow-2xs transition-all relative">
                            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPromotionModal(item)}
                                className="p-1 text-[11px] bg-slate-100 hover:bg-purple-100 text-purple-700 rounded font-extrabold cursor-pointer"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePromotion(item.id, item.title)}
                                className="p-1 text-[11px] bg-red-50 hover:bg-red-100 text-red-650 rounded font-extrabold cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <h5 className="font-extrabold text-xs text-purple-950 pr-12 flex items-center gap-1">
                              💎 {item.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed whitespace-pre-line">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. HELPDESK TICKETS SUPPORT COLUMN */}
                  {activeResourceSubTab === 'tickets' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-650 font-bold">💬 ប្រអប់ទទួលពាក្យសុំ និងបញ្ហាផ្សេងៗពីនិស្សិត (Helpdesk Inbox Manager)</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">រាល់សំណើសុំកែសម្រួលវត្តមាន មតិស្ថាបនា ឬបញ្ហាប្រើប្រាស់របស់សិស្ស នឹងបញ្ចប់ត្រង់ចំណុចនេះ។</p>
                      </div>

                      <div className="space-y-4">
                        {tickets.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-8">គ្មានពាក្យកែតម្រែតម្រូវវត្តមានរបស់សិស្សទេ</p>
                        ) : (
                          tickets.map(t => {
                            const student = getStudentDetails(t.studentId);
                            return (
                              <div key={t.id} className={`border p-4 rounded-xl bg-white space-y-3 shadow-4xs ${!t.reply ? 'border-amber-250 bg-amber-50/10' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-xs text-[#1e293b]">{t.subject}</span>
                                      <span className="text-[9px] font-mono text-slate-400">({t.id})</span>
                                    </div>
                                    <p className="text-[10.5px] font-bold text-slate-500 mt-0.5">
                                      ផ្ញើដោយនិស្សិត៖ <span className="text-blue-600">{student.khmerName} ({student.studentId})</span>
                                    </p>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    t.status.includes('ដោះស្រាយ') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                    t.status.includes('Pending') || t.status.includes('ត្រួតពិនិត្យ') ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    'bg-blue-50 border-blue-200 text-blue-700'
                                  }`}>
                                    {t.status}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                                  <span className="font-extrabold text-slate-500">ប្រភេទបញ្ហា៖</span> {t.category} | <span className="font-extrabold text-slate-500">កាលបរិច្ឆេទ៖</span> {t.date}
                                </div>

                                {t.reply ? (
                                  <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-800">
                                    <b>ឆ្លើយតប៖</b> {t.reply}
                                  </div>
                                ) : (
                                  <div className="bg-amber-50/30 p-2.5 rounded-lg border border-amber-100 text-[11px] text-amber-800 italic">
                                    រង់ចាំរដ្ឋបាលឆ្លើយតប...
                                  </div>
                                )}

                                <div className="flex items-center gap-2 justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenTicketModal(t)}
                                    className="p-1 px-3 text-xs bg-slate-100 hover:bg-blue-600 hover:text-white text-blue-800 font-bold rounded transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Edit3 size={11} /> {!t.reply ? 'សរសេរឆ្លើយតប (Reply)' : 'កែការឆ្លើយតប'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTicket(t.id, t.subject)}
                                    className="p-1 px-2.5 text-xs bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded transition-colors cursor-pointer"
                                  >
                                    លុបចោល
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: TEACHER EDITOR --- */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="teacher_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-teal-850 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Users size={18} /> {editingTeacher ? 'កែសម្រួលគណនីគ្រូ' : 'ចុះឈ្មោះបង្កើតគ្រូថ្មី'}
              </h3>
              <button onClick={() => setShowTeacherModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveTeacher} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះជាភាសាខ្មែរ *</label>
                <input 
                  type="text" 
                  value={teacherForm.khmerName}
                  onChange={(e) => setTeacherForm({...teacherForm, khmerName: e.target.value})}
                  placeholder="ឧ. លោកគ្រូ ស្រ៊ិន សំណាង"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อสากល / English Name *</label>
                <input 
                  type="text" 
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  placeholder="e.g. Dr. Samnang Sok"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អុីមែលផ្លូវការ (Email) *</label>
                <input 
                  type="email" 
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                  placeholder="e.g. samnang@university.edu.kh"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone Number)</label>
                <input 
                  type="text" 
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                  placeholder="e.g. 012 345 678"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ដេប៉ាតឺម៉ង់ / ផ្នែកបង្រៀន (Department)</label>
                <select 
                  value={teacherForm.department}
                  onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="Medicine">Medicine (កាយវិភាគវិទ្យា/សរីរវិទ្យា)</option>
                  <option value="Science">General Science (វិទ្យាសាស្ត្រពិត)</option>
                  <option value="Pharmacy">Pharmacy (ឱសថសាស្ត្រ)</option>
                  <option value="Nursing">Nursing (គិលានុបដ្ឋាក)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខកូដសម្ងាត់ (Password) *</label>
                <input 
                  type="text" 
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                  placeholder="លេខសម្ងាត់សម្រាប់ឡុកអុីន (Password)..."
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: STUDENT EDITOR --- */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="student_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-teal-850 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <GraduationCap size={18} /> {editingStudent ? 'កែសម្រួលព័ត៌មាននិស្សិត' : 'ចុះឈ្មោះបង្កើតនិស្សិតថ្មី'}
              </h3>
              <button onClick={() => setShowStudentModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អត្តសញ្ញាណនិស្សិត (Student ID) *</label>
                <input 
                  type="text" 
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
                  placeholder="ឧ. 446123"
                  maxLength={6}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-teal-700 font-bold mt-1">បញ្ជាក់៖ លេខអត្តសញ្ញាណត្រូវតែមានចំនួនស្មើនឹង ៦ ខ្ទង់</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះភាសាខ្មែរ *</label>
                <input 
                  type="text" 
                  value={studentForm.khmerName}
                  onChange={(e) => setStudentForm({...studentForm, khmerName: e.target.value})}
                  placeholder="ឧ. តូ បូរី"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Name *</label>
                <input 
                  type="text" 
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  placeholder="e.g. Bory To"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អុីមែល (Email) *</label>
                <input 
                  type="email" 
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  placeholder="e.g. boryto446@gmail.com"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone)</label>
                <input 
                  type="text" 
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  placeholder="e.g. 096 888 777"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខកូដសម្ងាត់ (Password) *</label>
                <input 
                  type="text" 
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                  placeholder="លេខសម្ងាត់របស់និស្សិត..."
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SUBJECT EDITOR --- */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="subject_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-teal-850 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <BookOpen size={18} /> {editingSubject ? 'កែសម្រួលមុខវិជ្ជា' : 'បង្កើតថ្នាក់មុខវិជ្ជាថ្មី'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveSubject} className="p-4 sm:p-5 space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-750 mb-1">កូដថ្នាក់ / Subject Code *</label>
                <input 
                  type="text" 
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                  placeholder="e.g. ANA-201"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះមុខវិជ្ជាជាភាសាខ្មែរ *</label>
                <input 
                  type="text" 
                  value={subjectForm.khmerName}
                  onChange={(e) => setSubjectForm({...subjectForm, khmerName: e.target.value})}
                  placeholder="ឧ. កាយវិភាគវិទ្យា (Anatomy)"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 text-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Course Name *</label>
                <input 
                  type="text" 
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                  placeholder="e.g. Anatomy"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 text-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">គ្រូទទួលបន្ទុកថ្នាក់ (Assigned Teacher) *</label>
                <select 
                  value={subjectForm.teacherId}
                  onChange={(e) => setSubjectForm({...subjectForm, teacherId: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  required
                >
                  <option value="" disabled>--- ជ្រើសរើសគ្រូ ---</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.khmerName} ({t.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនថ្ងៃសិក្សាសរុប *</label>
                  <input 
                    type="number" 
                    value={subjectForm.totalDays}
                    onChange={(e) => setSubjectForm({...subjectForm, totalDays: Number(e.target.value)})}
                    placeholder="e.g. 20"
                    min="1"
                    max="100"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">ស្មើនឹង {subjectForm.totalDays * 2} ពិន្ទុ</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ឆមាសសិក្សា</label>
                  <select 
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({...subjectForm, semester: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {semesters.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  បង្កើតមុខវិជ្ជា
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ENROLLMENT FORM --- */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="enroll_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-teal-850 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <UserCheck size={18} /> ចុះឈ្មោះនិស្សិតចូលទៅក្នុងថ្នាក់មុខវិជ្ជា
              </h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveEnrollment} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសនិស្សិត *</label>
                <select 
                  value={enrollForm.studentId}
                  onChange={(e) => setEnrollForm({...enrollForm, studentId: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.khmerName} (ID: {s.studentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសថ្នាក់មុខវិជ្ជាវត្តមាន *</label>
                <select 
                  value={enrollForm.subjectId}
                  onChange={(e) => setEnrollForm({...enrollForm, subjectId: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  required
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.khmerName} (កូដ: {sub.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  រក្សាទុកការចុះឈ្មោះ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: SEMESTER FORM --- */}
      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="semester_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-teal-850 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Calendar size={18} /> {editingSemester ? 'កែឈ្មោះឆមាស' : 'បង្កើតឆមាសថ្មី'}
              </h3>
              <button onClick={() => setShowSemesterModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveSemester} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះឆមាស (Semester Name) *</label>
                <input 
                  type="text" 
                  value={semesterForm.name}
                  onChange={(e) => setSemesterForm({...semesterForm, name: e.target.value})}
                  placeholder="ឧ. ឆ្នាំទី ២ - ឆមាសទី ១"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              {!editingSemester && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_active_checkbox"
                    checked={semesterForm.isActive}
                    onChange={(e) => setSemesterForm({...semesterForm, isActive: e.target.checked})}
                    className="rounded text-teal-600 focus:ring-teal-500 border-slate-300 w-4 h-4"
                  />
                  <label htmlFor="is_active_checkbox" className="text-xs font-bold text-slate-600 cursor-pointer">
                    កំណត់ជាឆមាសសកម្មភ្លាមៗ (Activate)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowSemesterModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: LESSON EDITOR / UPLOADER --- */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="lesson_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-blue-900 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <BookOpen size={18} /> {editingLesson ? 'កែសម្រួលមេរៀន/ឯកសារ' : 'បង្ហោះឯកសារមេរៀនថ្មី'}
              </h3>
              <button onClick={() => setShowLessonModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveLesson} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសមុខវិជ្ជា/ថ្នាក់ *</label>
                <select 
                  value={lessonForm.subjectId}
                  onChange={(e) => setLessonForm({...lessonForm, subjectId: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none animate-none"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.khmerName} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ចំណងជើងមេរៀន *</label>
                <input 
                  type="text" 
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                  placeholder="ឧ. មេរៀនទី ១ - សេចក្តីផ្តើមនៃមុខវិជ្ជា"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទឯកសារ *</label>
                  <select 
                    value={lessonForm.fileType}
                    onChange={(e) => setLessonForm({...lessonForm, fileType: e.target.value as 'pdf' | 'mp4' | 'link'})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="pdf">Document (PDF)</option>
                    <option value="mp4">Video (MP4)</option>
                    <option value="link">Web Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ទំហំឯកសារ</label>
                  <input 
                    type="text" 
                    value={lessonForm.fileSize}
                    onChange={(e) => setLessonForm({...lessonForm, fileSize: e.target.value})}
                    placeholder="ឧ. 1.25 MB"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះហ្វាល់ (File Name / URL) *</label>
                <input 
                  type="text" 
                  value={lessonForm.fileName}
                  onChange={(e) => setLessonForm({...lessonForm, fileName: e.target.value})}
                  placeholder="ឧ. chapter1-intro-slides.pdf"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 7: NEWS BULLETIN EDITOR --- */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="news_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-blue-900 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Megaphone size={18} /> {editingNews ? 'កែសម្រួលសេចក្តីជូនដំណឹង' : 'បង្កើតសេចក្តីជូនដំណឹងថ្មី'}
              </h3>
              <button onClick={() => setShowNewsModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveNews} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ប្រធានបទ/ប្រភេទសេចក្តីជូនដំណឹង *</label>
                <select 
                  value={newsForm.badge}
                  onChange={(e) => setNewsForm({...newsForm, badge: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                  required
                >
                  <option value="ព័ត៌មានការិយាល័យ">ព័ត៌មានការិយាល័យ</option>
                  <option value="ការប្រឡងសញ្ញាបត្រ">ការប្រឡងសញ្ញាបត្រ</option>
                  <option value="ព័ត៌មានបន្ទាន់">ព័ត៌មានបន្ទាន់</option>
                  <option value="សេចក្តីជូនដំណឹងរួម">សេចក្តីជូនដំណឹងរួម</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ចំណងជើងព័ត៌មាន *</label>
                <input 
                  type="text" 
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                  placeholder="ឧ. ថ្ងៃឈប់សម្រាកបុណ្យជាតិ វិសាខបូជា"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ខ្លឹមសារលម្អិត *</label>
                <textarea 
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                  placeholder="សរសេរព័ត៌មានលម្អិតជូនពួកយើងនៅទីនេះ..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowNewsModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 8: PROMOTION OFFER EDITOR --- */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="promotion_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-blue-900 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Sparkles size={18} /> {editingPromotion ? 'កែសម្រួលប្រូម៉ូសិន' : 'បន្ថែមកម្មវិធីប្រូម៉ូសិនថ្មី'}
              </h3>
              <button onClick={() => setShowPromotionModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSavePromotion} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ចំណងជើងប្រូម៉ូសិន (Deal Title) *</label>
                <input 
                  type="text" 
                  value={promotionForm.title}
                  onChange={(e) => setPromotionForm({...promotionForm, title: e.target.value})}
                  placeholder="ឧ. Dell & Asus Educational Deals (15% Off)"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ការណែនាំ ឬខ្លឹមសារនៃការបញ្ចុះតម្លៃ *</label>
                <textarea 
                  value={promotionForm.content}
                  onChange={(e) => setPromotionForm({...promotionForm, content: e.target.value})}
                  placeholder="របៀបដែលសិស្សអាចប្រើប្រាស់ និងសេចក្តីលម្អិត..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowPromotionModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 9: HELPDESK TICKET RESPONDER --- */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="ticket_modal_backdrop">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-blue-900 px-4 py-3.5 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <MessageSquare size={18} /> ដោះស្រាយបញ្ហា & ឆ្លើយតបសំបុត្រ (Helpdesk Responder)
              </h3>
              <button onClick={() => setShowTicketModal(false)} className="text-white/85 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveTicketReply} className="p-4 sm:p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs text-slate-700 leading-relaxed">
                <p><b>ប្រធានបទ៖</b> {replyingTicket?.subject}</p>
                <p className="mt-1"><b>ប្រភេទសំណើ៖</b> {replyingTicket?.category}</p>
                <p className="mt-1"><b>និស្សិត៖</b> {replyingTicket?.studentName} ({replyingTicket?.studentId})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ស្ថានភាពសំណើ (Status) *</label>
                <select 
                  value={ticketForm.status}
                  onChange={(e) => setTicketForm({...ticketForm, status: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                  required
                >
                  <option value="កំពុងត្រួតពិនិត្យ (Pending)">កំពុងត្រួតពិនិត្យ (Pending)</option>
                  <option value="រង់ចាំដំណោះស្រាយ (Awaiting Staff)">រង់ចាំដំណោះស្រាយ (Awaiting Staff)</option>
                  <option value="បានដោះស្រាយរួចរាល់ (Resolved)">បានដោះស្រាយរួចរាល់ (Resolved)</option>
                  <option value="ច្រានចោលសំណើ (Declined)">ច្រានចោលសំណើ (Declined)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ការឆ្លើយតបផ្លូវការរបស់រដ្ឋបាល/សាស្ត្រាចារ្យ *</label>
                <textarea 
                  value={ticketForm.reply}
                  onChange={(e) => setTicketForm({...ticketForm, reply: e.target.value})}
                  placeholder="សរសេរសារដោះស្រាយ ឬការឆ្លើយតបត្រឡប់ទៅនិស្សិតវិញ..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                >
                  ផ្ញើការឆ្លើយតប
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
