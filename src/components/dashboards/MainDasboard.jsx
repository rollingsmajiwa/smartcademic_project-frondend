import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

function MainDashboard() {
  //  userRole tracks who is logged in ('teacher', 'student', or 'admin')
  const [userRole, setUserRole] = useState('teacher'); 
  
  //  activeTab tracks which menu link is currently selected
  const [activeTab, setActiveTab] = useState('overview'); 

  //  onLogout is a function handler for signing out
  const handleLogout = () => {
    alert('Logged out successfully!');
    // Here you would clear tokens and redirect to login

    // fetch assignment metadata from backend
    
  };
  

  return (
    <div className="flex bg-blue-50 text-blue-800 min-h-screen">
      <Sidebar 
        userRole={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => alert('Logged out')} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Role Switcher Toolbar */}
        <div className="flex justify-end mb-6">
          <div className="bg-white border border-blue-300-200 shadow-sm p-1 rounded-xl flex items-center gap-1">
            {['teacher', 'student', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => { setUserRole(role); setActiveTab('overview'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  userRole === role ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:text-blue-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

       
      </main>
    </div>
  );
}
export default MainDashboard
