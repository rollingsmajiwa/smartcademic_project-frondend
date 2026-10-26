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
    <aside >
      <div>
    
        <div>
          <div>
            SA
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SmartAcademic</h1>
            <span>{userRole} Portal</span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </aside>
  );
}