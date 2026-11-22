import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import Sidebar from '../Sidebar';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { jwtDecode } from 'jwt-decode';

function resolveTabFromPath(pathname) {
  if (pathname.includes('/dashboard/teacher/reports')) return 'reports';
  if (pathname.includes('/dashboard/teacher/submissions')) return 'submissions';
  if (pathname.includes('/dashboard/teacher/revisions')) return 'revisions';
  if (pathname.includes('/dashboard/teacher/overview')) return 'overview';
  return null;
}

export default function MainDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('access_token');
  let userRole = 'student';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role || 'student';
    } catch {
      userRole = 'student';
    }
  }

  let displayRole = userRole;
  if (location.pathname.includes('/dashboard/student')) {
    displayRole = 'student';
  } else if (location.pathname.includes('/dashboard/teacher')) {
    displayRole = 'teacher';
  } else if (location.pathname.includes('/dashboard/admin')) {
    displayRole = 'admin';
  }

  useEffect(() => {
    const matchedTab = resolveTabFromPath(location.pathname);
    if (matchedTab) {
      setActiveTab(matchedTab);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
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

          {/* Dedicated Teacher Report Forms Route */}
          <Route
            path="teacher/reports"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard
                  token={token}
                  activeTab="reports"
                  setActiveTab={setActiveTab}
                />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Teacher Routes (Overview, Submissions, Revisions, etc.) */}
          <Route
            path="teacher/*"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard
                  token={token}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
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

          <Route
            path="*"
            element={<Navigate to={`/dashboard/${displayRole}/overview`} replace />}
          />
        </Routes>
      </div>
    </div>
  );
}