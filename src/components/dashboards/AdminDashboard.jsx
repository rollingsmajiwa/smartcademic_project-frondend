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

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [userRoleType, setUserRoleType] = useState('teacher');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    raw_password: '',
    first_name: '',
    surname: '',
    last_name: '',
    tsc_number: '',
    admission_number: '',
    gender: 'Male',
    classroom: '',
    date_admitted: new Date().toISOString().split('T')[0],
    date_joined: new Date().toISOString().split('T')[0],
    name: '',
    teacher: ''
  });

  const apiConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  };

  const getDisplayName = (obj) => {
    if (!obj) return 'Unassigned';
    if (typeof obj === 'string') return obj;
    const first = obj.first_name || obj.user?.first_name || '';
    const middle = obj.surname || '';
    const last = obj.last_name || obj.user?.last_name || '';
    const combined = `${first} ${middle} ${last}`.trim();
    if (combined) return combined;
    if (obj.name && obj.name.trim() !== '') return obj.name;
    return obj.username || obj.user?.username || `ID: ${obj.id}`;
  };

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
        axios.get('http://127.0.0.1:8000/api/admin/users/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/teachers/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/students/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/classrooms/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/attendance/teachers/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/assignments/', apiConfig).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/exams/', apiConfig).catch(() => ({ data: [] })),
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

  const openCreateModal = (role) => {
    setUserRoleType(role);
    setModalMode('create');
    setFormData({
      username: '',
      email: '',
      password: '',
      raw_password: '',
      first_name: '',
      surname: '',
      last_name: '',
      tsc_number: '',
      admission_number: '',
      gender: 'Male',
      classroom: '',
      date_admitted: new Date().toISOString().split('T')[0],
      date_joined: new Date().toISOString().split('T')[0],
      name: '',
      teacher: ''
    });
    setShowModal(true);
  };

  const openEditModal = (obj, role) => {
    setUserRoleType(role);
    setModalMode('edit');
    setSelectedUserId(obj.id);
    
    let currentTeacherId = '';
    if (obj.teacher) {
      currentTeacherId = typeof obj.teacher === 'object' ? obj.teacher.id : obj.teacher;
    } else if (obj.teacher_id) {
      currentTeacherId = obj.teacher_id;
    }

    let currentClassroomId = '';
    if (obj.classroom) {
      currentClassroomId = typeof obj.classroom === 'object' ? obj.classroom.id : obj.classroom;
    }

    setFormData({
      username: obj.username || obj.user?.username || '',
      email: obj.email || obj.user?.email || '',
      password: '',
      raw_password: obj.raw_password || '',
      first_name: obj.first_name || obj.user?.first_name || '',
      surname: obj.surname || '',
      last_name: obj.last_name || obj.user?.last_name || '',
      tsc_number: obj.tsc_number || '',
      admission_number: obj.admission_number || '',
      gender: obj.gender || 'Male',
      classroom: currentClassroomId,
      date_admitted: obj.date_admitted ? obj.date_admitted.split('T')[0] : new Date().toISOString().split('T')[0],
      date_joined: obj.date_joined ? obj.date_joined.split('T')[0] : new Date().toISOString().split('T')[0],
      name: obj.name || obj.class_name || '',
      teacher: currentTeacherId
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    let endpoint = 'http://127.0.0.1:8000/api/admin/teachers/';
    if (userRoleType === 'student') endpoint = 'http://127.0.0.1:8000/api/admin/students/';
    if (userRoleType === 'classroom') endpoint = 'http://127.0.0.1:8000/api/admin/classrooms/';

    try {
      if (modalMode === 'create') {
        await axios.post(endpoint, formData, apiConfig);
        alert(`${userRoleType.charAt(0).toUpperCase() + userRoleType.slice(1)} created successfully!`);
      } else {
        await axios.patch(`${endpoint}${selectedUserId}/`, formData, apiConfig);
        alert(`${userRoleType.charAt(0).toUpperCase() + userRoleType.slice(1)} updated successfully!`);
      }
      setShowModal(false);
      fetchAdminData();
    } catch (err) {
      console.error('Save failed:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Action failed.');
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    let endpoint = `http://127.0.0.1:8000/api/admin/teachers/${id}/`;
    if (role === 'student') endpoint = `http://127.0.0.1:8000/api/admin/students/${id}/`;
    if (role === 'classroom') endpoint = `http://127.0.0.1:8000/api/admin/classrooms/${id}/`;

    try {
      await axios.delete(endpoint, apiConfig);
      alert(`${role} deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error(`Delete failed:`, err);
      alert(`Failed to delete ${role}.`);
    }
  };

  const filterWeeklyLogs = (logs) => {
    return logs.filter(log => {
      if (!log.timestamp) return true;
      const day = new Date(log.timestamp).getDay();
      return day >= 1 && day <= 5;
    });
  };

  return (
    <div className="w-full min-h-screen p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>
      
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full">
          <div className="sa-banner sa-flex-between border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider bg-white border-[#c77dff] text-[#10002b]">
                System Administrator Portal
              </span>
              <h1 className="text-xl font-extrabold mt-2 text-[#10002b]">Admin Central Overview</h1>
              <p className="text-xs mt-1 text-[#10002b]/70">
                Manage system users, classrooms, and monitor real-time weekly teacher attendance.
              </p>
            </div>
          </div>
          
          <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div 
              onClick={() => window.location.href = '/admin/teachers'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Teachers</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{teachers.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/students'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Students</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{students.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/classrooms'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Classrooms</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{classrooms.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/attendance'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
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
              type="button"
              onClick={() => openCreateModal('teacher')}
              className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
            >
               Add New Teacher
            </button>
          </div>

          <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-x-auto w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">TSC Number</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Name (First, Surname, Last)</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Username</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Email</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Password</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Gender</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Date Joined</th>
                  <th className="p-4 text-right bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-[#10002b]/70 bg-white">No teachers registered yet.</td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#10002b]">{t.tsc_number || t.id}</td>
                      <td className="p-4 font-bold text-[#10002b]">
                        {t.first_name || t.user?.first_name || ''} {t.surname ? `, ${t.surname}` : ''} {t.last_name || t.user?.last_name || ''}
                      </td>
                      <td className="p-4 font-mono text-[#10002b]">{t.username || t.user?.username || 'N/A'}</td>
                      <td className="p-4 text-[#10002b]/80">{t.email || t.user?.email || 'N/A'}</td>
                      <td className="p-4 font-mono text-[#10002b]/80">{t.raw_password || t.password || '••••••••'}</td>
                      <td className="p-4 text-[#10002b]">{t.gender || 'N/A'}</td>
                      <td className="p-4 text-[#10002b]/80 font-mono">
                        {t.date_joined ? new Date(t.date_joined).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(t, 'teacher')}
                          className="sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(t.id, 'teacher')}
                          className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
              type="button"
              onClick={() => openCreateModal('student')}
              className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
            >
              Add New Student
            </button>
          </div>

          <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-x-auto w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Admission No.</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Name (First, Surname, Last)</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Username</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Password</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Gender</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Classroom</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Date Admitted</th>
                  <th className="p-4 text-right bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-[#10002b]/70 bg-white">No students registered yet.</td>
                  </tr>
                ) : (
                  students.map((s) => {
                    let assignedClass = s.classroom_name || 'Unassigned';
                    if (assignedClass === 'Unassigned' && s.classroom) {
                      if (typeof s.classroom === 'object') {
                        assignedClass = s.classroom.name;
                      } else {
                        const found = classrooms.find(c => c.id === Number(s.classroom));
                        if (found) assignedClass = found.name;
                      }
                    }

                    return (
                      <tr key={s.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#10002b]">{s.admission_number || s.id}</td>
                        <td className="p-4 font-bold text-[#10002b]">
                          {s.first_name || s.user?.first_name || ''} {s.surname ? `, ${s.surname}` : ''} {s.last_name || s.user?.last_name || ''}
                        </td>
                        <td className="p-4 font-mono text-[#10002b]">{s.username || s.user?.username || 'N/A'}</td>
                        <td className="p-4 font-mono text-[#10002b]/80">{s.raw_password || s.password || '••••••••'}</td>
                        <td className="p-4 text-[#10002b]">{s.gender || 'N/A'}</td>
                        <td className="p-4 text-[#10002b] font-semibold">{assignedClass}</td>
                        <td className="p-4 text-[#10002b]/80 font-mono">
                          {s.date_admitted ? new Date(s.date_admitted).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(s, 'student')}
                            className="sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(s.id, 'student')}
                            className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASSROOMS CRUD MANAGEMENT TAB */}
      {activeTab === 'classrooms' && (
        <div className="w-full space-y-6">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">Manage Classrooms</h2>
            <button
              type="button"
              onClick={() => openCreateModal('classroom')}
              className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
            >
              Add New Classroom
            </button>
          </div>

          <div className="sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-hidden w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Classroom ID</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Class Name</th>
                  <th className="p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Assigned Teacher</th>
                  <th className="p-4 text-right bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {classrooms.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-[#10002b]/70 bg-white">No classrooms configured yet.</td>
                  </tr>
                ) : (
                  classrooms.map((c) => {
                    let assignedTeacherName = c.teacher_name || 'Unassigned';
                    if (assignedTeacherName === 'Unassigned' && c.teacher) {
                      if (typeof c.teacher === 'object') {
                        assignedTeacherName = getDisplayName(c.teacher);
                      } else {
                        const foundTeacher = teachers.find((t) => t.id === c.teacher || t.id === Number(c.teacher));
                        assignedTeacherName = foundTeacher ? getDisplayName(foundTeacher) : `Teacher ID: ${c.teacher}`;
                      }
                    }

                    return (
                      <tr key={c.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#10002b]">{c.id}</td>
                        <td className="p-4 font-bold text-[#10002b]">{c.name || c.class_name}</td>
                        <td className="p-4 text-[#10002b]/80">{assignedTeacherName}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c, 'classroom')}
                            className="sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(c.id, 'classroom')}
                            className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WEEKLY TEACHER GEOFENCE ATTENDANCE LOGS */}
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
                {filterWeeklyLogs(attendanceLogs).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-[#10002b]/70 bg-white">No attendance logs found.</td>
                  </tr>
                ) : (
                  filterWeeklyLogs(attendanceLogs).map((att, idx) => {
                    const dateObj = att.timestamp ? new Date(att.timestamp) : new Date();
                    return (
                      <tr key={idx} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#10002b]">{att.tsc_number || att.teacher}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border bg-[#10002b] text-[#c77dff] border-[#10002b]">
                            Clocked {att.direction || 'IN'}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div className="w-full space-y-6">
          <h2 className="text-lg font-extrabold text-[#10002b]">All Student Submissions</h2>
          <div className="sa-card border border-[#c77dff] p-6 rounded-2xl space-y-4 shadow-xs" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="text-xs text-[#10002b]/80">Assignment Submissions Count: <strong>{assignmentSubs.length}</strong></p>
            <p className="text-xs text-[#10002b]/80">Exam Submissions Count: <strong>{examSubs.length}</strong></p>
          </div>
        </div>
      )}

      {/* SHARED CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#10002b]/50 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="sa-card max-w-md w-full space-y-4 shadow-xl border border-[#c77dff] p-6 rounded-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <h3 className="font-extrabold text-base text-[#10002b] capitalize">
              {modalMode === 'create' ? `Add New ${userRoleType}` : `Edit ${userRoleType}`}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              
              {userRoleType === 'classroom' ? (
                <>
                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Classroom Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grade 8 Red"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Assigned Teacher</label>
                    <select
                      value={formData.teacher}
                      onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                    >
                      <option value="">Select Teacher...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {getDisplayName(t)} (TSC: {t.tsc_number || t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : userRoleType === 'teacher' ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">First Name</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Surname</label>
                      <input
                        type="text"
                        placeholder="Surname"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Last Name</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">{modalMode === 'create' ? 'Password' : 'Password (Leave blank to keep unchanged)'}</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value, raw_password: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required={modalMode === 'create'}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">TSC Number</label>
                    <input
                      type="text"
                      placeholder="TSC Number"
                      value={formData.tsc_number}
                      onChange={(e) => setFormData({ ...formData, tsc_number: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Date Joined Institution</label>
                    <input
                      type="date"
                      value={formData.date_joined}
                      onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">First Name</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Surname</label>
                      <input
                        type="text"
                        placeholder="Surname"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Last Name</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">{modalMode === 'create' ? 'Password' : 'Password (Leave blank to keep unchanged)'}</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value, raw_password: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required={modalMode === 'create'}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Admission Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-2026-001"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Date Admitted</label>
                    <input
                      type="date"
                      value={formData.date_admitted}
                      onChange={(e) => setFormData({ ...formData, date_admitted: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Classroom</label>
                      <select
                        value={formData.classroom}
                        onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                        className="w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]"
                      >
                        <option value="">Unassigned</option>
                        {classrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name || c.class_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="sa-btn-secondary py-2 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sa-btn-primary py-2 px-5 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
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