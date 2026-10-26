import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";

function App() {
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
    <>
    <div>

      <Sidebar 
        userRole={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
    </div>

    </>
  )
}

export default App
