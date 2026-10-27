import React from 'react';
import { 
  Home,
  BookOpen, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  LogOut,
  BookOpenCheck,
  BarChart3,
  FileCheck 
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
      { id: 'assignments', label: 'My Assignments', icon: FileText },
      { id: 'results', label: 'My Grades', icon: GraduationCap },
    ],
    admin: [
      { id: 'overview', label: 'System Overview', icon: ShieldCheck },
      { id: 'users', label: 'Manage Users', icon: Users },
      { id: 'assignments', label: 'All Assignments', icon: FileText },
    ]
  };

  const menuItems = roleMenus[userRole] || [];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between min-h-screen p-5 border-r border-slate-200/80 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/20">
            SA
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-slate-900">SmartAcademic</h1>
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
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}