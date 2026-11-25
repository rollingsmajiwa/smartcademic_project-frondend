import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUP";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/TermsOfService";
import ProtectedRoute from "./components/ProtectedRoute";
import ParentDashboard from "./components/dashboards/ParentDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";

function DashboardRedirect() {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded?.role) {
      return <Navigate to={`/dashboard/${decoded.role}/overview`} replace />;
    }
  } catch {
    // Fall through to /signin if token is malformed or expired
  }

  return <Navigate to="/signin" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard Entry */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["parent", "student", "teacher", "admin"]}>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Parent Dashboard */}
      <Route
        path="/dashboard/parent/*"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <MainLayout userRole="parent">
              <ParentDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/dashboard/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout userRole="admin">
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Teacher & Student Dashboards (remove any that don't exist in your project) */}
      <Route
        path="/dashboard/teacher/*"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <MainLayout userRole="teacher">
              <TeacherDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MainLayout userRole="student">
              <StudentDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;