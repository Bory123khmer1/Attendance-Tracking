/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import LoginScreen from './components/LoginScreen';
import { RoleMode } from './types';
import { DBStore } from './dbStore';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  Clock, 
  HelpCircle, 
  Check, 
  QrCode, 
  Calendar,
  X,
  Sparkles,
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function App() {
  const [activeSessionVersion, setActiveSessionVersion] = useState<number>(0);
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  
  // Login secure session states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('qr_is_logged_in') === 'true';
  });
  const [loggedInRole, setLoggedInRole] = useState<RoleMode>(() => {
    return (sessionStorage.getItem('qr_logged_in_role') as RoleMode) || 'ADMIN';
  });
  const [loggedInUserId, setLoggedInUserId] = useState<string>(() => {
    return sessionStorage.getItem('qr_logged_in_user_id') || '';
  });

  // Quick-start guide visibility toggles
  const [showInstructions, setShowInstructions] = useState<boolean>(false); // default to false since we are logged in, keeps screen clean!

  // Quick helper to handle credentials login
  const handleLoginSuccess = (role: RoleMode, userId?: string) => {
    sessionStorage.setItem('qr_is_logged_in', 'true');
    sessionStorage.setItem('qr_logged_in_role', role);
    sessionStorage.setItem('qr_logged_in_user_id', userId || '');
    
    setIsLoggedIn(true);
    setLoggedInRole(role);
    setLoggedInUserId(userId || '');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('qr_is_logged_in');
    sessionStorage.removeItem('qr_logged_in_role');
    sessionStorage.removeItem('qr_logged_in_user_id');
    
    setIsLoggedIn(false);
    setLoggedInRole('ADMIN');
    setLoggedInUserId('');
  };

  // Read current DB Store stats to display in sticky sub-headers
  const [studentCount, setStudentCount] = useState<number>(0);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [subjectCount, setSubjectCount] = useState<number>(0);

  // Update counters on local storage change
  const handleDataChange = () => {
    setActiveSessionVersion(prev => prev + 1);
  };

  useEffect(() => {
    const students = DBStore.getStudents();
    const teachers = DBStore.getTeachers();
    const subjects = DBStore.getSubjects();
    setStudentCount(students.length);
    setTeacherCount(teachers.length);
    setSubjectCount(subjects.length);
  }, [activeSessionVersion]);

  // Real-time ticking Clock update loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatKhmerDate = (d: Date) => {
    try {
      return d.toLocaleDateString('km-KH', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return d.toDateString();
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col font-sans antialiased text-slate-800" id="main_academic_app_parent">
      
      {/* High Density Slate & Blue Header Hub */}
      <header className="bg-slate-900 text-white border-b-4 border-blue-500 z-40" id="main_app_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Platform Title Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-center border border-blue-400">
              <QrCode size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                ASIA EURO UNIVERSITY (<span className="text-blue-400">AEU</span>)
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">GOLD BUILDING • ATTENDANCE CONSOLE</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Real-time Login identity indicator */}
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-left font-sans">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">គណនីចូល៖ ({loggedInRole})</p>
                    <p className="text-xs font-black text-blue-400 mt-1 leading-none">
                      {loggedInRole === 'ADMIN' ? 'ម្ចាស់ប្រព័ន្ធ (Admin)' : loggedInRole === 'TEACHER' ? 'សាស្ត្រាចារ្យ (Teacher)' : 'និស្សិត (Student)'}
                    </p>
                  </div>
                </div>

                {/* Guide button */}
                <button
                  onClick={() => setShowInstructions(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all outline-none border cursor-pointer active:scale-95 ${
                    showInstructions 
                      ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="មើលរមណីយដ្ឋានណែនាំការប្រើប្រាស់"
                  id="tab_guide_info_toggle"
                >
                  <HelpCircle size={13} />
                  <span className="hidden sm:inline">{showInstructions ? 'លាក់ជំនួយ' : 'ជំនួយ'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95"
                  title="ចាកចេញពីប្រព័ន្ធ"
                  id="header_logout_btn"
                >
                  <LogOut size={13} />
                  <span>ចាកចេញ</span>
                </button>
              </div>
            )}

            {/* Real-Time Local clock visualizer */}
            <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700 font-sans" id="header_live_clock">
              <Clock size={14} className="text-blue-400 animate-spin duration-3000" />
              <div className="text-right">
                <div className="text-xs font-extrabold text-white tracking-widest leading-none">
                  {liveTime.toTimeString().split(' ')[0]}
                </div>
                <div className="text-[9px] text-slate-400 font-bold whitespace-nowrap mt-0.5">
                  {formatKhmerDate(liveTime)}
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* QUICK ACADEMIC INSTRUCTIONS BOARD BANNER */}
      {isLoggedIn && showInstructions && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 p-4" id="academic_instructions_board">
          <div className="max-w-7xl mx-auto flex justify-between items-start gap-4">
            <div className="flex gap-3">
              <div className="bg-white text-blue-600 p-2 rounded-lg border border-blue-150 shrink-0">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> សៀវភៅណែនាំប្រើប្រាស់រហ័ស (Interactive Sandbox Instructions)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-xs text-slate-650 leading-relaxed">
                  <div className="bg-white/60 p-2.5 rounded-lg border border-white">
                    <p className="font-bold text-blue-600">ជំហានទី ១ (Admin Setup):</p>
                    <p className="mt-0.5">ផ្ទាំង Admin សម្រាប់បង្កើតគ្រូ និស្សិត មុខវិជ្ជា និងចុះឈ្មោះនិស្សិតចូលទៅក្នុងថ្នាក់នីមួយៗ (ចុះឈ្មោះក្នុងថ្នាក់សិន ទើបស្កេនបាន)។</p>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-white">
                    <p className="font-bold text-blue-600">ជំហានទី ២ (គ្រូបើកដំណើរការ):</p>
                    <p className="mt-0.5">ចូលទៅផ្ទាំង <b>គ្រូបង្រៀន</b> រួចជ្រើសរើសមុខវិជ្ជា។ ចុច <b>« Start Session (07:30) »</b> ដើម្បីបង្កើត QR Code បើកវត្តមាន។</p>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-white">
                    <p className="font-bold text-blue-600">ជំហានទី ៣ (និស្សិតស្កេន):</p>
                    <p className="mt-0.5">ចូលទៅកាន់ផ្ទាំង <b>និស្សិត</b>។ ជ្រើសរើសកូដ QR សកម្មដែលទើបបង្កើត រួចចុច <b>«ស្កេនកូដនេះភ្លាមៗ»</b> បន្ទាប់មកមើលវត្តមានឡើងវិញ។</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowInstructions(false)}
              className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-200/50 rounded-md shrink-0 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Primary Panels Frame */}
      <main className="flex-1 w-full max-w-7xl mx-auto" id="app_primary_panels_frame">
        {!isLoggedIn ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {loggedInRole === 'ADMIN' && (
              <AdminPanel onDataChange={handleDataChange} />
            )}
            
            {loggedInRole === 'TEACHER' && (
              <TeacherPanel 
                onDataChange={handleDataChange} 
                activeSessionVersion={activeSessionVersion}
                loggedInTeacherId={loggedInUserId}
              />
            )}
            
            {loggedInRole === 'STUDENT' && (
              <StudentPanel 
                onDataChange={handleDataChange} 
                activeSessionVersion={activeSessionVersion}
                loggedInStudentId={loggedInUserId}
              />
            )}
          </>
        )}
      </main>

      {/* Custom Global Footer */}
      <footer className="bg-white py-4 border-t border-slate-200 text-center text-[11px] text-slate-400 font-sans" id="academic_footer">
        <p>© ២០២៦ - សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប (Asia Euro University - AEU Gold Building).</p>
        <p className="mt-0.5">ប្រព័ន្ធគ្រប់គ្រងសកម្មភាពសិក្សា និងវត្តមាននិស្សិតតាមរយៈ QR Code ប្រកបដោយប្រសិទ្ធភាព និងសុវត្ថិភាពខ្ពស់។</p>
      </footer>

    </div>
  );
}
