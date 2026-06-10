import React, { useState, useEffect } from 'react';
import { DBStore } from '../dbStore';
import { Teacher, Student, RoleMode } from '../types';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  Lock, 
  User, 
  KeyRound, 
  QrCode, 
  Clock, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (role: RoleMode, userId?: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<RoleMode>('ADMIN');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Teacher selection state
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherPasscode, setTeacherPasscode] = useState('');

  // Student identification state
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentPasscode, setStudentPasscode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load fresh records
    const tList = DBStore.getTeachers();
    const sList = DBStore.getStudents();
    setTeachers(tList);
    setStudents(sList);

    if (tList.length > 0) {
      setSelectedTeacherId(tList[0].id);
    }
    
    // Autofill typical student for easy sandbox testing
    const defaultStudent = sList.find(s => s.studentId === 'N-STU-446') || sList[0];
    if (defaultStudent) {
      setStudentIdInput(defaultStudent.studentId);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'ADMIN') {
      if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === '123') {
        onLoginSuccess('ADMIN');
      } else {
        setErrorMsg('គណនី ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ! (គំរូ៖ admin / 123)');
      }
    } else if (role === 'TEACHER') {
      if (!selectedTeacherId) {
        setErrorMsg('សូមជ្រើសរើសគណនីគ្រូបង្គោល!');
        return;
      }
      // Simple passcode demo verification: "123" or empty for testing flexibility
      if (teacherPasscode === '123' || teacherPasscode === '') {
        onLoginSuccess('TEACHER', selectedTeacherId);
      } else {
        setErrorMsg('លេខកូដសម្ងាត់របស់គ្រូមិនត្រឹមត្រូវទេ! (គំរូ៖ ១២៣ ឬទុកទទេ)');
      }
    } else if (role === 'STUDENT') {
      if (!studentIdInput.trim()) {
        setErrorMsg('សូមវាយបញ្ចូលអត្តសញ្ញាណនិស្សិត!');
        return;
      }
      
      const foundStudent = students.find(
        s => s.studentId.trim().toLowerCase() === studentIdInput.trim().toLowerCase()
      );

      if (foundStudent) {
        if (studentPasscode === '123' || studentPasscode === '') {
          onLoginSuccess('STUDENT', foundStudent.id);
        } else {
          setErrorMsg('លេខកូដសម្ងាត់និស្សិតមិនត្រឹមត្រូវទេ! (គំរូ៖ ១២៣ ឬទុកទទេ)');
        }
      } else {
        setErrorMsg(`រកមិនឃើញអត្តសញ្ញាណនិស្សិត "${studentIdInput}" ទេ! (សូមប្រាកដថាបានបង្កើតក្នុងផ្ទាំង Admin)`);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4" id="login_screen_wrapper">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden" id="login_card">
        
        {/* Beautiful high quality Khmer school brand header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 text-center relative overflow-hidden" id="login_brand_header">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <QrCode size={120} />
          </div>
          <div className="inline-flex bg-blue-600/20 text-blue-400 p-2.5 rounded-xl border border-blue-500/25 mb-3">
            <QrCode size={28} />
          </div>
          <h2 className="text-lg font-black tracking-tight font-sans text-white">
            សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប (<span className="text-blue-400">AEU</span>)
          </h2>
          <p className="text-xs text-slate-350 font-bold mt-1 uppercase tracking-wider font-mono">Gold Building - Attendance Platform</p>
        </div>

        {/* Roles Segment Picker */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2" id="login_role_picker">
          <button
            type="button"
            onClick={() => { setRole('ADMIN'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
              role === 'ADMIN' 
                ? 'bg-blue-600 text-white shadow-sm font-black' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="role_admin_tab"
          >
            <Shield size={16} />
            <span>១. Admin</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('TEACHER'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
              role === 'TEACHER' 
                ? 'bg-blue-600 text-white shadow-sm font-black' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="role_teacher_tab"
          >
            <Users size={16} />
            <span>២. គ្រូបង្រៀន</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('STUDENT'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
              role === 'STUDENT' 
                ? 'bg-blue-600 text-white shadow-sm font-black' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="role_student_tab"
          >
            <GraduationCap size={16} />
            <span>៣. និស្សិត</span>
          </button>
        </div>

        {/* Login form zone */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4" id="login_form_tag">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* 1. ADMIN TYPE FORM */}
          {role === 'ADMIN' && (
            <div className="space-y-3.5" id="admin_form_fields">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">គណនីគ្រប់គ្រង (Username) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    placeholder="ឈ្មោះគណនី admin..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខកូដសម្ងាត់ (Password) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 animate-pulse-once"
                    placeholder="លេខកូដសម្ងាត់ (១២៣)..."
                    required
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500 flex gap-1.5 items-start">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <span>គណនីគំរូ Admin: <b>admin</b> និងលេខសម្ងាត់៖ <b>123</b></span>
              </div>
            </div>
          )}

          {/* 2. TEACHER TYPE FORM */}
          {role === 'TEACHER' && (
            <div className="space-y-3.5" id="teacher_form_fields">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសគណនីគ្រូ (Select Teacher Profile) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={15} />
                  </span>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 cursor-pointer"
                  >
                    {teachers.length === 0 ? (
                      <option value="">(មិនមានគណនីគ្រូ - សូមបង្កើតក្នុងផ្ទាំង Admin)</option>
                    ) : (
                      teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.khmerName} ({t.name})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខសម្ងាត់របស់គ្រូ (Passcode) [ស្រេចចិត្ត]</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    value={teacherPasscode}
                    onChange={(e) => setTeacherPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    placeholder="វាយ ១២៣ ឬទុកទទេរដើម្បីចូល..."
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500 flex gap-1.5 items-start">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <span>គណនីគំរូគ្រូ៖ <b>១២៣</b> ឬទុកទទេរដើម្បីចូលដោយគ្មានការរឹតត្បិត។</span>
              </div>
            </div>
          )}

          {/* 3. STUDENT TYPE FORM */}
          {role === 'STUDENT' && (
            <div className="space-y-3.5" id="student_form_fields">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">បញ្ចូលអត្តសញ្ញាណនិស្សិត (Student ID) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <GraduationCap size={15} />
                  </span>
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono tracking-wider"
                    placeholder="ឧទាហរណ៍៖ N-STU-446..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">លេខសម្ងាត់និស្សិត (Passcode) [ស្រេចចិត្ត]</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    value={studentPasscode}
                    onChange={(e) => setStudentPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    placeholder="វាយ ១២៣ ឬទុកទទេរដើម្បីចូល..."
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500 flex gap-1.5 items-start">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <span>គណនីនិស្សិតគំរូ៖ <b>N-STU-446</b> (ឬស្វែងរកនិងចុះឈ្មោះនិស្សិតថ្មីក្នុងផ្ទាំង Admin)។ វាយ <b>123</b> ឬទុកទទេរដើម្បីចូល។</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            id="login_action_btn"
          >
            <span>ចូលទៅកាន់ប្រព័ន្ធរៀនសូត្រ (Sign In Now)</span>
            <ArrowRight size={15} />
          </button>
        </form>

      </div>
    </div>
  );
}
