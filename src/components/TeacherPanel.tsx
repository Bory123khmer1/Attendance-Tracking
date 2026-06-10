/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DBStore } from '../dbStore';
import { Teacher, Subject, ActiveSession, Student, AttendanceRecord } from '../types';
import { QRCodeSVG } from 'qrcode.react'; // Standard import from qrcode.react
import { 
  Tv, 
  QrCode, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  ArrowRight,
  Filter,
  Download,
  Award,
  Sparkles,
  Search,
  User,
  Users,
  X,
  LogOut,
  HelpCircle,
  FileText,
  UserPlus
} from 'lucide-react';

interface TeacherPanelProps {
  onDataChange: () => void;
  activeSessionVersion: number; // Increment to force refresh
  loggedInTeacherId?: string;
}

export default function TeacherPanel({ onDataChange, activeSessionVersion, loggedInTeacherId }: TeacherPanelProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  
  // Tab controller for table views
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'full' | 'partial' | 'absent'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Pull student states
  const [pullStudentId, setPullStudentId] = useState('');
  const [pullFeedback, setPullFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Active Session states
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});
  
  // Report preview modal
  const [showReportModal, setShowReportModal] = useState(false);

  // Load basic data
  const loadData = () => {
    const allT = DBStore.getTeachers();
    setTeachers(allT);
    
    if (loggedInTeacherId) {
      const match = allT.find(t => t.id === loggedInTeacherId);
      if (match) setActiveTeacher(match);
    } else {
      // Default to the first teacher if none selected
      if (allT.length > 0 && !activeTeacher) {
        setActiveTeacher(allT[0]);
      } else if (activeTeacher) {
        // Keep selected is still there, or refresh structure
        const current = allT.find(t => t.id === activeTeacher.id);
        if (current) setActiveTeacher(current);
      }
    }

    setActiveSessions(DBStore.getActiveSessions());
  };

  useEffect(() => {
    loadData();
  }, [activeSessionVersion]);

  // Load teacher specific subjects
  useEffect(() => {
    if (activeTeacher) {
      const allSubs = DBStore.getSubjects();
      const filtered = allSubs.filter(s => s.teacherId === activeTeacher.id);
      setMySubjects(filtered);
      
      // Auto-select first subject if none selected as active
      if (filtered.length > 0) {
        // If current selected subject is not in new list, reset it
        if (!selectedSubject || !filtered.some(s => s.id === selectedSubject.id)) {
          setSelectedSubject(filtered[0]);
        } else {
          // Refresh details of selected subject
          const updatedSub = filtered.find(s => s.id === selectedSubject.id);
          if (updatedSub) setSelectedSubject(updatedSub);
        }
      } else {
        setSelectedSubject(null);
      }
    } else {
      setMySubjects([]);
      setSelectedSubject(null);
    }
  }, [activeTeacher, activeSessionVersion]);

  // Real-time ticking down for active QR Codes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimers: { [key: string]: number } = {};
      let changed = false;

      activeSessions.forEach(session => {
        if (session.isActive) {
          const diff = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
          newTimers[session.id] = diff;
          
          if (diff === 0 && session.isActive) {
            // Expire it automatically inside local storage state
            session.isActive = false;
            changed = true;
          }
        }
      });

      setTimeRemaining(newTimers);

      if (changed) {
        DBStore.saveActiveSessions(activeSessions);
        setActiveSessions([...activeSessions]);
        onDataChange();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessions]);

  // Handle Session Triggers
  const handleStartSession = (subId: string, type: 'MORNING' | 'BREAK') => {
    const sess = DBStore.startSession(subId, type);
    setActiveSessions(DBStore.getActiveSessions());
    onDataChange();
    alert(`បានបង្កើត QR Code ${type === 'MORNING' ? '«ចូលរៀន»' : '«ចេញលេង»'} ជោគជ័យ! អាយុកាលកូដ៖ ១០ នាទី។`);
  };

  const handleDeactivateSession = (sessId: string) => {
    const updated = activeSessions.map(s => s.id === sessId ? { ...s, isActive: false } : s);
    DBStore.saveActiveSessions(updated);
    setActiveSessions(updated);
    onDataChange();
  };

  const handlePullStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    const rawInput = pullStudentId.trim();
    if (!rawInput) return;

    // Split input by space, comma, semicolon, newline or other spacing
    const idCandidates = rawInput.split(/[\s,;\u200b\n\r]+/).map(item => item.trim()).filter(item => item.length > 0);
    
    if (idCandidates.length === 0) {
      setPullFeedback({
        success: false,
        message: 'សូមសរសេរលេខសម្គាល់និស្សិតយ៉ាងហោចណាស់មួយ! (Please enter at least one Student ID!)'
      });
      return;
    }

    const allStudents = DBStore.getStudents();
    const enrollments = DBStore.getEnrollments();

    const successNames: string[] = [];
    const alreadyEnrolledNames: string[] = [];
    const notFoundIds: string[] = [];

    for (const studId of idCandidates) {
      const foundStudent = allStudents.find(s => s.studentId === studId);
      if (!foundStudent) {
        notFoundIds.push(studId);
        continue;
      }

      const isEnrolled = enrollments.some(e => e.studentId === foundStudent.id && e.subjectId === selectedSubject.id);
      if (isEnrolled) {
        alreadyEnrolledNames.push(foundStudent.khmerName || foundStudent.name);
        continue;
      }

      const enrolled = DBStore.enrollStudent(foundStudent.id, selectedSubject.id);
      if (enrolled) {
        successNames.push(foundStudent.khmerName || foundStudent.name);
      }
    }

    // Prepare Feedback messages
    if (idCandidates.length === 1) {
      if (successNames.length > 0) {
        setPullFeedback({
          success: true,
          message: `បានទាញនិស្សិតឈ្មោះ [${successNames[0]}] ចូលថ្នាក់ជោគជ័យ! (Successfully pulled student!)`
        });
        setPullStudentId('');
        onDataChange();
      } else if (alreadyEnrolledNames.length > 0) {
        setPullFeedback({
          success: false,
          message: `និស្សិតឈ្មោះ [${alreadyEnrolledNames[0]}] មានក្នុងថ្នាក់រួចហើយ! (Student is already in this class!)`
        });
      } else {
        setPullFeedback({
          success: false,
          message: `រកមិនឃើញនិស្សិតដែលមានលេខសម្គាល់ "${idCandidates[0]}" ទេ! (Student with ID "${idCandidates[0]}" not found!)`
        });
      }
    } else {
      let statusMsg = '';
      if (successNames.length > 0) {
        statusMsg += `✓ បានបញ្ចូលជោគជ័យចំនួន ${successNames.length} នាក់៖ [${successNames.join(', ')}]។ `;
      }
      if (alreadyEnrolledNames.length > 0) {
        statusMsg += `ℹ️ មានរួចហើយចំនួន ${alreadyEnrolledNames.length} នាក់៖ [${alreadyEnrolledNames.join(', ')}]។ `;
      }
      if (notFoundIds.length > 0) {
        statusMsg += `⚠️ រកមិនឃើញ ID ចំនួន ${notFoundIds.length} នាក់៖ [${notFoundIds.join(', ')}]។`;
      }

      setPullFeedback({
        success: successNames.length > 0,
        message: statusMsg.trim()
      });

      if (successNames.length > 0) {
        setPullStudentId('');
        onDataChange();
      }
    }

    setTimeout(() => {
      setPullFeedback(prev => prev ? null : prev);
    }, 10000);
  };

  // Format countdown string
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return 'Expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Get active session for selected subject
  const getActiveSessionForSubject = (subId: string) => {
    return activeSessions.find(s => s.subjectId === subId && s.isActive);
  };

  // Get student list for selected subject
  const getEnrolledStudents = () => {
    if (!selectedSubject) return [];
    
    const enrolls = DBStore.getEnrollments().filter(e => e.subjectId === selectedSubject.id);
    const allStudents = DBStore.getStudents();
    
    return enrolls.map(e => {
      const s = allStudents.find(x => x.id === e.studentId);
      return s ? s : null;
    }).filter((s): s is Student => s !== null);
  };

  // Generate complete attendance metrics for current selected subject's students
  const getCompiledRoster = () => {
    const enrolled = getEnrolledStudents();
    if (!selectedSubject) return [];

    const records = DBStore.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];

    const list = enrolled.map(student => {
      const stats = DBStore.getAttendanceStats(student.id, selectedSubject.id);
      
      // Check today's scan detail
      const todayRecord = records.find(r => r.studentId === student.id && r.subjectId === selectedSubject.id && r.date === todayStr);

      // Determine classification status
      let presence = 'ABSENT'; // default
      if (stats.percentage >= 90) {
        presence = 'FULL';
      } else if (stats.percentage > 40) {
        presence = 'PARTIAL';
      }

      return {
        student,
        stats,
        todayRecord,
        presence,
      };
    });

    // Apply search and status filters
    return list.filter(item => {
      // Search
      const matchSearch = 
        item.student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        item.student.khmerName.includes(studentSearch) ||
        item.student.studentId.toLowerCase().includes(studentSearch.toLowerCase());

      if (!matchSearch) return false;

      // Status Filter
      if (attendanceFilter === 'full') return item.stats.scannedPoints === item.stats.maxPoints;
      if (attendanceFilter === 'partial') return item.stats.scannedPoints > 0 && item.stats.scannedPoints < item.stats.maxPoints;
      if (attendanceFilter === 'absent') return item.stats.scannedPoints === 0;

      return true;
    });
  };

  // CSV Exporter Simulation
  const handleExportCSV = () => {
    if (!selectedSubject) return;
    const roster = getCompiledRoster();
    if (roster.length === 0) {
      alert('មិនមានទិន្នន័យដើម្បីនាំចេញទេ (No data to export)');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `របាយការណ៍វត្តមានសិស្ស (Attendance Roster), មុខវិជ្ជា: ${selectedSubject.khmerName} (${selectedSubject.name})\n`;
    csvContent += `សាស្ត្រាចារ្យ: ${activeTeacher?.khmerName || ''}, កាលបរិច្ឆេទ: ${new Date().toLocaleDateString()}\n\n`;
    csvContent += `ល.រ (No),អត្តសញ្ញាណ (Student ID),ឈ្មោះភាសាខ្មែរ,ឈ្មោះអង់គ្លេស,ថ្ងៃស្កេនបាន,ពិន្ទុទទួលបាន,ពិន្ទុសរុប,ភាគរយវត្តមាន (%)\n`;

    roster.forEach((item, idx) => {
      csvContent += `${idx + 1},${item.student.studentId},${item.student.khmerName},${item.student.name},${item.stats.scannedDays},${item.stats.scannedPoints},${item.stats.maxPoints},${item.stats.percentage}%\n`;
    });

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Roster_${selectedSubject.code}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('នាំចេញបរាជ័យ (Export failed)');
    }
  };

  const activeSess = selectedSubject ? getActiveSessionForSubject(selectedSubject.id) : null;
  const currentRoster = getCompiledRoster();

  // Find students scanned today in the active session for live display
  const getTodayScannersInActiveSession = () => {
    if (!selectedSubject || !activeSess) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    const records = DBStore.getAttendanceRecords().filter(r => r.subjectId === selectedSubject.id && r.date === todayStr);
    const students = DBStore.getStudents();

    return records.filter(r => {
      if (activeSess.qrType === 'MORNING') return r.scannedMorning;
      return r.scannedBreak;
    }).map(r => {
      const stu = students.find(s => s.id === r.studentId);
      const scanTime = activeSess.qrType === 'MORNING' ? r.morningTime : r.breakTime;
      return {
        stu,
        time: scanTime || 'N/A'
      };
    }).filter(x => x.stu !== undefined);
  };

  const todayScanners = getTodayScannersInActiveSession();

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6" id="teacher_panel_wrapper">
      
      {/* Teacher Selection & Dynamic Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 gap-4" id="teacher_profile_selector_header">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 text-teal-800 p-2.5 rounded-xl">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">គណនីគ្រូដែលកំពុងប្រើ (Logged-In Teacher)</p>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              {activeTeacher ? `${activeTeacher.khmerName} (${activeTeacher.name})` : 'មិនទាន់ជ្រើសរើសគ្រូ'}
              <span className="bg-teal-50 text-teal-700 text-[10px] px-2 py-0.5 rounded-md border border-teal-200">សាស្ត្រាចារ្យ</span>
            </h2>
          </div>
        </div>

        {/* Change profile dropdown directly in UI for testing flexibility! */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {loggedInTeacherId ? (
            <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-bold">
              🔒 គណនីការពារដោយសុវត្ថិភាព (Secured Profile)
            </span>
          ) : (
            <>
              <label className="text-xs text-slate-500 shrink-0 font-medium">ប្ដូរគណនីគ្រូសាកល្បង៖</label>
              <select
                value={activeTeacher?.id || ''}
                onChange={(e) => {
                  const selectedVal = teachers.find(t => t.id === e.target.value);
                  if (selectedVal) setActiveTeacher(selectedVal);
                }}
                className="border border-slate-200 rounded-lg p-1.5 text-xs bg-white focus:ring-1 focus:ring-teal-500 outline-none w-full sm:w-48 font-semibold text-slate-700"
                id="sub_profile_dropdown"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.khmerName}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full" id="teacher_dashboard_split">
        
        {/* THE BENTO SUBJECTS NAVIGATION BOARD (Matching Student's Layout) */}
        <div className="w-full flex flex-col gap-4 max-w-5xl mx-auto" id="teacher_subjects_subgrid">
          <div className="bg-transparent">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3.5 pl-1 flex items-center gap-1.5 select-none font-sans">
              <span className="w-1.5 h-3 bg-teal-600 rounded-xs" />
              មុខវិជ្ជាបង្រៀនរបស់សាស្ត្រាចារ្យ (Instructor's Assigned Subjects)
            </h3>
            
            {mySubjects.length === 0 ? (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">
                <p>សាស្ត្រាចារ្យនេះមិនទាន់មានមុខវិជ្ជាចាត់តាំងនៅឡើយទេ។</p>
                <p className="mt-1.5 font-medium text-teal-700">សូមចូលទៅផ្ទាំង Admin ដើម្បីបង្កើតមុខវិជ្ជា។</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in" id="aeu_interactive_12_grids">
                {mySubjects.map((sub) => {
                  const isSelected = selectedSubject?.id === sub.id && isSubjectModalOpen;
                  const runningSess = getActiveSessionForSubject(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(sub);
                        setIsSubjectModalOpen(true);
                      }}
                      className={`flex flex-col items-center justify-between p-5 rounded-2xl border text-center transition-all cursor-pointer select-none bg-white font-sans ${
                        isSelected 
                          ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-sm' 
                          : 'border-slate-150 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                      }`}
                      id={`portal_grid_btn_${sub.id}`}
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="w-10 h-10 bg-teal-50 text-teal-750 rounded-xl flex items-center justify-center mb-3 text-sm relative">
                          <Tv size={20} />
                          {runningSess && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" title="Active QR" />
                          )}
                        </div>
                        <div className="text-[10px] font-black text-teal-800 font-mono tracking-wider uppercase mb-1">{sub.code}</div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-tight min-h-[2.5rem] flex items-center justify-center">{sub.khmerName}</h4>
                        <p className="text-[10.5px] text-slate-400 mt-1 truncate max-w-full">{sub.name}</p>
                      </div>

                      <div className="w-full mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-teal-700/80">{sub.semester}</span>
                        <ChevronRight size={12} className="text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* OVERLAY MODAL FOR CORRESPONDING INTERACTIVE WORKSPACE CARD FOR TEACHER */}
        {selectedSubject && isSubjectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200" id="teacher_workspace_modal">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xl w-full max-w-6xl my-8 animate-in zoom-in-95 duration-150 flex flex-col justify-between min-h-[85vh] relative font-sans">
              
              {/* Modal Header or close button */}
              <button 
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
                title="Close"
              >
                <X size={20} />
              </button>

              {/* Title top bar in modal */}
              <div className="mb-4 pb-3 border-b border-slate-150 pr-10 shrink-0">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <Tv size={20} className="text-teal-700" />
                  ផ្ទាំងគ្រប់គ្រងមុខវិជ្ជា និងស្កេនវត្តមាន (Subject Workspace)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  គ្រប់គ្រងការបង្កើត QR កូដវត្តមាន ពិនិត្យបញ្ជីឈ្មោះ និងនាំចេញលទ្ធផលគណនាវត្តមានសិស្ស។
                </p>
              </div>

              {/* Split layout inside the modal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
                
                {/* Left Column: QR Trigger and Sessions */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
                  <div className="bg-gradient-to-b from-white to-slate-50 rounded-xl p-4 border border-slate-200 shadow-xs relative overflow-hidden h-full flex flex-col justify-between" id="teacher_qr_trigger_card">
              <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                <QrCode size={110} />
              </div>
              
              <div className="mb-3.5 pb-2 border-b border-slate-100">
                <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">ប្រព័ន្ធស្កេនវត្តមាន (Live Scanner Control)</p>
                <h4 className="font-extrabold text-base text-slate-850 truncate">{selectedSubject.khmerName}</h4>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="font-mono bg-slate-200/50 text-slate-700 px-1.5 py-0.5 rounded font-black text-[10px]">{selectedSubject.code}</span>
                  <span>• {selectedSubject.semester}</span>
                </div>
              </div>

              {/* Action Start Buttons: MORNING / BREAK */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleStartSession(selectedSubject.id, 'MORNING')}
                  className="bg-teal-700 hover:bg-teal-850 active:scale-95 text-white rounded-xl py-3 px-2 text-center transition-all flex flex-col items-center justify-center border border-teal-655"
                >
                  <Clock size={16} className="mb-1 text-teal-300" />
                  <span className="text-xs font-black">១. ចូលរៀន (07:30)</span>
                  <span className="text-[9px] text-teal-100 mt-0.5 font-sans font-medium uppercase tracking-wider">Start Morning QR</span>
                </button>

                <button
                  onClick={() => handleStartSession(selectedSubject.id, 'BREAK')}
                  className="bg-indigo-800 hover:bg-indigo-950 active:scale-95 text-white rounded-xl py-3 px-2 text-center transition-all flex flex-col items-center justify-center border border-indigo-755"
                >
                  <Clock size={16} className="mb-1 text-indigo-300" />
                  <span className="text-xs font-black">២. ចេញលេង (09:10)</span>
                  <span className="text-[9px] text-indigo-100 mt-0.5 font-sans font-medium uppercase tracking-wider">Start Break QR</span>
                </button>
              </div>

              {/* DISPLAY CREATED QR CODE ZONE */}
              {activeSess ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center shadow-xs" id="active_qr_canvas_holder">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="bg-red-50 text-red-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-red-200 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      QR កំពុងបើក ({activeSess.qrType === 'MORNING' ? 'ព្រឹក' : 'ចេញលេង'})
                    </span>

                    <button 
                      onClick={() => handleDeactivateSession(activeSess.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold cursor-pointer"
                    >
                      បិទវិញមុនម៉ោង
                    </button>
                  </div>

                  {/* QR SVG Component code from library */}
                  <div className="p-2.5 border-2 border-slate-200/80 rounded-2xl bg-white shadow-xs inline-block mb-3.5 transition-transform hover:scale-102 duration-200">
                    <QRCodeSVG 
                      value={activeSess.qrcode} 
                      size={180} 
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Dynamic Backup Passcode Display */}
                  {(() => {
                    const sessParts = activeSess.qrcode.split('-');
                    const sessShortCode = sessParts.length >= 2 ? sessParts[sessParts.length - 2] : '------';
                    return (
                      <div className="text-center mb-3 w-full max-w-xs">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">កូដសម្ងាត់ចុះឈ្មោះ (Attendance Code)</p>
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl py-2 px-4 inline-flex items-center justify-center gap-2 select-all cursor-pointer hover:bg-blue-105 transition-colors w-full">
                          <span className="font-mono text-xl font-black text-blue-600 tracking-widest">{sessShortCode}</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1.5 leading-relaxed font-semibold">និស្សិតអាចវាយលេខកូដសកម្ម ៦ខ្ទង់នេះ ជំនួសឲ្យការស្កេនបាន</p>
                      </div>
                    );
                  })()}

                  {/* Countdown Ticker and Timer visualization */}
                  <div className="text-center w-full bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ពេលវេលាផុតកំណត់ QR Code</p>
                    <div className="text-2xl font-black font-mono text-slate-800 tracking-wider">
                      {formatTime(timeRemaining[activeSess.id] || 0)}
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-teal-655 h-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((timeRemaining[activeSess.id] || 0) / 600) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Live entry listing ticker */}
                  <div className="w-full mt-4 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Live ស្កេនបានថ្មីៗ ({todayScanners.length})</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    </div>

                    {todayScanners.length === 0 ? (
                      <p className="text-[11px] text-center text-slate-400 py-2 italic">មិនទាន់មាននិស្សិតស្កេនវត្តមានទេ...</p>
                    ) : (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto">
                        {todayScanners.map((scLog, index) => (
                          <div key={index} className="flex items-center justify-between bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/55 text-xs">
                            <span className="font-bold text-slate-755 truncate max-w-36">{scLog.stu?.khmerName}</span>
                            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/50 px-1.5 py-0.2 rounded font-semibold">{scLog.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100/80 rounded-xl p-6 text-center border-2 border-dashed border-slate-200 text-slate-500 text-xs">
                  <span className="inline-block p-1.5 bg-slate-200/60 rounded-full mb-1">
                    <QrCode size={20} className="text-slate-400" />
                  </span>
                  <p className="font-bold text-slate-600">មិនទាន់បើក QR Code ទេ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">សូមចុចប៊ូតុងខាងលើដើម្បីបង្កើត QR Code វត្តមានថ្មី។</p>
                </div>
              )}

            </div>
          </div>

            {/* Right column: Roster details list and export reports inside modal content */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-4" id="teacher_roster_area">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex-1 flex flex-col">
                  
                  {/* Roster Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
                        <Users size={18} className="text-teal-700" /> 
                        បញ្ជីឈ្មោះនិងលទ្ធផលវត្តមានសិស្សគិតជាពិន្ទុ
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        គណនា៖ ស្កេន ២ ដង = វត្តមានពេញ (២ ពិន្ទុ) | ស្កេន ១ ដង = វត្តមានមិនពេញ (១ ពិន្ទុ)
                      </p>
                    </div>

                    {/* Exporters and Reports */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleExportCSV}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600" /> Excel (.csv)
                      </button>
                      
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="bg-teal-700 hover:bg-teal-850 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={14} /> បោះពុម្ពរបាយការណ៍
                      </button>
                    </div>
                  </div>

                  {/* PULL STUDENT BY ID WIDGET */}
                  <div className="px-4 py-3.5 border-b border-slate-200 bg-teal-50/25" id="pull_student_by_id_widget">
                    <form onSubmit={handlePullStudent} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                      <div className="shrink-0 flex items-center gap-1.5 text-slate-700">
                        <UserPlus size={16} className="text-teal-600" />
                        <span className="text-xs font-black">ទាញនិស្សិតចូលថ្នាក់ (Pull Student by ID):</span>
                      </div>
                      
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="វាយលេខសម្គាល់និស្សិត ឧ. 446123, 100002, 100003 ( can separate with space / comma / newline )"
                            value={pullStudentId}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9\s,;]/g, ''); // allow digits, spaces, commas, semicolons
                              setPullStudentId(val);
                              if (pullFeedback) setPullFeedback(null);
                            }}
                            maxLength={250}
                            className="w-full pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-teal-500 font-mono tracking-wider font-bold"
                            required
                          />
                          {pullStudentId && (
                            <button
                              type="button"
                              onClick={() => setPullStudentId('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 font-bold"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        
                        <button 
                          type="submit"
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer active:scale-95 text-center justify-center whitespace-nowrap"
                        >
                          <UserPlus size={13} /> បញ្ចូលទៅក្នុងថ្នាក់
                        </button>
                      </div>
                      
                      {/* Real-time preview */}
                      {(() => {
                        const clean = pullStudentId.trim();
                        if (!clean) return null;
                        const parsedIds = clean.split(/[\s,;]+/).map(item => item.trim()).filter(item => item.length > 0);
                        if (parsedIds.length === 0) return null;

                        const allStudents = DBStore.getStudents();
                        const matchedStudents = parsedIds
                          .map(id => allStudents.find(s => s.studentId === id))
                          .filter((s): s is Student => s !== undefined);

                        if (matchedStudents.length === 0) return null;

                        if (parsedIds.length === 1) {
                          return (
                            <div className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs shrink-0 self-center">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              ឃើញ៖ <strong className="text-slate-800">{matchedStudents[0].khmerName}</strong> ({matchedStudents[0].name})
                            </div>
                          );
                        }

                        return (
                          <div className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md flex flex-wrap items-center gap-1.5 shadow-2xs max-w-sm shrink-0 self-center">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-0.5" />
                            ឃើញ <strong className="text-teal-750 font-extrabold">{matchedStudents.length}/{parsedIds.length}</strong> នាក់៖
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                              {matchedStudents.map((ms) => (
                                <span key={ms.id} className="bg-slate-100 text-slate-700 text-[10px] px-1 rounded-sm border border-slate-200">
                                  {ms.khmerName || ms.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </form>

                    {/* Feedback notifications */}
                    {pullFeedback && (
                      <div className={`mt-2 p-2 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in duration-355 ${pullFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <span className="font-semibold shrink-0">{pullFeedback.success ? '✓' : '⚠️'}</span>
                        <p className="font-bold leading-tight">{pullFeedback.message}</p>
                        <button 
                          onClick={() => setPullFeedback(null)} 
                          className="ml-auto text-slate-400 hover:text-slate-600 shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filtering Controls */}
                  <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Search size={14} />
                      </span>
                      <input 
                        type="text" 
                        placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខអត្តសញ្ញាណ..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 hover:bg-slate-50/20 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    {/* Filters badges */}
                    <div className="flex flex-wrap items-center gap-1 text-[11px]" id="attendance_filters_subbar">
                      <button 
                        onClick={() => setAttendanceFilter('all')}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all ${attendanceFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        ទាំងអស់
                      </button>
                      <button 
                        onClick={() => setAttendanceFilter('full')}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all ${attendanceFilter === 'full' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        ពេញ {currentRoster.filter(r => r.stats.scannedPoints === r.stats.maxPoints).length}
                      </button>
                      <button 
                        onClick={() => setAttendanceFilter('partial')}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all ${attendanceFilter === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        ខ្វះ {currentRoster.filter(r => r.stats.scannedPoints > 0 && r.stats.scannedPoints < r.stats.maxPoints).length}
                      </button>
                      <button 
                        onClick={() => setAttendanceFilter('absent')}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all ${attendanceFilter === 'absent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        អវត្តមាន {currentRoster.filter(r => r.stats.scannedPoints === 0).length}
                      </button>
                    </div>
                  </div>

                  {/* Roster Table Content */}
                  <div className="flex-1 overflow-x-auto min-h-64" id="roster_details_table_parent">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 bg-slate-50/40">
                          <th className="py-2 px-3">អត្តសញ្ញាណ (Student ID)</th>
                          <th className="py-2 px-3">ឈ្មោះនិស្សិត</th>
                          <th className="py-2 px-3 text-center">ថ្ងៃរៀនសរុប</th>
                          <th className="py-2 px-3 text-center">ស្កេនបានសរុប</th>
                          <th className="py-2 px-3 text-center">អវត្តមាន</th>
                          <th className="py-2 px-3 text-center">ភាគរយ %</th>
                          <th className="py-2 px-3 text-right">ស្ថានភាពថ្ងៃនេះ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {currentRoster.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400">មិនមានឈ្មោះក្នុងលក្ខខណ្ឌចម្រោះនេះឡើយ</td>
                          </tr>
                        ) : (
                          currentRoster.map(item => {
                            const { student, stats, todayRecord } = item;
                            
                            // Status styling based on percentage
                            let progressColor = 'bg-red-500';
                            let textColor = 'text-red-750 bg-red-50 border-red-100';
                            if (stats.percentage >= 85) {
                              progressColor = 'bg-emerald-500';
                              textColor = 'text-emerald-750 bg-emerald-50 border-emerald-100';
                            } else if (stats.percentage >= 60) {
                              progressColor = 'bg-amber-500';
                              textColor = 'text-amber-750 bg-amber-50 border-amber-100';
                            }

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{student.studentId}</td>
                                <td className="py-2.5 px-3">
                                  <div className="font-extrabold text-slate-800">{student.khmerName}</div>
                                  <div className="text-[10px] text-slate-400 font-sans">{student.name}</div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-medium">{selectedSubject.totalDays} ថ្ងៃ</td>
                                <td className="py-2.5 px-3 text-center font-medium font-mono text-slate-800">
                                  {stats.scannedPoints} / {stats.maxPoints}
                                </td>
                                <td className="py-2.5 px-3 text-center text-red-500 font-mono font-medium">{stats.absentDays} ថ្ងៃ</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-block font-sans font-black text-[10px] px-2 py-0.5 rounded border ${textColor}`}>
                                    {stats.percentage}%
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {todayRecord ? (
                                    <div className="flex flex-col items-end gap-0.5">
                                      {todayRecord.scannedMorning && todayRecord.scannedBreak ? (
                                        <span className="bg-emerald-12 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold text-[9px] border border-emerald-200">
                                          មកពេញ (២ ស្កេន)
                                        </span>
                                      ) : (
                                        <span className="bg-amber-12 text-amber-800 px-1.5 py-0.5 rounded-md font-bold text-[9px] border border-amber-200">
                                          មកខ្វះ (១ ស្កេន)
                                        </span>
                                      )}
                                      <span className="text-[9px] text-slate-400 font-sans">
                                        {todayRecord.scannedMorning ? `ព្រឹក:${todayRecord.morningTime?.substring(0, 5)}` : ''} 
                                        {todayRecord.scannedBreak ? ` | លេង:${todayRecord.breakTime?.substring(0, 5)}` : ''}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-155">
                                      អវត្តមាន (០ ស្កេន)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="mt-5 pt-3.5 border-t border-slate-150 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="bg-teal-700 hover:bg-teal-850 text-white font-extrabold text-[12.5px] py-1.5 px-5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
              >
                រួចរាល់ (Back to Subjects)
              </button>
              <span className="font-mono italic text-[9.5px]">Asia Euro University &copy; 2026</span>
            </div>

          </div>
        </div>
      )}

      </div> {/* Close teacher_dashboard_split */}

      {/* --- REPORT PRINTING PREVIEW MODAL --- */}
      {showReportModal && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="printing_report_backdrop">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Tool Bar banner */}
            <div className="bg-slate-800 px-4 py-3 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FileText size={18} /> សន្លឹកទិន្នន័យវត្តមានសិស្សសម្រាប់បោះពុម្ព
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Download size={13} /> បញ្ជា Print សន្លឹកនេះ
                </button>
                <button onClick={() => setShowReportModal(false)} className="text-white/80 hover:text-white bg-slate-700 p-1 rounded-md"><X size={16} /></button>
              </div>
            </div>

            {/* Printable Frame Area */}
            <div className="p-8 overflow-y-auto bg-white flex-1 font-sans text-slate-800 text-sm print:p-0" id="printable_report_body">
              {/* Report Letter Head */}
              <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
                <h1 className="text-xl font-black text-slate-900 tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h1>
                <h2 className="text-base font-bold text-slate-800 mt-0.5">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
                <div className="w-24 h-0.5 bg-slate-900 mx-auto my-2" />
                
                <div className="mt-4 flex justify-between items-end text-left text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-bold">ដេប៉ាតឺម៉ង់៖ <span className="font-medium text-slate-800">{activeTeacher?.department}</span></p>
                    <p className="font-bold mt-1">គ្រូបង្រៀន៖ <span className="font-bold text-teal-850">{activeTeacher?.khmerName} ({activeTeacher?.name})</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">ថ្នាក់មុខវិជ្ជា៖ <span className="font-bold text-slate-900">{selectedSubject?.khmerName} ({selectedSubject?.code})</span></p>
                    <p className="font-bold mt-1">កាលបរិច្ឆេទរបាយការណ៍៖ <span className="font-sans font-medium">{new Date().toLocaleDateString('km', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                  </div>
                </div>
              </div>

              <h3 className="text-center text-base font-extrabold text-slate-950 mb-4 tracking-wide uppercase">
                របាយការណ៍បូកសរុបពិន្ទុវត្តមានសិស្ស
              </h3>

              {/* Data Table */}
              <table className="w-full text-left border border-collapse border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="border border-slate-300 p-2 text-center">ល.រ</th>
                    <th className="border border-slate-300 p-2">អត្តសញ្ញាណនិស្សិត</th>
                    <th className="border border-slate-300 p-2">ឈ្មោះភាសាខ្មែរ</th>
                    <th className="border border-slate-300 p-2">ឈ្មោះអង់គ្លេស/សកល</th>
                    <th className="border border-slate-300 p-2 text-center">សរុបថ្ងៃរៀន</th>
                    <th className="border border-slate-300 p-2 text-center">ចំនួនស្កេនបាន</th>
                    <th className="border border-slate-300 p-2 text-center">អវត្តមាន</th>
                    <th className="border border-slate-300 p-2 text-center">ភាគរយ (%)</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {getCompiledRoster().map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-teal-850">{item.student.studentId}</td>
                      <td className="border border-slate-300 p-2 font-bold">{item.student.khmerName}</td>
                      <td className="border border-slate-300 p-2 font-sans">{item.student.name}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{selectedSubject.totalDays} ថ្ងៃ</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold">{item.stats.scannedPoints} / {item.stats.maxPoints}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-red-500 font-semibold">{item.stats.absentDays} ថ្ងៃ</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-black">{item.stats.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer and signs block */}
              <div className="mt-12 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="italic text-slate-500">គណៈគ្រប់គ្រងសាលាពិនិត្យ</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">------------------------------</p>
                </div>
                <div>
                  <p className="font-bold text-slate-850">សាស្ត្រាចារ្យទទួលបន្ទុកថ្នាក់</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ហត្ថលេខានិងកាលបរិច្ឆេទ</p>
                  <div className="h-16" />
                  <p className="font-extrabold text-teal-900">{activeTeacher?.khmerName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
