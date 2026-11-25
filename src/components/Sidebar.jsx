import React, { useEffect, useState } from 'react';
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
  Award,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar({ userRole, baseRole, activeTab, setActiveTab, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      { id: 'reports', label: 'Report Forms', icon: Award },
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
    parent: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'Report Card', icon: Award },
      { id: 'marks', label: 'Term & Exam Marks', icon: ClipboardList },
      { id: 'submissions', label: 'Submissions & Feedback', icon: FileCheck },
    ],
    admin: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'overview', label: 'System Overview', icon: ShieldCheck },
      { id: 'classrooms', label: 'Manage Classrooms', icon: Building2 },
      { id: 'students', label: 'Manage Students', icon: Users },
      { id: 'teachers', label: 'Manage Teachers', icon: UserCheck },
      { id: 'parents', label: 'Manage Parents', icon: Users },
      { id: 'attendance', label: 'Teacher Attendance', icon: MapPin },
    ],
  };

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentSubRoute = pathSegments[3];

    if (currentSubRoute && typeof setActiveTab === 'function') {
      setActiveTab(currentSubRoute);
    } else if (
      location.pathname === `/dashboard/${userRole}` ||
      location.pathname === `/dashboard/${userRole}/`
    ) {
      if (typeof setActiveTab === 'function') {
        setActiveTab('overview');
      }
      navigate(`/dashboard/${userRole}/overview`, { replace: true });
    }
  }, [location.pathname, userRole, navigate, setActiveTab]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/signin');
  };

  const menuItems = roleMenus[userRole] || [];

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      {/* Mobile top bar (hidden on lg+) */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 border-b border-[#c77dff]/30 shadow-lg"
        style={{ backgroundColor: '#10002b', color: '#ffffff' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-xs text-[#10002b] ring-2 ring-[#c77dff]"
            style={{ backgroundColor: '#c77dff' }}
          >
            SA
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight text-white truncate">
              Smart<span className="text-[#c77dff]">Academic</span>
            </h1>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#c77dff] truncate">
              {userRole} Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="p-2 -mr-2 rounded-lg text-white hover:bg-[#c77dff]/20 transition-colors cursor-pointer"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-dvh overflow-y-auto flex flex-col justify-between p-4
          border-r border-[#c77dff]/30 shadow-xl font-sans
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:z-auto`}
        style={{ backgroundColor: '#10002b', color: '#ffffff' }}
      >
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-3 px-2 py-2 border-b border-[#c77dff]/30">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-[#10002b] shadow-lg shadow-[#c77dff]/20 ring-2 ring-[#c77dff]"
                style={{ backgroundColor: '#c77dff' }}
              >
                SA
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base leading-tight text-white">
                  Smart<span className="text-[#c77dff]">Academic</span>
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c77dff]">
                  {userRole} Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-lg text-white hover:bg-[#c77dff]/20 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
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
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 cursor-pointer rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#c77dff] text-[#10002b] shadow-lg shadow-[#c77dff]/30 font-black'
                      : 'text-gray-200 hover:text-[#c77dff] hover:bg-[#c77dff]/10'
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${isActive ? 'text-[#10002b]' : 'text-[#c77dff]'}`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Container: Sign Out */}
        <div className="space-y-2 mt-6 pb-2">
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
    </>
  );
}