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
    <div className="flex-1 p-8 overflow-y-auto min-h-screen bg-white">
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          <h2 className="text-xl font-bold">Admin Central Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase text-gray-500">Teachers</p>
              <p className="text-xl font-extrabold mt-1">{teachers.length}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase text-gray-500">Students</p>
              <p className="text-xl font-extrabold mt-1">{students.length}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase text-gray-500">Classrooms</p>
              <p className="text-xl font-extrabold mt-1">{classrooms.length}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase text-gray-500">Weekly Attendance Logs</p>
              <p className="text-xl font-extrabold mt-1">{filterWeeklyLogs(attendanceLogs).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Teachers CRUD Management Tab */}
      {activeTab === 'teachers' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Manage Teachers</h2>
            <button
              onClick={() => openCreateModal('teacher')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border text-black"
            >
              Add New Teacher
            </button>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-bold">TSC Number</th>
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-3 font-mono">{t.tsc_number || t.id}</td>
                    <td className="p-3 font-bold">{t.name || `${t.first_name || ''} ${t.last_name || ''}`}</td>
                    <td className="p-3">{t.email || t.username}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(t, 'teacher')}
                        className="px-3 py-1 text-[10px] rounded border font-semibold hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(t.id, 'teacher')}
                        className="px-3 py-1 text-[10px] rounded border font-semibold"
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

      {/* Students CRUD Management Tab */}
      {activeTab === 'students' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Manage Students</h2>
            <button
              onClick={() => openCreateModal('student')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border text-black"
            >
                Add New Student
            </button>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-bold">Student ID</th>
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3 font-mono">{s.student_id_number || s.id}</td>
                    <td className="p-3 font-bold">{s.name || `${s.first_name || ''} ${s.last_name || ''}`}</td>
                    <td className="p-3">{s.email || s.username}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s, 'student')}
                        className="px-3 py-1 text-[10px] rounded border font-semibold hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(s.id, 'student')}
                        className="px-3 py-1 text-[10px] rounded border font-semibold"
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

      {/* Weekly Teacher Geofence Attendance Logs (Monday - Friday) */}
      {activeTab === 'attendance' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-lg font-bold">Weekly Teacher Attendance Logs (Mon - Fri)</h2>
          <div className="border rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-bold">Teacher ID</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Day of Week</th>
                  <th className="p-3 font-bold">Exact Time</th>
                </tr>
              </thead>
              <tbody>
                {filterWeeklyLogs(attendanceLogs).map((att, idx) => {
                  const dateObj = att.timestamp ? new Date(att.timestamp) : new Date();
                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-3 font-mono font-bold">{att.tsc_number || att.teacher}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${att.direction === 'in' ? 'bg-white text-black' : 'bg-white text-black'}`}>
                          Clocked In {att.direction}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="p-3 font-mono opacity-80">
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

      {/* Shared Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-md">
              {modalMode === 'create' ? `Add New ${userRoleType}` : `Edit ${userRoleType}`}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2.5 rounded-xl border"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border"
              />
              {modalMode === 'create' && (
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl border"
                  required
                />
              )}
              {userRoleType === 'teacher' ? (
                <input
                  type="text"
                  placeholder="TSC Number"
                  value={formData.tsc_number}
                  onChange={(e) => setFormData({ ...formData, tsc_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Student ID Number"
                  value={formData.student_id_number}
                  onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border"
                />
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-black font-semibold rounded-xl"
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