import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/teachers')) return 'teachers';
    if (path.includes('/students')) return 'students';
    if (path.includes('/classrooms')) return 'classrooms';
    if (path.includes('/attendance')) return 'attendance';
    if (path.includes('/submissions')) return 'submissions';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Data States
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [assignmentSubs, setAssignmentSubs] = useState([]);
  const [examSubs, setExamSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form & Modal States (Create / Update)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [userRoleType, setUserRoleType] = useState('teacher'); // 'teacher' or 'student'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    tsc_number: '',
    student_id_number: ''
  });

  const apiConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  };

  // Fetch all administrative data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        teachersRes,
        studentsRes,
        classRes,
        attRes,
        asSubRes,
        exSubRes
      ] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/users/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/teachers/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/students/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/classrooms/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/attendance/teachers/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/assignments/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/exams/', apiConfig),
      ]);

      setUsers(usersRes.data);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
      setClassrooms(classRes.data);
      setAttendanceLogs(attRes.data);
      setAssignmentSubs(asSubRes.data);
      setExamSubs(exSubRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, location.pathname]);

  // Open modal for Create or Edit
  const openCreateModal = (role) => {
    setUserRoleType(role);
    setModalMode('create');
    setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', tsc_number: '', student_id_number: '' });
    setShowModal(true);
  };

  const openEditModal = (userObj, role) => {
    setUserRoleType(role);
    setModalMode('edit');
    setSelectedUserId(userObj.id);
    setFormData({
      username: userObj.username || '',
      email: userObj.email || '',
      password: '',
      first_name: userObj.first_name || '',
      last_name: userObj.last_name || '',
      tsc_number: userObj.tsc_number || '',
      student_id_number: userObj.student_id_number || ''
    });
    setShowModal(true);
  };

  // Submit Handler for Add / Update Teacher or Student
  const handleSaveUser = async (e) => {
    e.preventDefault();
    const endpoint = userRoleType === 'teacher' 
      ? 'http://127.0.0.1:8000/api/admin/teachers/' 
      : 'http://127.0.0.1:8000/api/admin/students/';

    try {
      if (modalMode === 'create') {
        await axios.post(endpoint, formData, apiConfig);
        alert(`${userRoleType === 'teacher' ? 'Teacher' : 'Student'} created successfully!`);
      } else {
        await axios.patch(`${endpoint}${selectedUserId}/`, formData, apiConfig);
        alert(`${userRoleType === 'teacher' ? 'Teacher' : 'Student'} updated successfully!`);
      }
      setShowModal(false);
      fetchAdminData();
    } catch (err) {
      console.error('Save failed:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Action failed.');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    const endpoint = role === 'teacher' 
      ? `http://127.0.0.1:8000/api/admin/teachers/${userId}/` 
      : `http://127.0.0.1:8000/api/admin/students/${userId}/`;

    try {
      await axios.delete(endpoint, apiConfig);
      alert(`${role} deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error(`Delete failed:`, err);
      alert(`Failed to delete ${role}.`);
    }
  };

  // Weekly Filter (Monday to Friday Logs)
  const filterWeeklyLogs = (logs) => {
    return logs.filter(log => {
      if (!log.timestamp) return true;
      const day = new Date(log.timestamp).getDay();
      return day >= 1 && day <= 5; // 1 = Mon, 5 = Fri
    });
  };

 return (
  <div className="w-full min-h-screen p-6 lg:p-8 space-y-6 font-sans max-w-5xl mx-auto" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>
    
    {/* OVERVIEW TAB */}
    {activeTab === 'overview' && (
      <div className="space-y-6 w-full">
        {/* Banner Header */}
        <div className="sa-banner sa-flex-between border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <div>
            <span 
              className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider bg-white border-[#c77dff] text-[#10002b]"
            >
              System Administrator Portal
            </span>
            <h1 className="text-xl font-extrabold mt-2 text-[#10002b]">Admin Central Overview</h1>
            <p className="text-xs mt-1 text-[#10002b]/70">
              Manage system users, classrooms, and monitor real-time weekly teacher attendance.
            </p>
          </div>
        </div>
        
        {/* Stat Cards Grid - 4 Columns */}
        <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Teachers</p>
            <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{teachers.length}</p>
          </div>
          <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Students</p>
            <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{students.length}</p>
          </div>
          <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Classrooms</p>
            <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{classrooms.length}</p>
          </div>
          <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Weekly Attendance Logs</p>
            <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">
              {filterWeeklyLogs(attendanceLogs).length}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* TEACHERS CRUD MANAGEMENT TAB */}
    {activeTab === 'teachers' && (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-extrabold text-[#10002b]">Manage Teachers</h2>
          <button
            onClick={() => openCreateModal('teacher')}
            className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
          >
             Add New Teacher
          </button>
        </div>

        <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-hidden w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <table className="sa-table w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">TSC Number</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Name</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Email / Username</th>
                <th className="p-4 text-right bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c77dff]/40">
              {teachers.map((t) => (
                <tr key={t.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#10002b]">{t.tsc_number || t.id}</td>
                  <td className="p-4 font-bold text-[#10002b]">{t.name || `${t.first_name || ''} ${t.last_name || ''}`}</td>
                  <td className="p-4 text-[#10002b]/80">{t.email || t.username}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(t, 'teacher')}
                      className="sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(t.id, 'teacher')}
                      className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* STUDENTS CRUD MANAGEMENT TAB */}
    {activeTab === 'students' && (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-extrabold text-[#10002b]">Manage Students</h2>
          <button
            onClick={() => openCreateModal('student')}
            className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
          >
            Add New Student
          </button>
        </div>

        <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-hidden w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <table className="sa-table w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Student ID</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Name</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Email / Username</th>
                <th className="p-4 text-right bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c77dff]/40">
              {students.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#10002b]">{s.student_id_number || s.id}</td>
                  <td className="p-4 font-bold text-[#10002b]">{s.name || `${s.first_name || ''} ${s.last_name || ''}`}</td>
                  <td className="p-4 text-[#10002b]/80">{s.email || s.username}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(s, 'student')}
                      className="sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(s.id, 'student')}
                      className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* WEEKLY TEACHER GEOFENCE ATTENDANCE LOGS (MONDAY - FRIDAY) */}
    {activeTab === 'attendance' && (
      <div className="w-full space-y-6">
        <h2 className="text-lg font-extrabold text-[#10002b]">Weekly Teacher Attendance Logs (Mon - Fri)</h2>
        <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-hidden w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <table className="sa-table w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Teacher ID</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Day of Week</th>
                <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Exact Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c77dff]/40">
              {filterWeeklyLogs(attendanceLogs).map((att, idx) => {
                const dateObj = att.timestamp ? new Date(att.timestamp) : new Date();
                return (
                  <tr key={idx} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#10002b]">{att.tsc_number || att.teacher}</td>
                    <td className="p-4">
                      <span 
                        className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border bg-[#10002b] text-[#c77dff] border-[#10002b]"
                      >
                        Clocked In {att.direction}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#10002b]">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="p-4 font-mono text-[#10002b]/70">
                      {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({dateObj.toLocaleDateString()})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* SHARED CREATE/EDIT MODAL */}
    {showModal && (
      <div className="fixed inset-0 bg-[#10002b]/50 backdrop-blur-xs flex justify-center items-center p-4 z-50">
        <div className="sa-card max-w-md w-full space-y-4 shadow-xl border border-[#c77dff] p-6 rounded-2xl" style={{ backgroundColor: 'var(--sa-surface)' }}>
          <h3 className="font-extrabold text-base text-[#10002b]">
            {modalMode === 'create' ? `Add New ${userRoleType}` : `Edit ${userRoleType}`}
          </h3>
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1.5 text-[#10002b]">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1.5 text-[#10002b]">Email Address</label>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
              />
            </div>
            {modalMode === 'create' && (
              <div>
                <label className="block font-bold mb-1.5 text-[#10002b]">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                  required
                />
              </div>
            )}
            {userRoleType === 'teacher' ? (
              <div>
                <label className="block font-bold mb-1.5 text-[#10002b]">TSC Number</label>
                <input
                  type="text"
                  placeholder="TSC Number"
                  value={formData.tsc_number}
                  onChange={(e) => setFormData({ ...formData, tsc_number: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b] font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold mb-1.5 text-[#10002b]">Student ID Number</label>
                <input
                  type="text"
                  placeholder="Student ID Number"
                  value={formData.student_id_number}
                  onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b] font-mono"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sa-btn-primary py-2.5 px-5 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

</div>
);
}