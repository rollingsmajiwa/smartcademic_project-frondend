import React, { useEffect } from 'react';
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
  FileCheck 
} from 'lucide-react';

export default function Sidebar({ userRole, baseRole, activeTab, setActiveTab, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const roleMenus = {
    teacher: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'Overview Dashboard', icon: BookOpen },
      { id: 'revisions', label: 'Revision Materials', icon: BookOpenCheck },
      { id: 'assignments', label: 'Assignments Hub', icon: FileText },
      { id: 'exams', label: 'Exams Manager', icon: GraduationCap },
      { id: 'submissions', label: 'Submissions & Grading', icon: FileCheck },
      { id: 'marks', label: 'Class Marks Grid', icon: ClipboardList },      
      { id: 'analysis', label: 'Class Analysis Report', icon: BarChart3 },
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3 },
      { id: 'attendance', label: 'Geo Attendance', icon: MapPin },
    ],
    student: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'Student Overview', icon: BookOpen },
      { id: 'materials', label: 'Revision Materials', icon: BookOpenCheck },
      { id: 'assignments', label: 'My Assignments', icon: FileText },         
      { id: 'exams', label: 'Exams Portal', icon: GraduationCap },          
      { id: 'results', label: 'Submissions & Grades', icon: CheckCircle2 }, 
    ],
    admin: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'System Overview', icon: ShieldCheck },
      { id: 'classrooms', label: 'Manage Classrooms', icon: Building2 },    
      { id: 'students', label: 'Manage Students', icon: Users },             
      { id: 'teachers', label: 'Manage Teachers', icon: UserCheck },         
      { id: 'attendance', label: 'Teacher Attendance', icon: MapPin },      
    ]
  };

  // Automatically sync activeTab based on the URL path safely
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentSubRoute = pathSegments[3]; 

    if (currentSubRoute && typeof setActiveTab === 'function') {
      setActiveTab(currentSubRoute);
    } else if (location.pathname === `/dashboard/${userRole}` || location.pathname === `/dashboard/${userRole}/`) {
      if (typeof setActiveTab === 'function') {
        setActiveTab('overview');
      }
      navigate(`/dashboard/${userRole}/overview`, { replace: true });
    }
  }, [location.pathname, userRole, navigate, setActiveTab]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/signin');
  };

  const menuItems = roleMenus[userRole] || [];

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <aside 
      className="w-64 h-screen sticky top-0 flex flex-col justify-between p-4 border-r border-[#c77dff]/30 shadow-xl font-sans" 
      style={{ backgroundColor: '#10002b', color: '#ffffff' }}
    >
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-[#c77dff]/30">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-[#10002b] shadow-lg shadow-[#c77dff]/20 ring-2 ring-[#c77dff]" 
            style={{ backgroundColor: '#c77dff' }}
          >
            SA
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-white">Smart<span className="text-[#c77dff]">Academic</span></h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c77dff]">{userRole} Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
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
                    if (typeof setActiveTab === 'function') {
                      setActiveTab(tab.id);
                    }
                    navigate(`/dashboard/${userRole}/${tab.id}`);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#c77dff] text-[#10002b] shadow-lg shadow-[#c77dff]/30 font-black' 
                    : 'text-gray-200 hover:text-[#c77dff] hover:bg-[#c77dff]/10'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#10002b]' : 'text-[#c77dff]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Container: Sign Out */}
      <div className="space-y-2 mt-auto pb-2">
        <div className="pt-2 border-t border-[#c77dff]/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}