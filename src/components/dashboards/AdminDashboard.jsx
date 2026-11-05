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
  <div className="w-full min-h-screen p-6 lg:p-8 space-y-6 font-sans" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>
    
    {/* OVERVIEW TAB */}
    {activeTab === 'overview' && (
      <div className="space-y-6 w-full">
        {/* Banner Header */}
        <div className="sa-banner sa-flex-between bg-[#dff8eb] border border-[#cdcdcd] shadow-xs">
          <div>
            <span 
              className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider bg-white border-[#cdcdcd] text-[#214e34]"
            >
              System Administrator Portal
            </span>
            <h1 className="text-2xl font-extrabold mt-2 text-[#011638]">Admin Central Overview</h1>
            <p className="text-xs mt-1 text-[#364156]">
              Manage system users, classrooms, and monitor real-time weekly teacher attendance.
            </p>
          </div>
        </div>
        
        {/* Stat Cards Grid */}
        <div className="sa-grid">
          <div className="sa-card bg-[#dff8eb] border border-[#cdcdcd] shadow-xs">
            <p className="sa-card-title text-[#214e34]">Teachers</p>
            <p className="sa-card-value text-[#011638]">{teachers.length}</p>
          </div>
          <div className="sa-card bg-[#dff8eb] border border-[#cdcdcd] shadow-xs">
            <p className="sa-card-title text-[#214e34]">Students</p>
            <p className="sa-card-value text-[#011638]">{students.length}</p>
          </div>
          <div className="sa-card bg-[#dff8eb] border border-[#cdcdcd] shadow-xs">
            <p className="sa-card-title text-[#214e34]">Classrooms</p>
            <p className="sa-card-value text-[#011638]">{classrooms.length}</p>
          </div>
          <div className="sa-card bg-[#dff8eb] border border-[#cdcdcd] shadow-xs">
            <p className="sa-card-title text-[#214e34]">Weekly Attendance Logs</p>
            <p className="sa-card-value text-[#214e34]">
              {filterWeeklyLogs(attendanceLogs).length}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* TEACHERS CRUD MANAGEMENT TAB */}
    {activeTab === 'teachers' && (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-[#011638]">Manage Teachers</h2>
          <button
            onClick={() => openCreateModal('teacher')}
            className="sa-btn-primary bg-[#214e34] text-[#dff8eb] hover:bg-[#011638]"
          >
             Add New Teacher
          </button>
        </div>

        <div className="sa-table-wrapper border border-[#cdcdcd] shadow-xs">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="p-4 bg-[#364156] text-white">TSC Number</th>
                <th className="p-4 bg-[#364156] text-white">Name</th>
                <th className="p-4 bg-[#364156] text-white">Email / Username</th>
                <th className="p-4 text-right bg-[#364156] text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cdcdcd]">
              {teachers.map((t) => (
                <tr key={t.id} className="bg-white hover:bg-[#dff8eb]/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#011638]">{t.tsc_number || t.id}</td>
                  <td className="p-4 font-bold text-[#011638]">{t.name || `${t.first_name || ''} ${t.last_name || ''}`}</td>
                  <td className="p-4 text-[#364156]">{t.email || t.username}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(t, 'teacher')}
                      className="sa-btn-secondary py-1 px-3 text-[11px] bg-[#364156] text-white border border-[#364156] hover:bg-[#011638]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(t.id, 'teacher')}
                      className="py-1 px-3 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-[#011638]">Manage Students</h2>
          <button
            onClick={() => openCreateModal('student')}
            className="sa-btn-primary bg-[#214e34] text-[#dff8eb] hover:bg-[#011638]"
          >
            Add New Student
          </button>
        </div>

        <div className="sa-table-wrapper border border-[#cdcdcd] shadow-xs">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="p-4 bg-[#364156] text-white">Student ID</th>
                <th className="p-4 bg-[#364156] text-white">Name</th>
                <th className="p-4 bg-[#364156] text-white">Email / Username</th>
                <th className="p-4 text-right bg-[#364156] text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cdcdcd]">
              {students.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-[#dff8eb]/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#011638]">{s.student_id_number || s.id}</td>
                  <td className="p-4 font-bold text-[#011638]">{s.name || `${s.first_name || ''} ${s.last_name || ''}`}</td>
                  <td className="p-4 text-[#364156]">{s.email || s.username}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(s, 'student')}
                      className="sa-btn-secondary py-1 px-3 text-[11px] bg-[#364156] text-white border border-[#364156] hover:bg-[#011638]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(s.id, 'student')}
                      className="py-1 px-3 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
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
        <h2 className="text-lg font-extrabold text-[#011638]">Weekly Teacher Attendance Logs (Mon - Fri)</h2>
        <div className="sa-table-wrapper border border-[#cdcdcd] shadow-xs">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="p-4 bg-[#364156] text-white">Teacher ID</th>
                <th className="p-4 bg-[#364156] text-white">Status</th>
                <th className="p-4 bg-[#364156] text-white">Day of Week</th>
                <th className="p-4 bg-[#364156] text-white">Exact Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cdcdcd]">
              {filterWeeklyLogs(attendanceLogs).map((att, idx) => {
                const dateObj = att.timestamp ? new Date(att.timestamp) : new Date();
                return (
                  <tr key={idx} className="bg-white hover:bg-[#dff8eb]/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#011638]">{att.tsc_number || att.teacher}</td>
                    <td className="p-4">
                      <span 
                        className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border bg-[#214e34] text-[#dff8eb] border-[#214e34]"
                      >
                        Clocked In {att.direction}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#011638]">
                      {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="p-4 font-mono text-[#364156]">
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
      <div className="fixed inset-0 bg-[#011638]/50 backdrop-blur-xs flex justify-center items-center p-4 z-50">
        <div className="sa-card max-w-md w-full space-y-4 shadow-xl border border-[#cdcdcd] bg-[#dff8eb]">
          <h3 className="font-extrabold text-base text-[#011638]">
            {modalMode === 'create' ? `Add New ${userRoleType}` : `Edit ${userRoleType}`}
          </h3>
          <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[#011638]">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#cdcdcd] bg-white text-[#011638] focus:outline-none focus:border-[#214e34]"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[#011638]">Email Address</label>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#cdcdcd] bg-white text-[#011638] focus:outline-none focus:border-[#214e34]"
              />
            </div>
            {modalMode === 'create' && (
              <div>
                <label className="block font-bold mb-1 text-[#011638]">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#cdcdcd] bg-white text-[#011638] focus:outline-none focus:border-[#214e34]"
                  required
                />
              </div>
            )}
            {userRoleType === 'teacher' ? (
              <div>
                <label className="block font-bold mb-1 text-[#011638]">TSC Number</label>
                <input
                  type="text"
                  placeholder="TSC Number"
                  value={formData.tsc_number}
                  onChange={(e) => setFormData({ ...formData, tsc_number: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#cdcdcd] bg-white text-[#011638] focus:outline-none focus:border-[#214e34] font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold mb-1 text-[#011638]">Student ID Number</label>
                <input
                  type="text"
                  placeholder="Student ID Number"
                  value={formData.student_id_number}
                  onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#cdcdcd] bg-white text-[#011638] focus:outline-none focus:border-[#214e34] font-mono"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="sa-btn-secondary py-2 px-4 bg-white text-[#011638] border border-[#cdcdcd] hover:bg-[#dff8eb]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sa-btn-primary py-2 px-5 bg-[#214e34] text-[#dff8eb] hover:bg-[#011638]"
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