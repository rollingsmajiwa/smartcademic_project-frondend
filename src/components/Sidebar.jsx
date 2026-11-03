import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  BookOpen, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Users, 
  ShieldCheck,
  CheckCircle2,
  Building2,
  UserCheck,
  ClipboardList, 
  LogOut,
  BookOpenCheck,
  BarChart3,
  FileCheck,
  FileCheck2 
} from 'lucide-react';

export default function Sidebar({ userRole, baseRole, activeTab, setActiveTab, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const roleMenus = {
    teacher: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'Overview Dashboard', icon: BookOpen },
      {id: 'revisions', label: 'Revision Materials', icon: BookOpenCheck},
      { id: 'assignments', label: 'Assignments Hub', icon: FileText },
      { id: 'exams', label: 'Exams Manager', icon: GraduationCap },
      { id: 'submissions', label: 'Submissions & Grading', icon: FileCheck },
      { id: 'attendance', label: 'Geo Attendance', icon: MapPin },
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3 },
    ],
    student: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'Student Overview', icon: BookOpen },
      { id: 'materials', label: 'Revision Materials', icon: BookOpenCheck }, // Maps to materials
      { id: 'assignments', label: 'My Assignments', icon: FileText },       // Maps to assignments
      { id: 'exams', label: 'Exams Portal', icon: GraduationCap },           // Maps to exams
      { id: 'results', label: 'My Submissions & Grades', icon: CheckCircle2 }, // Maps to my-assignment-submissions
    ],
    admin: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'System Overview', icon: ShieldCheck },
      { id: 'classrooms', label: 'Manage Classrooms', icon: Building2 },    // Maps to classrooms
      { id: 'students', label: 'Manage Students', icon: Users },             // Maps to students
      { id: 'teachers', label: 'Manage Teachers', icon: UserCheck },         // Maps to teachers
      { id: 'attendance', label: 'Teacher Attendance', icon: MapPin },       // Maps to attendance
      { id: 'posts', label: 'Assignments & Exams', icon: ClipboardList },    // Maps to assignments & exams posts
      { id: 'submissions', label: 'All Submissions', icon: FileCheck2 },  
    ]
  };
  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/signin');
  };
  const menuItems = roleMenus[userRole] || [];
  const handleGoHome = () => {
    navigate('/')
  }
  return (
    <aside className="w-64 bg-white flex flex-col justify-between min-h-screen p-5 border-r border-slate-200/80 shadow-sm font-sans">
  <div>
    {/* Brand Header */}
    <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm" style={{ backgroundColor: 'var(--sa-green-dark)' }}>
        SA
      </div>
      <div>
        <h1 className="font-bold text-base leading-tight text-slate-800">SmartAcademic</h1>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{userRole} Portal</span>
      </div>
    </div>

    {/* Navigation Links */}
    <nav className="space-y-1.5">
      {menuItems.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'home') {
                handleGoHome();
              } else {
                navigate(`/dashboard/${userRole}/${tab.id}`);
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive 
                ? 'shadow-sm text-slate-900 font-extrabold' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            style={isActive ? { backgroundColor: 'var(--sa-green-light)', border: '1px solid var(--sa-green-soft)' } : {}}
          >
            <Icon size={16} style={isActive ? { color: 'var(--sa-green-dark)' } : {}} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  </div>

  {/* UNIVERSAL RETURN / SWITCH BUTTONS FOR ADMINS & TEACHERS */}
  {baseRole && baseRole !== 'student' && (
    <div className="mb-4 p-3 rounded-2xl space-y-2 border border-slate-100 bg-slate-50/50">
      <span className="text-[10px] font-extrabold uppercase tracking-wider px-1 text-slate-400">Switch Dashboard</span>
      
      {baseRole === 'admin' && (
        <button 
          onClick={() => navigate('/dashboard/admin')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            userRole === 'admin' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
        >
          Back to Admin
        </button>
      )}

      <button 
        onClick={() => navigate('/dashboard/teacher')}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
          userRole === 'teacher' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-sky-600 hover:bg-sky-50'
        }`}
      >
        Teacher Dashboard
      </button>

      <button 
        onClick={() => navigate('/dashboard/student')}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
          userRole === 'student' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-sky-600 hover:bg-sky-50'
        }`}
      >
        Student Dashboard
      </button>
    </div>
  )}

  {/* Logout Action */}
  <div className="pt-4 border-t border-slate-100">
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
</aside>
  );
}