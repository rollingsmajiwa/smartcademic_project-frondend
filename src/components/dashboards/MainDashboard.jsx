import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import Sidebar from '../Sidebar';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { jwtDecode } from 'jwt-decode';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const token = localStorage.getItem('access_token');
  let userRole = 'student';
  const location = useLocation();

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role || 'student';
    } catch (e) {
      userRole = 'student';
    }
  }

  // Determine which sidebar profile/menu to display based on the active URL path
  let displayRole = userRole;
  if (location.pathname.includes('/dashboard/student')) {
    displayRole = 'student';
  } else if (location.pathname.includes('/dashboard/teacher')) {
    displayRole = 'teacher';
  } else if (location.pathname.includes('/dashboard/admin')) {
    displayRole = 'admin';
  }

  return (
    <>
      <div className='flex h-screen overflow-hidden'>
        <Sidebar 
          userRole={displayRole} 
          baseRole={userRole} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              path="student/:subpage"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/*"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Fallback redirect to overview if path is just /dashboard/role */}
            <Route 
              path="*" 
              element={<Navigate to={`/dashboard/${displayRole}/overview`} replace />} 
            />
          </Routes>
        </div>
      </div>
    </>
  );
}