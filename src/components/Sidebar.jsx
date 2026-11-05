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
      { id: 'results', label: 'Submissions & Grades', icon: CheckCircle2 }, // Maps to my-assignment-submissions
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
   <aside className="w-64 flex flex-col justify-between min-h-screen p-5 border-r border-[#364156] shadow-sm font-sans" style={{ backgroundColor: '#011638', color: '#ffffff' }}>
  <div>
    {/* Brand Header */}
    <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#364156]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl text-[#dff8eb] shadow-sm" style={{ backgroundColor: '#214e34' }}>
        SA
      </div>
      <div>
        <h1 className="font-bold text-base leading-tight text-white">SmartAcademic</h1>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#cdcdcd]">{userRole} Portal</span>
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
            className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl text-xs font-bold transition-all ${
              isActive 
                ? 'shadow-sm font-extrabold text-[#dff8eb]' 
                : 'text-[#cdcdcd] hover:bg-[#364156]'
            }`}
            style={isActive ? { backgroundColor: '#214e34', border: '1px solid #364156' } : {}}
          >
            <Icon size={16} style={isActive ? { color: '#dff8eb' } : { color: '#cdcdcd' }} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  </div>

  {/* UNIVERSAL RETURN / SWITCH BUTTONS FOR ADMINS & TEACHERS */}
  {baseRole && baseRole !== 'student' && (
    <div className="mb-4 p-3 rounded-2xl space-y-2 border border-[#364156]" style={{ backgroundColor: '#364156' }}>
      <span className="text-[10px] font-extrabold uppercase tracking-wider px-1 text-[#cdcdcd]">Switch Dashboard</span>
      
      {baseRole === 'admin' && (
        <button 
          onClick={() => navigate('/dashboard/admin')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            userRole === 'admin' 
              ? 'bg-[#214e34] text-[#dff8eb] shadow-sm' 
              : 'text-[#cdcdcd] hover:bg-[#011638]'
          }`}
        >
          Back to Admin
        </button>
      )}

      <button 
        onClick={() => navigate('/dashboard/teacher')}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
          userRole === 'teacher' 
            ? 'bg-[#214e34] text-[#dff8eb] shadow-sm' 
            : 'text-[#cdcdcd] hover:bg-[#011638]'
        }`}
      >
        Teacher Dashboard
      </button>

      <button 
        onClick={() => navigate('/dashboard/student')}
        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
          userRole === 'student' 
            ? 'bg-[#214e34] text-[#dff8eb] shadow-sm' 
            : 'text-[#cdcdcd] hover:bg-[#011638]'
        }`}
      >
        Student Dashboard
      </button>
    </div>
  )}

  {/* Logout Action */}
  <div className="pt-4 border-t border-[#364156]">
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
</aside>
  );
}