import React from 'react';
import { 
  BookOpen, 
  FileText, 
  MapPin, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  LogOut,
  HomeIcon 
} from 'lucide-react';

export default function Sidebar({ userRole, activeTab, setActiveTab, onLogout }) {
  // Define navigation items per role
  const roleMenus = {
    teacher: [
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'assignments', label: 'Post Assignments', icon: FileText },
      { id: 'attendance', label: 'Geo Attendance', icon: MapPin },
    ],
    student: [
      { id: 'overview', label: 'Overview', icon: BookOpen },
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
    <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between min-h-screen p-4 border-r border-slate-200 shadow-sm">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/20">
            SA
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">SmartAcademic</h1>
            <span className="text-xs text-blue-600 font-semibold capitalize">{userRole} Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}