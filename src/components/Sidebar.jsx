import React from 'react';
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

export default function Sidebar({ userRole, activeTab, setActiveTab, onLogout }) {
  const roleMenus = {
    teacher: [
      { id: 'overview', label: 'Overview Dashboard', icon: BookOpen },
      {id: 'revisions', label: 'Revision Materials', icon: BookOpenCheck},
      { id: 'assignments', label: 'Assignments Hub', icon: FileText },
      { id: 'exams', label: 'Exams Manager', icon: GraduationCap },
      { id: 'submissions', label: 'Submissions & Grading', icon: FileCheck },
      { id: 'attendance', label: 'Geo Attendance', icon: MapPin },
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3 },
    ],
    student: [
      { id: 'overview', label: 'Student Overview', icon: BookOpen },
      { id: 'materials', label: 'Revision Materials', icon: BookOpenCheck }, // Maps to api/students/materials/
      { id: 'assignments', label: 'Assignments Hub', icon: FileText },       // Maps to api/students/assignments/
      { id: 'exams', label: 'Exams Portal', icon: GraduationCap },           // Maps to api/students/exams/
      { id: 'results', label: 'My Submissions & Grades', icon: CheckCircle2 }, // Maps to api/students/my-assignment-submissions/
    ],
    admin: [
      { id: 'overview', label: 'System Overview', icon: ShieldCheck },
      { id: 'classrooms', label: 'Manage Classrooms', icon: Building2 },    // Maps to api/admin/classrooms/[cite: 6]
      { id: 'students', label: 'Manage Students', icon: Users },             // Maps to api/admin/students/[cite: 6]
      { id: 'teachers', label: 'Manage Teachers', icon: UserCheck },         // Maps to api/admin/teachers/[cite: 6]
      { id: 'attendance', label: 'Teacher Attendance', icon: MapPin },       // Maps to api/admin/attendance/teachers/[cite: 6]
      { id: 'posts', label: 'Assignments & Exams', icon: ClipboardList },    // Maps to api/admin/assignments/posts/ & exams/posts/[cite: 6]
      { id: 'submissions', label: 'All Submissions', icon: FileCheck2 },  // Maps to api/admin/submissions/assignments/ & exams/[cite: 6]
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-blue-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

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