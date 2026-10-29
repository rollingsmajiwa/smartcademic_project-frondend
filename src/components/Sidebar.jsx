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
      { id: 'assignments', label: 'Assignments Hub', icon: FileText },       // Maps to assignments
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

  const menuItems = roleMenus[userRole] || [];

  return (
    <aside className="w-64 bg-white text-blue-800 flex flex-col justify-between min-h-screen p-5 border-r border-slate-200/80 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/20">
            SA
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-blue-900">SmartAcademic</h1>
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">{userRole} Portal</span>
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
              onClick={() => 
                {if (tab.id === 'home' || tab.id === 'overview') {
                    navigate(`/dashboard/${userRole}`);}
                else {
                    navigate(`/dashboard/${userRole}/${tab.id}`);
                    }}}
                    
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isActive 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        </nav>
      </div>

      {/* UNIVERSAL RETURN / SWITCH BUTTONS FOR ADMINS & TEACHERS */}
        {baseRole && baseRole !== 'student' && (
          <div className="mb-6 p-2  space-y-1">
            <span className="px-1">Switch Dashboard</span>
            
            {baseRole === 'admin' && (
              <button 
                onClick={() => navigate('/dashboard/admin')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                  userRole === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                Back to Admin
              </button>
            )}

            <button 
              onClick={() => navigate('/dashboard/teacher')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                userRole === 'teacher' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Teacher Dashboard
            </button>

            <button 
              onClick={() => navigate('/dashboard/student')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                userRole === 'student' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Student Dashboard
            </button>
          </div>
        )}
      {/* Logout Action */}
      <div className="pt-4 border-t border-blue-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}