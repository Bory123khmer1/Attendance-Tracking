/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DBStore } from '../dbStore';
import { Student, Subject, AttendanceRecord, ActiveSession, SupportTicket, LessonMaterial, NewsItem, PromotionItem } from '../types';
import { 
  Inbox, 
  Camera, 
  Tv, 
  ClipboardCheck, 
  Clipboard, 
  Trophy, 
  Fingerprint, 
  Award, 
  Banknote, 
  HelpCircle, 
  Megaphone, 
  Sparkles,
  User,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Download,
  Info,
  ChevronRight,
  Send,
  Printer,
  CreditCard,
  Check,
  ShieldCheck,
  X
} from 'lucide-react';

interface StudentPanelProps {
  onDataChange: () => void;
  activeSessionVersion: number;
  loggedInStudentId?: string;
}

type PortalTab = 
  | 'invitation'     // ទទួលបានការអញ្ជើញ
  | 'scanner'        // ស្កេនវត្តមាន
  | 'lessons'        // មេរៀន
  | 'evaluation'     // វាយតម្លៃគុណភាព
  | 'exams'          // ការប្រឡង
  | 'laureates'      // ជ័យលាភី
  | 'attendance_ops' // ប្រតិបត្តិ-វត្តមាន
  | 'grades'         // ប្រតិបត្តិ-ពិន្ទុ
  | 'payments'       // ការបង់ប្រាក់
  | 'contact'        // ទំនាក់ទំនងបញ្ហា
  | 'news'           // សេចក្ដីជូនដំណឹងព័ត៌មាន
  | 'promotions';    // ប្រូម៉ូសិន

export default function StudentPanel({ onDataChange, activeSessionVersion, loggedInStudentId }: StudentPanelProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Subject[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedQRToSimulate, setSelectedQRToSimulate] = useState<string>('');
  const [qrTextInput, setQrTextInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  // Redesigned Navigation Active View (Matching user's request)
  const [activePortalTab, setActivePortalTab] = useState<PortalTab>('scanner');
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  // Interactive profile details modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // 1. Invitation Module States
  const [invitations, setInvitations] = useState([
    { id: 'SUB-004', code: 'PHA-301', name: 'Pharmacology', khmerName: 'ឱសថសាស្ត្រ', teacherName: 'លោកគ្រូ ចាន់ វណ្ណដន', accepted: false },
    { id: 'SUB-005', code: 'PAD-105', name: 'Public Administration', khmerName: 'រដ្ឋបាលសាធារណៈ', teacherName: 'អ្នកគ្រូ ឈីម សូភី', accepted: false }
  ]);

  // 4. Quality Evaluation States
  const [evalSubmitted, setEvalSubmitted] = useState(false);
  const [evalForm, setEvalForm] = useState({
    punctuality: 5,
    syllabus: 5,
    clarity: 5,
    materials: 5,
    comment: ''
  });

  // 6. Certificate modal printable state
  const [showCertificatePrintout, setShowCertificatePrintout] = useState(false);

  // 9. Payment Module States
  const [tuitionPaid, setTuitionPaid] = useState<boolean>(() => {
    return localStorage.getItem('aeu_payment_S-001') === 'true';
  });
  const [showABAModal, setShowABAModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 10. Helpdesk Tickets States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lessons, setLessons] = useState<LessonMaterial[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('វត្តមាន');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Load basic data
  const loadData = () => {
    const list = DBStore.getStudents();
    setStudents(list);

    let currentStudent: Student | null = null;
    if (loggedInStudentId) {
      currentStudent = list.find(s => s.id === loggedInStudentId) || null;
    } else {
      currentStudent = list.find(s => s.id === 'S-001') || list[0] || null;
    }

    if (currentStudent) {
      // Direct overwrite to make sure previous browser storage sessions display "ខឿន បូរី" 
      if (currentStudent.id === 'S-001') {
        currentStudent.khmerName = 'ខឿន បូរី';
        currentStudent.studentId = '64945';
      }
      setActiveStudent(currentStudent);
      setProfilePhone(currentStudent.phone || '');
      setProfileEmail(currentStudent.email || '');
      
      // Load current student's tickets
      const allTx = DBStore.getTickets();
      setTickets(allTx.filter(t => t.studentId === currentStudent?.id));
    }

    setNews(DBStore.getNews());
    setLessons(DBStore.getLessons());
    setPromotions(DBStore.getPromotions());

    setActiveSessions(DBStore.getActiveSessions().filter(s => s.isActive));
  };

  useEffect(() => {
    loadData();
  }, [activeSessionVersion, loggedInStudentId]);

  // Load student-specific enrollments & logs
  useEffect(() => {
    if (activeStudent) {
      const enrolls = DBStore.getEnrollments().filter(e => e.studentId === activeStudent.id);
      const allSubs = DBStore.getSubjects();
      
      const filteredSubs = enrolls.map(e => allSubs.find(s => s.id === e.subjectId))
        .filter((s): s is Subject => s !== undefined);

      setEnrolledSubjects(filteredSubs);

      // Refresh invitations to avoid offering enrolled classes
      setInvitations(prev => prev.map(inv => {
        const alreadyEnrolled = enrolls.some(e => e.subjectId === inv.id);
        return { ...inv, accepted: alreadyEnrolled };
      }));

      const logs = DBStore.getAttendanceRecords().filter(r => r.studentId === activeStudent.id);
      setAttendanceLogs(logs.sort((a, b) => b.date.localeCompare(a.date)));
    } else {
      setEnrolledSubjects([]);
      setAttendanceLogs([]);
    }
  }, [activeStudent, activeSessionVersion]);

  // Active sessions lookup
  useEffect(() => {
    const activeList = DBStore.getActiveSessions().filter(s => s.isActive);
    setActiveSessions(activeList);
    if (activeList.length > 0) {
      if (!selectedQRToSimulate || !activeList.some(s => s.qrcode === selectedQRToSimulate)) {
        setSelectedQRToSimulate(activeList[0].qrcode);
      }
    } else {
      setSelectedQRToSimulate('');
    }
  }, [activeSessionVersion]);

  // QR Scanning Simulator logic
  const handleTriggerMockScan = (qrValue: string) => {
    if (!activeStudent) return;
    if (!qrValue) {
      alert('សូមជ្រើសរើស ឬវាយកូដ QR ដើម្បីស្កេន');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = DBStore.scanQRCode(activeStudent.id, qrValue);
      setScanResult(res);

      if (res.success) {
        onDataChange(); // instantly notify parent so charts and stats update
      }
    }, 1200);
  };

  // 1. Accept general course enrollment invitation
  const handleAcceptInvite = (invId: string) => {
    if (!activeStudent) return;
    
    const enrollments = DBStore.getEnrollments();
    // Check if registry already exists
    const duplicate = enrollments.some(e => e.studentId === activeStudent.id && e.subjectId === invId);
    
    if (!duplicate) {
      const newEnroll = {
        id: `E-${Date.now()}`,
        studentId: activeStudent.id,
        subjectId: invId
      };
      const updated = [...enrollments, newEnroll];
      DBStore.saveEnrollments(updated);
      
      setInvitations(prev => prev.map(i => i.id === invId ? { ...i, accepted: true } : i));
      onDataChange();
      
      // Flash a quick notice
      setScanResult({ success: true, message: 'បានយល់ព្រម និងចុះឈ្មោះចូលរៀនក្នុងថ្នាក់រួចរាល់!' });
      setTimeout(() => setScanResult(null), 4000);
    }
  };

  // 4. Quality feedback submittal
  const handleQualitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEvalSubmitted(true);
    setTimeout(() => {
      setEvalSubmitted(false);
      setEvalForm({ punctuality: 5, syllabus: 5, clarity: 5, materials: 5, comment: '' });
    }, 4000);
  };

  // 9. Payment ledger simulation
  const handleTriggerABAPay = () => {
    setShowABAModal(true);
  };

  const handleSettleABAPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setTuitionPaid(true);
      setShowABAModal(false);
      localStorage.setItem('aeu_payment_S-001', 'true');
    }, 1500);
  };

  // 10. Helpdesk ticket intake
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) return;

    setIsSubmittingTicket(true);
    
    setTimeout(() => {
      const freshTicket: SupportTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: activeStudent?.id || 'S-001',
        studentName: activeStudent?.khmerName || 'ខឿន បូរី',
        subject: newTicketSubject,
        category: newTicketCategory,
        status: 'កំពុងត្រួតពិនិត្យ (Pending)',
        date: new Date().toISOString().split('T')[0]
      };

      const allTickets = DBStore.getTickets();
      const updatedTickets = [freshTicket, ...allTickets];
      DBStore.saveTickets(updatedTickets);

      setTickets(updatedTickets.filter(t => t.studentId === activeStudent?.id));
      setNewTicketSubject('');
      setIsSubmittingTicket(false);
      onDataChange();

      // Auto reply chatbot simulator after 2 seconds
      setTimeout(() => {
        const latestTx = DBStore.getTickets();
        const updatedWithAutoReply = latestTx.map(t => {
          if (t.id === freshTicket.id) {
            return {
              ...t,
              status: 'រង់ចាំដំណោះស្រាយ (Awaiting Staff)',
              reply: 'ប្រព័ន្ធការិយាល័យស្វ័យប្រវត្ត៖ លោកគ្រូអ្នកគ្រូ និងផ្នែកគ្រប់គ្រងទទួលបានសំណើហើយ។ ផ្នែករដ្ឋបាលកំពុងត្រួតពិនិត្យទិន្នន័យជាក់ស្តែង និងឆ្លើយតបជូនអ្នកក្នុងពេលដ៏ឆាប់ខាងមុខ។'
            };
          }
          return t;
        });
        DBStore.saveTickets(updatedWithAutoReply);
        if (activeStudent) {
          setTickets(updatedWithAutoReply.filter(t => t.studentId === activeStudent.id));
        }
        onDataChange();
      }, 2000);

    }, 800);
  };

  // Helper resolvers
  const getTeacherName = (teacherId: string) => {
    const tList = DBStore.getTeachers();
    const t = tList.find(x => x.id === teacherId);
    return t ? t.khmerName : 'មិនស្គាល់គ្រូ';
  };

  const getSubjectDetails = (subId: string) => {
    const sub = DBStore.getSubjects().find(s => s.id === subId);
    return sub || { khmerName: 'មិនស្គាល់មុខវិជ្ជា', code: 'N/A' };
  };

  // Save profile information changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    
    const studentsList = DBStore.getStudents();
    const updated = studentsList.map(s => {
      if (s.id === activeStudent.id) {
        return {
          ...s,
          phone: profilePhone,
          email: profileEmail
        };
      }
      return s;
    });

    DBStore.saveStudents(updated);
    setActiveStudent(prev => prev ? { ...prev, phone: profilePhone, email: profileEmail } : null);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // 12 Portal Navigation definitions
  const PORTAL_NAVIGATION_ITEMS = [
    { id: 'invitation', label: 'ទទួលបានការអញ្ជើញ', icon: Inbox, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', textColors: 'text-emerald-700' },
    { id: 'scanner', label: 'ស្កេនវត្តមាន', icon: Camera, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', textColors: 'text-emerald-800' },
    { id: 'lessons', label: 'មេរៀន', icon: Tv, color: 'text-cyan-600 bg-cyan-50 border-cyan-100', textColors: 'text-cyan-850' },
    { id: 'evaluation', label: 'វាយតម្លៃគុណភាព', icon: ClipboardCheck, color: 'text-teal-600 bg-teal-50 border-teal-100', textColors: 'text-teal-800' },
    { id: 'exams', label: 'ការប្រឡង', icon: Clipboard, color: 'text-amber-500 bg-amber-50/50 border-amber-100/70', textColors: 'text-amber-700' },
    { id: 'laureates', label: 'ជ័យលាភី', icon: Trophy, color: 'text-amber-500 bg-amber-50/40 border-amber-100/60', textColors: 'text-amber-800' },
    { id: 'attendance_ops', label: 'ប្រតិបត្តិ-វត្តមាន', icon: Fingerprint, color: 'text-orange-500 bg-orange-50 border-orange-100', textColors: 'text-orange-700' },
    { id: 'grades', label: 'ប្រតិបត្តិ-ពិន្ទុ', icon: Award, color: 'text-red-500 bg-red-50 border-red-100', textColors: 'text-red-700' },
    { id: 'payments', label: 'ការបង់ប្រាក់', icon: Banknote, color: 'text-emerald-600 bg-emerald-50/70 border-emerald-200/50', textColors: 'text-emerald-805' },
    { id: 'contact', label: 'ទំនាក់ទំនងបញ្ហា', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 border-blue-100', textColors: 'text-blue-700' },
    { id: 'news', label: 'សេចក្ដីជូនដំណឹងព័ត៌មាន', icon: Megaphone, color: 'text-red-500 bg-rose-50 border-rose-100', textColors: 'text-rose-700' },
    { id: 'promotions', label: 'ប្រូម៉ូសិន', icon: Sparkles, color: 'text-purple-500 bg-purple-50 border-purple-100', textColors: 'text-purple-700' },
  ] as const;

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-5 select-none" id="student_panel_wrapper">
      
      {/* 1. TOP PORTAL PROFILE CARD ACCORDING TO SCREENSHOT LAYOUT */}
      <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-xs mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden" id="student_head_profile_card">
        <div className="flex items-center gap-4 z-10">
          {/* Avatar frame */}
          <div className="w-14 h-14 bg-white rounded-full border border-slate-350 p-1 flex items-center justify-center shrink-0 shadow-lg">
            <div className="bg-slate-100 w-full h-full rounded-full flex items-center justify-center text-slate-400">
              <User size={28} />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 leading-snug">
              <span>និស្សិត ៖</span> 
              <span className="text-teal-800 font-extrabold text-base">{activeStudent ? activeStudent.khmerName : 'ខឿន បូរី'}</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <span>អត្តលេខ ៖</span> 
              <span className="bg-slate-200/80 px-2 py-0.5 rounded font-mono text-slate-700 text-[11px]">{activeStudent ? activeStudent.studentId : '64945'}</span>
            </p>
          </div>
        </div>

        {/* Action Button Right */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-slate-200/80 pt-3 md:pt-0 md:border-0 z-10">
          {/* Switch Student Dropdown for general sandboxing testing comfort */}
          {!loggedInStudentId && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <span>គណនីបម្រុង ៖</span>
              <select
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  const matched = students.find(s => s.id === e.target.value);
                  if (matched) {
                    setActiveStudent(matched);
                    setScanResult(null);
                  }
                }}
                className="bg-white border border-slate-200 rounded-lg p-1 text-[10.5px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.khmerName} ({s.id === 'S-001' ? '64945' : s.studentId})</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="text-xs font-bold text-[#1e40af] bg-transparent hover:underline leading-relaxed select-none shrink-0"
            id="student_p_profile_btn"
          >
            ប្រវត្តិរូប
          </button>
        </div>
      </div>

      {/* CORE SPLIT WORKSPACE GRID */}
      <div className="w-full" id="aeu_middle_body">
        
        {/* THE 12 BENTO NAVIGATION BULLETTIN BOARD (Matching Screenshot Grid) */}
        <div className="w-full flex flex-col gap-4 max-w-4xl mx-auto" id="aeu_buttons_dashboard_hub">
          <div className="bg-transparent">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5 pl-1 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-3 bg-teal-600 rounded-xs" />
              តាបកុងត្រូលគណនី (Portal Services Map)
            </h3>
            
            {/* The 12 custom styled grids */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in" id="aeu_interactive_12_grids">
              {PORTAL_NAVIGATION_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activePortalTab === item.id && isPortalModalOpen;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActivePortalTab(item.id);
                      setIsPortalModalOpen(true);
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer select-none bg-white font-sans ${
                      isSelected 
                        ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-sm' 
                        : 'border-slate-150/70 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                    id={`portal_grid_btn_${item.id}`}
                  >
                    {/* Icon section */}
                    <div className={`p-2.5 rounded-xl border border-slate-100 shadow-3xs mb-2 transition-transform duration-300 ${item.color}`}>
                      <IconComponent size={22} className={isSelected ? 'animate-pulse' : ''} />
                    </div>
                    {/* Character Label */}
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-snug break-words tracking-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* OVERLAY MODAL FOR CORRESPONDING INTERACTIVE WORKSPACE CARD */}
        <div 
          className={isPortalModalOpen 
            ? "fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
            : "hidden"
          }
          id="selected_portal_workspace_card"
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl w-full max-w-2xl min-h-[480px] flex flex-col justify-between animate-in zoom-in-95 duration-150 relative font-sans">
            
            {/* Modal Top Close Button */}
            <button 
              type="button"
              onClick={() => setIsPortalModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-705 transition-colors cursor-pointer z-10"
              title="Close"
            >
              <X size={18} />
            </button>
            
            {/* CONDITIONAL COMPONENT RENDER FOR PORTAL PORTALS */}
            {(() => {
              switch (activePortalTab) {
                
                // 1. ទទួលបានការអញ្ជើញ (INVITATION MODULE)
                case 'invitation':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Inbox className="text-emerald-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">អញ្ជើញចូលរួមថ្នាក់រៀន (Pending Enlist Invitations)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ទទួលយកការស្នើសុំចូលរៀនពីសំណាក់គ្រូបង្រៀន ដើម្បីចាប់ផ្តើមកត់ត្រាវត្តមានភ្លាមៗ។</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        {invitations.map(inv => (
                          <div key={inv.id} className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                                {inv.code}
                              </span>
                              <h5 className="font-extrabold text-xs text-slate-800 mt-1.5">{inv.khmerName}</h5>
                              <p className="text-[10.5px] text-slate-400 mt-0.5">សាស្ត្រាចារ្យ ៖ {inv.teacherName}</p>
                            </div>

                            {inv.accepted ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                                <Check size={12} /> បានយល់ព្រម
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAcceptInvite(inv.id)}
                                className="bg-teal-700 hover:bg-teal-850 text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-3xs"
                              >
                                យល់ព្រមចូលរួម
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200 text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                          💡 <b>ព័ត៌មានបន្ថែម៖</b> នៅពេលអ្នកចុចយល់ព្រម ថ្នាក់នោះនឹងត្រូវបានចុះឈ្មោះចូលក្នុងគម្រោងវត្តមានសកម្មរបស់អ្នកដោយស្វ័យប្រវត្ត។
                        </div>
                      </div>
                    </div>
                  );

                // 2. ស្កេនវត្តមាន (CORE QR VIEWPORT SCANNER)
                case 'scanner':
                  return (
                    <div className="flex flex-col flex-1 justify-between gap-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Camera className="text-teal-700" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ស្កេនកូដ QR វត្តមាន (Live Camera QR Scanner)</h4>
                          <p className="text-[10px] text-slate-400">ស្កេនដើម្បីកត់ត្រាការចូលរួមរៀន នៅក្នុងម៉ោងសិក្សាដែលបើកដំណើរការ។</p>
                        </div>
                      </div>

                      {/* Viewfinder simulation UI */}
                      <div className="bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden aspect-video text-white border border-slate-850 shadow-inner">
                        {/* Interactive scanning laser effect */}
                        <div className="absolute inset-x-0 w-full h-0.5 bg-emerald-500/85 shadow-lg shadow-emerald-500/85 animate-bounce top-5 pointer-events-none" />
                        
                        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
                        
                        {isScanning ? (
                          <div className="flex flex-col items-center gap-1.5 animate-pulse text-emerald-400" id="live_scanning_indicator">
                            <Clock size={36} className="animate-spin text-emerald-400" />
                            <span className="font-bold text-[10.5px] tracking-wider uppercase">កំពុងអានទិន្នន័យ (Scanning Code)...</span>
                          </div>
                        ) : (
                          <div className="text-center p-3 flex flex-col items-center gap-1.5 max-w-xs">
                            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-300 border border-emerald-400/20">
                              <Camera size={26} />
                            </div>
                            <span className="text-[11.5px] font-bold text-slate-300">ដាក់កាមេរ៉ាទំហំកូដ QR ដើម្បីស្កេនដោយស្វ័យប្រវត្ត</span>
                          </div>
                        )}
                      </div>

                      {/* Testing Sandbox Bridge Dropdown helper */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1 md:gap-1.5 text-xs font-black text-[#0f766e] mb-1.5">
                          <Sparkles size={13} className="text-amber-500 animate-pulse shrink-0" />
                          <span>ប្រព័ន្ធសាកល្បងរហ័ស (Sandbox Active QR Bridge)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mb-2.5">
                          ជ្រើសរើស QR សកម្មដែលគ្រូបានបង្កើតឡើងនៅក្នុងផ្ទាំង <span className="font-extrabold text-slate-600">«គ្រូបង្រៀន»</span> ៖
                        </p>

                        {activeSessions.length === 0 ? (
                          <div className="p-2 border border-dashed border-amber-200 bg-amber-50 rounded-lg text-[10px] text-amber-850 font-bold leading-normal flex items-start gap-1">
                            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>មិនទាន់មានវគ្គសិក្សាសកម្មទេ! សូមទៅផ្ទាំងគ្រូបង្រៀន រូបបង្កើតវគ្គសិន។</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <select
                              value={selectedQRToSimulate}
                              onChange={(e) => setSelectedQRToSimulate(e.target.value)}
                              className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white w-full font-bold text-slate-700 outline-none"
                            >
                              {activeSessions.map((s, index) => {
                                const details = getSubjectDetails(s.subjectId);
                                return (
                                  <option key={s.id} value={s.qrcode}>
                                    {index + 1}. {details.khmerName} ({s.qrType === 'MORNING' ? 'ព្រឹក' : 'ចេញលេង'}) - [{s.qrcode.substring(0, 10)}]
                                  </option>
                                );
                              })}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleTriggerMockScan(selectedQRToSimulate)}
                              disabled={isScanning}
                              className="w-full bg-teal-700 hover:bg-teal-850 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                            >
                              <Zap size={13} className="text-amber-300 fill-amber-300" />
                              <span>ស្កេនកូដសកម្មដែលជ្រើសរើសនេះ</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Manual text input */}
                      <div className="border bg-white rounded-xl p-2 flex items-center justify-between border-slate-200 gap-2">
                        <input
                          type="text"
                          placeholder="ឬវាយបញ្ចូលកូដវត្តមាន ៦ខ្ទង់ដោយដៃ..."
                          value={qrTextInput}
                          onChange={(e) => setQrTextInput(e.target.value)}
                          className="w-full text-xs px-2.5 font-bold text-slate-700 font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleTriggerMockScan(qrTextInput);
                            setQrTextInput('');
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-black px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          បញ្ជូន
                        </button>
                      </div>

                      {/* Scan Results Feedback Banner */}
                      {scanResult && (
                        <div className={`p-3 rounded-lg border-l-4 text-xs font-semibold flex items-start gap-2 ${
                          scanResult.success 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'bg-red-50 border-red-505 text-red-800'
                        }`} id="scan_results_notif_panel">
                          {scanResult.success ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                          ) : (
                            <AlertTriangle size={16} className="text-red-650 shrink-0 mt-0.5 animate-pulse" />
                          )}
                          <div>
                            <h5 className="font-extrabold">{scanResult.success ? 'កត់ត្រាវត្តមានពេញលេញ' : 'ការស្កេនបរាជ័យ'}</h5>
                            <p className="text-[10.5px] mt-0.5 leading-relaxed font-semibold">{scanResult.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );

                // 3. មេរៀន (LESSONS MODULE)
                case 'lessons':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Tv className="text-cyan-600" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">មេរៀន និងខ្លឹមសារបណ្ដុះបណ្ដាល (Course Handouts)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ទាញយកឯកសារមេរៀន ស្លាយ និងវីដេអូបង្រៀនរបស់សាស្ត្រាចារ្យតាមមុខវិជ្ជា។</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        {enrolledSubjects.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-6">មិនទាន់មានថ្នាក់ដែលបានចុះឈ្មោះទេ</p>
                        ) : (
                          enrolledSubjects.map(sub => (
                            <div key={sub.id} className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/60 hover:shadow-2xs transition-shadow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[9px] font-bold">
                                    {sub.code}
                                  </span>
                                  <h5 className="font-extrabold text-xs text-slate-850 mt-1">{sub.khmerName}</h5>
                                </div>
                                <span className="text-[9.5px] font-bold text-teal-600">ឆមាសទី ១</span>
                              </div>

                              <div className="mt-3 grid grid-cols-1 gap-1.5 text-slate-700">
                                {lessons.filter(l => l.subjectId === sub.id).length === 0 ? (
                                  <div className="p-2 text-center text-[10px] text-slate-400 italic">មិនទាន់មានឯកសារគ្រូបង្ហោះសម្រាប់មុខវិជ្ជានេះទេ</div>
                                ) : (
                                  lessons.filter(l => l.subjectId === sub.id).map(les => (
                                    <div key={les.id} className="p-2 border border-slate-100 rounded bg-white flex items-center justify-between text-[10.5px]">
                                      <span className="font-semibold flex items-center gap-1">
                                        {les.fileType === 'pdf' ? '📘' : les.fileType === 'mp4' ? '🎬' : '🔗'} {les.title} ({les.fileName}) {les.fileSize && `[${les.fileSize}]`}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => alert(`សកម្មភាពទទួលបាន៖ ${les.title} (${les.fileName})`)}
                                        className="text-teal-600 hover:text-teal-850 shrink-0 font-bold flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {les.fileType === 'mp4' ? <Tv size={11} /> : <Download size={11} />} {les.fileType === 'mp4' ? 'មើលវីដេអូ' : 'ទាញយក'}
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );

                // 4. វាយតម្លៃគុណភាព (QUALITY EVALUATION)
                case 'evaluation':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <ClipboardCheck className="text-teal-600" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">វាយតម្លៃគុណភាពបង្រៀន (Quality Evaluation)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">រួមចំណែកកែលម្អគុណភាពអប់រំ ដោយផ្ដល់មតិត្រឡប់ដោយស្មោះត្រង់ និងរក្សាការសម្ងាត់។</p>
                        </div>
                      </div>

                      {evalSubmitted ? (
                        <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl text-center space-y-3 animate-in zoom-in-95" id="eval_success_banner">
                          <CheckCircle2 size={36} className="text-emerald-600 mx-auto animate-bounce" />
                          <h5 className="font-extrabold text-slate-800 text-sm">ផ្ញើមតិវាយតម្លៃទទួលបានជោគជ័យ</h5>
                          <p className="text-slate-500 text-xs leading-relaxed">ប្រព័ន្ធបានរក្សាទុកមតិយោបល់របស់អ្នកដោយសម្ងាត់រួចរាល់។ អរគុណសម្រាប់ការចូលរួម!</p>
                        </div>
                      ) : (
                        <form onSubmit={handleQualitySubmit} className="space-y-3.5 pt-1 text-slate-700">
                          {/* Subject chooser */}
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase">១. ជ្រើសរើសថ្នាក់ដែលត្រូវវាយតម្លៃ ៖</label>
                            <select className="mt-1 w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 bg-white">
                              {enrolledSubjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.khmerName} ({sub.code})</option>
                              ))}
                            </select>
                          </div>

                          {/* Metric 1 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span>២. វត្តមានសាស្ត្រាចារ្យ និងការគោរពម៉ោង ៖</span>
                              <span className="text-teal-600">{evalForm.punctuality} / 5</span>
                            </div>
                            <input
                              type="range" min="1" max="5"
                              value={evalForm.punctuality}
                              onChange={e => setEvalForm(p => ({ ...p, punctuality: parseInt(e.target.value) }))}
                              className="w-full accent-teal-600"
                            />
                          </div>

                          {/* Metric 2 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span>៣. ការបង្កើនទំនាក់ទំនង និងគរុកោសល្យបង្រៀន ៖</span>
                              <span className="text-teal-600">{evalForm.clarity} / 5</span>
                            </div>
                            <input
                              type="range" min="1" max="5"
                              value={evalForm.clarity}
                              onChange={e => setEvalForm(p => ({ ...p, clarity: parseInt(e.target.value) }))}
                              className="w-full accent-teal-600"
                            />
                          </div>

                          {/* Comment area */}
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase">៤. មតិបន្ថែមស្ថាបនា ៖</label>
                            <textarea
                              rows={2}
                              value={evalForm.comment}
                              placeholder="សរសេរមតិយោបល់នៅទីនេះ..."
                              onChange={e => setEvalForm(p => ({ ...p, comment: e.target.value }))}
                              className="mt-1 w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-850"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#0f766e] hover:bg-teal-850 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow-sm cursor-pointer transition-colors"
                          >
                            ផ្ញើមតិវាយតម្លៃជាផ្លូវការ
                          </button>
                        </form>
                      )}
                    </div>
                  );

                // 5. ការប្រឡង (EXAMS EXAM TICKETS & REQUIREMENT INDICATOR)
                case 'exams':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Clipboard className="text-amber-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">តារាងប្រឡងឆមាស (Academic Exam Schedule)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ព័ត៌មានលម្អិតអំពីបន្ទប់ប្រឡង លេខតុ និងសិទ្ធិអនុញ្ញាតចូលរួមប្រឡង (វត្តមានប្រចាំឆមាស &ge; ៨០%)។</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-1 text-slate-700">
                        {enrolledSubjects.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-6">មិនទាន់មានថ្នាក់ដែលបានកត់ត្រា</p>
                        ) : (
                          enrolledSubjects.map((sub, idx) => {
                            const stats = DBStore.getAttendanceStats(activeStudent?.id || 'S-001', sub.id);
                            // Settle check if eligible for exam (attendance rate threshold 80% or higher)
                            const isEligible = stats.percentage >= 80;
                            
                            return (
                              <div key={sub.id} className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/50">
                                <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2 mb-2">
                                  <div>
                                    <span className="font-mono text-[9px] font-black bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">{sub.code}</span>
                                    <h5 className="font-extrabold text-xs text-slate-800 mt-1">{sub.khmerName}</h5>
                                  </div>

                                  <div className="text-right shrink-0">
                                    {isEligible ? (
                                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                        <CheckCircle2 size={11} className="text-emerald-600" /> មានសិទ្ធិប្រឡង
                                      </span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-200 text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                        <AlertTriangle size={11} className="text-red-500 animate-pulse" /> គ្មានសិទ្ធិប្រឡង
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Index numbers & coordinates info */}
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500">
                                  <div>
                                    <p>កាលបរិច្ឆេទ ៖ <span className="text-slate-800 font-bold">ថ្ងៃទី {24 + idx} មិថុនា ២០២៦</span></p>
                                    <p className="mt-1">បន្ទប់ប្រឡង ៖ <span className="text-slate-800 font-bold">Room 40{2 + idx} Floor 4</span></p>
                                  </div>
                                  <div>
                                    <p>លេខតុប្រឡង ៖ <span className="text-slate-800 font-bold">Desk #{12 + idx * 8}</span></p>
                                    <p className="mt-1">តម្រូវការវត្តមាន ៖ <span className="font-bold text-slate-700">{stats.percentage}% / 80%</span></p>
                                  </div>
                                </div>

                                {!isEligible && (
                                  <div className="bg-amber-50 rounded-lg p-2 text-[9.5px] text-amber-800 border border-amber-100 font-bold leading-relaxed mt-2.5">
                                    ⚠️ <b>ចំណាំ៖</b> វត្តមានរៀនរបស់អ្នកទាបជាង ៨០%។ សូមស្នើសុំការកែតម្រូវ ឬសាកសួរគណៈគ្រប់គ្រងសាលាភ្លាមៗ។
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );

                // 6. ជ័យលាភី (LAUREATES & CERTIFICATES)
                case 'laureates':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Trophy className="text-amber-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ជ័យលាភី និងលិខិតសរសើរ (Laureates Certificate)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ការកោតសរសើរនិងផ្ដល់កិត្តិយសជូននិស្សិតឆ្នើមដែលមានការតស៊ូខំប្រឹងប្រែង និងវត្តមានខ្ពស់។</p>
                        </div>
                      </div>

                      <div className="pt-2 text-center text-slate-700 space-y-4">
                        <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-xl max-w-sm mx-auto flex flex-col items-center">
                          <Trophy size={38} className="text-amber-500 fill-amber-500 animate-pulse mb-2.5" />
                          <h5 className="font-extrabold text-slate-800 text-xs">លិខិតសរសើរអំពីវត្តមានសិក្សាឆ្នើម</h5>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[2400px]">ប្រព័ន្ធស្វ័យប្រវត្តបានវាយតម្លៃវត្តមានរួមរបស់អ្នកជាវិជ្ជមានខ្ពស់ (&ge; ៩០%)។ សាលាសូមកោតសរសើរ!</p>

                          {/* Show Print/Action Trigger */}
                          <button
                            type="button"
                            onClick={() => setShowCertificatePrintout(true)}
                            className="mt-3.5 bg-[#b45309] hover:bg-amber-800 text-white font-extrabold text-[10.5px] px-4 py-2 rounded-lg flex items-center gap-1 shadow-3xs cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>ទាញយក / បោះពុម្ពលិខិតសរសើរ</span>
                          </button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                          <h6 className="text-[10.5px] font-bold text-slate-800 mb-0.5">🏆 តារាងកិត្តិយស ប្រចាំសប្តាហ៍៖</h6>
                          <ul className="text-[10px] text-slate-500 space-y-1 pl-3 list-decimal leading-relaxed">
                            <li><b>ខឿន បូរី</b> (វត្តមាន ៩៥% - សាលាកាយវិភាគវិទ្យា)</li>
                            <li>ហេង នីកា (វត្តមាន ៩៥% - សាលាសរីរវិទ្យា)</li>
                            <li>គីម រដ្ឋា (វត្តមាន ៩០% - សាលាជីវគីមីវិទ្យា)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );

                // 7. ប្រតិបត្តិ-វត្តមាន (ATTENDANCE OPERATIONS)
                case 'attendance_ops':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Fingerprint className="text-orange-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">មុខវិជ្ជាវត្តមានរបស់ខ្ញុំ (Academic Attendance Modules)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">តាមដានត្រួតពិនិត្យកំណត់ត្រាវត្តមានសរុប និងអវត្តមានជាពិសេសក្នុងឆមាសនេះ។</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-1">
                        {enrolledSubjects.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs italic">មិនទាន់មានថ្នាក់ដែលបានចុះឈ្មោះទេ</div>
                        ) : (
                          enrolledSubjects.map(sub => {
                            const stats = DBStore.getAttendanceStats(activeStudent?.id || 'S-001', sub.id);
                            
                            // Styling progress elements dynamically
                            let progressColor = 'bg-red-500';
                            let progressBadge = 'text-red-700 bg-red-50 border-red-100';
                            
                            if (stats.percentage >= 85) {
                              progressColor = 'bg-emerald-500';
                              progressBadge = 'text-emerald-700 bg-emerald-50 border-emerald-150';
                            } else if (stats.percentage >= 65) {
                              progressColor = 'bg-amber-500';
                              progressBadge = 'text-amber-750 bg-amber-50 border-amber-100';
                            }

                            // Check active sessions to allow quick sandbox check-in
                            const matchedSession = activeSessions.find(s => s.subjectId === sub.id);

                            return (
                              <div key={sub.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:shadow-2xs transition-shadow">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div>
                                    <span className="font-mono text-[9px] font-black bg-slate-200 text-slate-600 px-1 py-0.2 rounded mr-1">
                                      {sub.code}
                                    </span>
                                    <h5 className="font-extrabold text-xs text-slate-805 mt-1.5">{sub.khmerName}</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">គ្រូបង្រៀន៖ <span className="font-bold text-slate-700">{getTeacherName(sub.teacherId)}</span></p>
                                  </div>

                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${progressBadge}`}>
                                    {stats.percentage}% វត្តមាន
                                  </span>
                                </div>

                                {/* Custom tracking bar */}
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3.5 relative">
                                  <div className={`h-full ${progressColor} transition-all`} style={{ width: `${stats.percentage}%` }} />
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-600 font-semibold mb-2">
                                  <div className="bg-white p-1 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block text-[8px] uppercase tracking-wider">សរុប</span>
                                    <b className="text-slate-800 font-mono text-xs">{sub.totalDays}</b>
                                  </div>
                                  <div className="bg-white p-1 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block text-[8px] uppercase tracking-wider">បានស្កេន</span>
                                    <b className="text-[#0369a1] font-mono text-xs">{stats.scannedPoints}/{stats.maxPoints}</b>
                                  </div>
                                  <div className="bg-white p-1 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block text-[8px] uppercase tracking-wider">អវត្តមាន</span>
                                    <b className="text-red-500 font-mono text-xs">{stats.absentDays}</b>
                                  </div>
                                  <div className="bg-white p-1 rounded-lg border border-slate-100 key-point">
                                    <span className="text-slate-400 block text-[8px] uppercase tracking-wider">ពិន្ទុបាត់បង់</span>
                                    <b className="text-amber-600 font-mono text-xs">{stats.maxPoints - stats.scannedPoints}</b>
                                  </div>
                                </div>

                                {/* One-Click simulated Scan QR overlay check */}
                                {matchedSession && (
                                  <div className="mt-3 pt-2.5 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                      ម៉ោងវត្តមិនសកម្មកំពុងបើក
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleTriggerMockScan(matchedSession.qrcode)}
                                      disabled={isScanning}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Zap size={11} className="text-amber-200 fill-amber-300" />
                                      <span>ចុចស្កេនរហ័ស</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );

                // 8. ប្រតិបត្តិ-ពិន្ទុ (GRADES & TRANSCRIPT CALCULATOR)
                case 'grades':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Award className="text-red-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ស្ទង់ពិន្ទុសិក្សា និងរោគសញ្ញា (Academic Report Card)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ពិន្ទុប៉ាន់ស្មានរួមផ្អែកលើការចូលរួមក្នុងថ្នាក់រៀន កិច្ចការស្រាវជ្រាវ និងការប្រឡងឆមាស។</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-1 text-slate-700">
                        {enrolledSubjects.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs italic">មិនទាន់មានថ្នាក់ដែលបានចុះឈ្មោះទេ</div>
                        ) : (
                          <>
                            {enrolledSubjects.map(sub => {
                              const stats = DBStore.getAttendanceStats(activeStudent?.id || 'S-001', sub.id);
                              
                              // Grade estimation algorithm based on attendance
                              let finalGrade = 'F';
                              let gradeColor = 'text-red-650 bg-red-50 border-red-100';
                              let numericScore = 40 + Math.floor((stats.percentage / 100) * 55);

                              if (stats.percentage >= 90) {
                                finalGrade = 'A';
                                gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-150';
                              } else if (stats.percentage >= 80) {
                                finalGrade = 'B';
                                gradeColor = 'text-cyan-700 bg-cyan-50 border-cyan-150';
                              } else if (stats.percentage >= 70) {
                                finalGrade = 'C';
                                gradeColor = 'text-amber-700 bg-amber-50 border-amber-150';
                              } else if (stats.percentage >= 50) {
                                finalGrade = 'D';
                                gradeColor = 'text-orange-700 bg-orange-50 border-orange-100';
                              }

                              return (
                                <div key={sub.id} className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 flex justify-between items-center">
                                  <div>
                                    <span className="font-mono text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold mr-1">{sub.code}</span>
                                    <h5 className="font-extrabold text-xs text-slate-800 mt-1">{sub.khmerName}</h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">ពិន្ទុវាយតម្លៃ៖ {numericScore} / 100 (ផ្អែកលើ {stats.percentage}% វត្តមាន)</p>
                                  </div>

                                  <div className="text-center shrink-0">
                                    <span className={`w-8 h-8 rounded-lg font-black font-sans flex items-center justify-center border text-sm ${gradeColor}`}>
                                      {finalGrade}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex justify-between items-center">
                              <div>
                                <h6 className="text-[11px] font-black text-slate-800">សន្ទស្សន៍ពិន្ទុមធ្យមភាគ (Cumulative GPA) :</h6>
                                <p className="text-[9.5px] text-slate-400">គិតបន្ទុកសិក្សាសរុបនៃគ្រប់មុខវិជ្ជាសកម្មក្នុងឆមាស</p>
                              </div>
                              <span className="text-sm font-black font-mono text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                                GPA: 3.45
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );

                // 9. ការបង់ប្រាក់ (PAYMENTS & FEE MODULE WITH ACTIVE ABA PAY SIMULATOR)
                case 'payments':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Banknote className="text-emerald-600" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ការបង់ប្រាក់ និងសិក្សាសាឡុង (Financial Statement)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ទូទាត់តម្លៃសិក្សាឆមាស សៀវភៅ និងសំណុំបែបបទសិក្សាផ្សេងៗតាមរយៈប្រព័ន្ធ ABA KHQR។</p>
                        </div>
                      </div>

                      <div className="pt-1 space-y-3.5 text-slate-700">
                        {/* Statement overview ledger card */}
                        <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-550">តម្លៃសិក្សាប្រចាំឆមាស (Semester Tuition Fee) ៖</span>
                            <span className="font-black text-slate-700">$450.00</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-200 pb-2.5">
                            <span className="font-bold text-slate-550">ថ្លៃសេវាបណ្ណាល័យ និងបច្ចេកវិទ្យា ៖</span>
                            <span className="font-black text-slate-705">$15.00</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm pt-1">
                            <span className="font-extrabold text-slate-800">ទឹកប្រាក់ដែលត្រូវបង់សរុប (Total Owed Balance) ៖</span>
                            <span className="font-black font-mono text-emerald-700 text-base">$465.00</span>
                          </div>
                        </div>

                        {/* Payment Status Seal indicator */}
                        {tuitionPaid ? (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl flex items-center justify-between gap-2.5 animate-in zoom-in-95" id="p_paid_badge">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                              <div>
                                <h5 className="font-black text-xs text-slate-800 leading-tight">បានទូទាត់រួចរាល់ (SFS Account Paid)</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">កាលបរិច្ឆេទ ៖ {new Date().toLocaleDateString()} | ប្រភព ៖ ABA PAY</p>
                              </div>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9.5px] px-2.5 py-1 rounded-md uppercase tracking-wider font-sans shrink-0">
                              Paid
                            </span>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3" id="p_owed_badge">
                            <div>
                              <h5 className="font-extrabold text-xs text-amber-805 leading-tight">ការបង់ប្រាក់នៅសល់ខ្វះខាត</h5>
                              <p className="text-[10px] text-slate-500 mt-1">សូមមេត្តាទូទាត់មុនថ្ងៃទី២០ មិថុនា ដើម្បីចៀសវាងការខកខានការប្រឡងឆមាស។</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleTriggerABAPay}
                              className="bg-[#0369a1] hover:bg-sky-800 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-3xs"
                            >
                              <CreditCard size={13} />
                              <span>បង់ប្រាក់ភ្លាម</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Ledger list */}
                        <div className="bg-white border border-slate-200.5 rounded-lg p-3 text-[10.5px]">
                          <span className="text-slate-500 font-extrabold">ប្រវត្តិដឹកជញ្ជូននិងទូទាត់៖</span>
                          <div className="mt-2 text-[10px] text-slate-400 space-y-1.5 font-medium pl-1">
                            <p className="flex justify-between border-b border-slate-100 pb-1">
                              <span>1. Semester Enrollment Basic Deposited</span>
                              <span className="text-slate-700 font-mono font-bold">-$100.00 (Paid via Cash)</span>
                            </p>
                            <p className="flex justify-between pt-0.5">
                              <span>2. Technology Maintenance Levy</span>
                              <span className="text-slate-700 font-mono font-bold">-$15.00 (Settle with Admin)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                // 10. ទំនាក់ទំនងបញ្ហា (HELPDESK TICKETS & MESSAGING SIMULATOR)
                case 'contact':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <HelpCircle className="text-blue-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ប្រព័ន្ធទំនាក់ទំនង និងរាយការណ៍បញ្ហា (Helpdesk Support Portal)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ផ្ញើសំបុត្ររាយការណ៍ ដើម្បីស្នើសុំកែតម្រូវទិន្នន័យវត្តមាន ពិន្ទុ បង់ប្រាក់ ឬការលំបាកផ្សេងៗ។</p>
                        </div>
                      </div>

                      {/* Ticket Submission Form */}
                      <form onSubmit={handleCreateTicket} className="space-y-2.5 pt-1 text-slate-700">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-500">ប្រភេទនៃបញ្ហាដែលចង់រាយការណ៍ ៖</label>
                          <select
                            value={newTicketCategory}
                            onChange={e => setNewTicketCategory(e.target.value)}
                            className="mt-1 w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 bg-white"
                          >
                            <option value="វត្តមាន">កែតម្រូវទិន្នន័យវត្តមាន (Attendance Dispute)</option>
                            <option value="ពិន្ទុ">សាកសួរពិន្ទុប្រឡង (Grade & Marks Query)</option>
                            <option value="ការបង់ប្រាក់">បញ្ហាទូទាត់ការបង់ប្រាក់ (Tuition fee billing Issues)</option>
                            <option value="ផ្សេងៗ">បញ្ហាបច្ចេកទេសប្រព័ន្ធ (Portal Technical Error)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-500">សេចក្ដីរៀបរាប់លម្អិតរបស់លោកអ្នក ៖</label>
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              value={newTicketSubject}
                              onChange={e => setNewTicketSubject(e.target.value)}
                              placeholder="ឧ. សុំជួយពិនិត្យវត្តមានខកខានថ្ងៃទី៨ មិថុនា ព្រោះបញ្ហាឧបករណ៍កាមេរ៉ាស្កេន..."
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-850 focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingTicket || !newTicketSubject.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Ticket History List */}
                      <div className="pt-2 text-slate-700">
                        <span className="text-[10.5px] font-extrabold text-slate-500 uppercase block mb-2">សំបុត្រប្រវត្តិចរន្ត (My Support Logs) :</span>
                        
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {tickets.map(t => (
                            <div key={t.id} className="border border-slate-150 p-3 rounded-lg bg-slate-50/50 space-y-1.5 text-[11px]">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="font-bold text-slate-400">ID: {t.id} [{t.category}]</span>
                                <span className={`px-2 py-0.2 rounded-md font-bold text-[9.5px] ${
                                  t.status.includes('រួចរាល់') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <p className="font-extrabold text-slate-800">{t.subject}</p>
                              {t.reply && (
                                <div className="p-2 border border-blue-50 bg-blue-50/40 rounded text-[10px] text-blue-800 font-semibold italic">
                                  {t.reply}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );

                // 11. សេចក្ដីជូនដំណឹងព័ត៌មាន (NEWS & BULLETINS)
                case 'news':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Megaphone className="text-[#f43f5e]" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">សេចក្ដីជូនដំណឹង និងសាលាក្រុង (Campus Notice Board)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">រាល់សារព័ត៌មានជាផ្លូវការ រីករាយការផ្អាកថ្នាក់រៀន និងកម្មវិធីសាលាផ្សេងៗប្រកាសជូននៅទីនេះ។</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1 text-slate-700">
                        {news.length === 0 ? (
                          <p className="text-xs text-slate-450 italic text-center py-6">គ្មានព័ត៌មាន ឬសេចក្តីជូនដំណឹងថ្មីៗសព្វថ្ងៃនេះទេ</p>
                        ) : (
                          news.map(item => (
                            <div key={item.id} className="border border-slate-150 p-3.5 rounded-xl bg-gradient-to-tr from-white to-slate-50/10 shadow-4xs">
                              <span className="text-[9px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                                {item.badge || 'ទូទៅ'}
                              </span>
                              <h5 className="font-extrabold text-xs text-slate-850 mt-2">{item.title}</h5>
                              <p className="text-[10.5px] text-slate-500 mt-1 leading-normal font-medium whitespace-pre-line">{item.content}</p>
                              <span className="text-[9px] text-slate-400 font-sans mt-2 block font-medium">កាលបរិច្ឆេទ ៖ {item.date}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );

                // 12. ប្រូម៉ូសិន (OFFERS & UNIVERSITY PROMOTIONS)
                case 'promotions':
                  return (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={18} />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">ប្រូម៉ូសិន និងទំនាក់ទំនងដៃគូ (AEU Student Benefits Map)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">ការផ្តល់ជូនបញ្ចុះតម្លៃពិសេសលើដៃគូកាហ្វេ សៀវភៅ ឧបករណ៍កុំព្យូទ័រ និងការឧបត្ថម្ភអាហារូបករណ៍។</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1 text-slate-700 leading-normal">
                        {promotions.length === 0 ? (
                          <p className="text-xs text-slate-450 italic text-center py-6">គ្មានការផ្តល់ជូនប្រូម៉ូសិនពិសេសសព្វថ្ងៃនេះទេ</p>
                        ) : (
                          promotions.map(item => (
                            <div key={item.id} className="border border-purple-100 p-3.5 rounded-xl bg-gradient-to-tr from-white to-purple-50/10 shadow-4xs">
                              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                🎁 {item.title}
                              </h5>
                              <p className="text-[10.5px] text-slate-500 mt-1 leading-normal whitespace-pre-line">{item.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })()}

            {/* Bottom Status metadata label to keep design neat */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <button
                type="button"
                onClick={() => setIsPortalModalOpen(false)}
                className="bg-teal-700 hover:bg-teal-850 text-white font-extrabold text-[11px] py-1.5 px-4 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                រួចរាល់ (Back)
              </button>
              <span className="font-mono italic text-[9.5px]">Asia Euro University &copy; 2026</span>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL 1: PROFILE CARDS FORM DRAWER OVERLAY */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in transition-all duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95" id="profile_details_drawer">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-805 flex items-center gap-1.5">
                <User size={18} className="text-teal-700" />
                ប្រវត្តិរូបសង្ខេបរបស់និស្សិត
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileSaved(false);
                }}
                className="text-slate-405 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {profileSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold text-center">
                កែសម្រួលនិងរក្សាទុកសំណុំឯកសាររួចរាល់!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <span className="block font-bold text-slate-500">ឈ្មោះជាអក្សរឡាតាំង ៖</span>
                <input
                  type="text" disabled
                  value={activeStudent?.name || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-bold text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <span className="block font-bold text-slate-500">ឈ្មោះជាអក្សរខ្មែរ ៖</span>
                <input
                  type="text" disabled
                  value={activeStudent?.khmerName || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-bold text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <span className="block font-bold text-slate-550">លេខទូរស័ព្ទព័ក្ឌសមាជិក ៖</span>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-slate-850 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <span className="block font-bold text-slate-550">អាសយដ្ឋានអ៊ីមែល ៖</span>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-slate-850 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  បិទត្រឡប់
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0f766e] hover:bg-teal-850 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  រក្សាទុកការកែប្រែ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GOLDEN CERTIFICATE DISPLAY OVERLAY */}
      {showCertificatePrintout && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in transition-all duration-150">
          <div className="bg-white rounded-2xl border-4 border-amber-400 shadow-2xl max-w-lg w-full p-6 text-center space-y-4 animate-in zoom-in-95 relative overflow-hidden">
            {/* Elegant corner decals */}
            <div className="absolute top-2 left-2 w-9 h-9 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute top-2 right-2 w-9 h-9 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute bottom-2 left-2 w-9 h-9 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-2 right-2 w-9 h-9 border-b-2 border-r-2 border-amber-500" />

            <div className="space-y-1.5 font-sans decoration-amber-600">
              <span className="text-[10px] tracking-[4px] font-black uppercase text-amber-600">សាកលវិទ្យាល័យ អេស៊ីអឺរ៉ូ</span>
              <h3 className="text-lg font-black text-slate-850">ASIA EURO UNIVERSITY</h3>
              <div className="w-16 h-[1.5px] bg-amber-400 mx-auto my-2" />
              <h4 className="text-md font-extrabold text-amber-700 font-serif leading-none mt-1">លិខិតកោតសរសើរវត្តមានភក្ដីល្អឥតខ្ចោះ</h4>
              <p className="text-[10px] text-slate-400 font-mono italic">Certificate Of Outstanding Loyalty & Attendance Excel</p>
            </div>

            <div className="py-2.5 space-y-2 text-slate-700">
              <span className="text-[10px] text-slate-400">ផ្ដល់ជូនជាកិត្តិយសជូនចំពោះ ៖</span>
              <h5 className="font-black text-lg text-teal-850 tracking-wider">
                {activeStudent ? activeStudent.khmerName : 'ខឿន បូរី'}
              </h5>
              <div className="text-[10.5px] leading-relaxed max-w-sm mx-auto font-medium">
                និស្សិតបានចូលរួមរៀនយ៉ាងសកម្ម និងរក្សាបាននូវវិន័យវត្តមានកត់ត្រាក្នុងថ្នាក់រៀនខ្ពស់បំផុតរហូតដល់ជាមធ្យមភាគ <span className="font-black text-[#dc2626] font-mono">៩៥%</span> ពេញមួយឆមាសទី ១ ឆ្នាំសិក្សា ២០២៦។
              </div>
            </div>

            {/* Signature & stamp layout placeholders */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px] text-slate-400 px-6 shrink-0">
              <div className="text-left">
                <span className="font-mono">Date: {new Date().toLocaleDateString()}</span>
                <p className="mt-1">ប្រធានការិយាល័យអប់រំ</p>
              </div>

              {/* Red school seal visual gimmick */}
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 flex items-center justify-center font-black text-rose-500 text-[8px] transform rotate-12 shrink-0 opacity-80 select-none animate-pulse">
                AEU PASS
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-700 select-text">សាកលវិទ្យាធិការ</span>
                <p className="mt-1">ស៊ុន ឌីនដន</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCertificatePrintout(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2 rounded-lg cursor-pointer max-w-[120px]"
              >
                បិទត្រឡប់
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2 rounded-lg flex items-center justify-center gap-1 shadow-3xs cursor-pointer"
              >
                <Printer size={13} />
                <span>បោះពុម្ពឥឡូវ (Print Now)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IN-APP ABA BANKING PORTAL KHQR OVERLAY SIMULATOR */}
      {showABAModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#0b2545] rounded-3xl p-6 text-white text-center max-w-sm w-full space-y-4 animate-in zoom-in-95 real-shadow relative" id="aba_bank_pay_modal">
            <button
              type="button"
              onClick={() => setShowABAModal(false)}
              className="absolute top-4 right-4 text-slate-420 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* ABA visual identity header */}
            <div className="space-y-1 border-b border-white/10 pb-3">
              <h3 className="font-black font-sans text-base tracking-widest text-sky-400">ABA Mobile Pay</h3>
              <p className="text-[10px] text-slate-350">ទូទាត់តម្លៃសិក្សាសាលាដោយសុវត្ថិភាពខ្ពស់</p>
            </div>

            <div className="p-4 bg-white rounded-2xl max-w-[180px] mx-auto border-4 border-[#0e7490] relative shadow-lg">
              {/* Fake QR barcode mockup */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center text-slate-700 relative">
                {/* Visual placeholder for ABA QR Code */}
                <div className="space-y-1 flex flex-col items-center">
                  <div className="grid grid-cols-4 gap-1 w-24 h-24 p-1.5 border border-slate-300 rounded">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 1 ? 'bg-slate-900' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <span className="text-[8.5px] text-slate-400 font-mono">ABA-KHQR-AEU-64945</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-slate-200 text-xs">
              <p className="font-medium text-slate-300">គណនីបង់សរុប ៖ <span className="font-black text-sky-300">សាកលវិទ្យាល័យ អេស៊ីអឺរ៉ូ</span></p>
              <p className="text-sm font-black font-mono text-white mt-1">$465.00</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowABAModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                បោះបង់ទូទាត់
              </button>
              <button
                type="button"
                onClick={handleSettleABAPayment}
                disabled={isProcessingPayment}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span className="animate-spin text-white">...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>បង់ប្រាក់ភ្លាមៗ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
