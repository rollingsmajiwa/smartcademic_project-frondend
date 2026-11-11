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

  // Invitation Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('teacher');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');

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

  // Resilient Auth Configuration helper checking both token keys
  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('access');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    };
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
        axios.get('http://127.0.0.1:8000/api/admin/users/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/teachers/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/students/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/classrooms/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/attendance/teachers/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/assignments/', getAuthConfig()).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/admin/submissions/exams/', getAuthConfig()).catch(() => ({ data: [] })),
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

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteMessage('');
    setInviteLoading(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/accounts/admin/invite/',
        { email: inviteEmail, role: inviteRole },
        getAuthConfig()
      );

      setInviteMessage(response.data.message || `Invitation successfully sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchAdminData();
    } catch (err) {
      console.error('Invite failed:', err.response?.data || err);
      setInviteError(err.response?.data?.error || 'Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    let endpoint = 'http://127.0.0.1:8000/api/admin/teachers/';
    if (userRoleType === 'student') endpoint = 'http://127.0.0.1:8000/api/admin/students/';
    if (userRoleType === 'classroom') endpoint = 'http://127.0.0.1:8000/api/admin/classrooms/';

    try {
      if (modalMode === 'create') {
        await axios.post(endpoint, formData, getAuthConfig());
        alert(`${userRoleType.charAt(0).toUpperCase() + userRoleType.slice(1)} created successfully!`);
      } else {
        await axios.patch(`${endpoint}${selectedUserId}/`, formData, getAuthConfig());
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
      await axios.delete(endpoint, getAuthConfig());
      alert(`${role} deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error(`Delete failed:`, err.response?.data || err);
      alert(`Failed to delete ${role}.`);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>
      
      {/* Top Header with Invite Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#c77dff] shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider bg-white border-[#c77dff] text-[#10002b]">
            System Administrator
          </span>
          <h1 className="text-xl font-extrabold mt-2 text-[#10002b]">SmartAcademic Management Portal</h1>
          <p className="text-xs mt-1 text-[#10002b]/70">
            Invite users via email activation link, manage classes, and monitor weekly teacher attendance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInviteError('');
            setInviteMessage('');
            setShowInviteModal(true);
          }}
          className="py-2.5 px-5 rounded-xl text-xs font-extrabold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-md"
        >
         Send User Invitation
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full">
          <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div 
              onClick={() => window.location.href = '/dashboard/admin/teachers'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Teachers</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{teachers.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/dashboard/admin/students'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Students</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{students.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/dashboard/admin/classrooms'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Classrooms</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{classrooms.length}</p>
            </div>
            <div 
              onClick={() => window.location.href = '/dashboard/admin/attendance'} 
              className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full cursor-pointer hover:border-[#10002b] transition-all" 
              style={{ backgroundColor: 'var(--sa-surface)' }}
            >
              <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Attendance Logs</p>
              <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{attendanceLogs.length}</p>
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
{activeTab === 'attendance' && (
  <div className="w-full space-y-8">
    <div className="flex justify-between items-center w-full">
      <div>
        <h2 className="text-lg font-extrabold text-[#10002b]">Teacher Attendance Tracking & Analytics</h2>
        <p className="text-xs text-[#10002b]/70 mt-0.5">
          Evaluated against {teachers.length} registered teachers. Rules: On Time (&le; 7:00 AM), Late (&gt; 7:00 AM), Absent (Unclocked after 4:30 PM).
        </p>
      </div>
    </div>

    {(() => {
      if (teachers.length === 0) {
        return (
          <div className="sa-card border border-[#c77dff] p-8 rounded-2xl text-center text-xs text-[#10002b]/70 bg-white shadow-xs">
            No teachers registered in the system to calculate attendance.
          </div>
        );
      }

      const logsByDate = {};
      attendanceLogs.forEach((log) => {
        const dateRaw = log.date || log.timestamp;
        if (!dateRaw) return;
        const dateStr = new Date(dateRaw).toISOString().split('T')[0];
        
        if (!logsByDate[dateStr]) logsByDate[dateStr] = {};
        const tKey = log.tsc_number || log.teacher_id || log.teacher;
        
        if (!logsByDate[dateStr][tKey]) {
          logsByDate[dateStr][tKey] = log;
        }
      });

      const dates = Object.keys(logsByDate).length > 0 
        ? Object.keys(logsByDate).sort().reverse() 
        : [new Date().toISOString().split('T')[0]];

      const weeks = [];
      let currentWeekDates = [];

      dates.forEach((dateStr) => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          currentWeekDates.push(dateStr);
          if (dayOfWeek === 5 || currentWeekDates.length >= 5) {
            weeks.push({
              startDate: new Date(currentWeekDates[0]),
              dates: [...currentWeekDates],
              monthYear: new Date(currentWeekDates[0]).toLocaleString('en-US', { month: 'long', year: 'numeric' })
            });
            currentWeekDates = [];
          }
        }
      });

      if (currentWeekDates.length > 0) {
        weeks.push({
          startDate: new Date(currentWeekDates[0]),
          dates: [...currentWeekDates],
          monthYear: new Date(currentWeekDates[0]).toLocaleString('en-US', { month: 'long', year: 'numeric' })
        });
      }

      return weeks.map((week, weekIndex) => {
        let weekPresent = 0;
        let weekLate = 0;
        let weekAbsent = 0;

        const evaluatedRows = [];

        week.dates.forEach((dateStr) => {
          const dailyLogs = logsByDate[dateStr] || {};
          const targetDate = new Date(dateStr);

          teachers.forEach((teacher) => {
            const tKey = teacher.tsc_number || teacher.id;
            const log = dailyLogs[tKey] || dailyLogs[teacher.id];

            const firstName = teacher.first_name || teacher.user?.first_name || '';
            const surname = teacher.surname || '';
            const fullName = `${firstName} ${surname}`.trim() || `Teacher ID: ${teacher.id}`;
            const tscNum = teacher.tsc_number || 'N/A';

            const now = new Date();
            const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
            const isPastFourThirtyPM = currentTimeMinutes >= 990 || now.toDateString() !== targetDate.toDateString();

            let clockInTime = 'No Record';
            let clockOutTime = 'N/A';
            let status = 'Absent';
            let badgeClass = 'bg-red-100 text-red-800 border-red-300';
            const SEVEN_AM_MINUTES = 420; // 7:00 AM

            if (log) {
              const rawIn = log.check_in_time || log.timestamp;
              const rawOut = log.check_out_time || log.clock_out;

              if (rawIn) {
                const inDate = new Date(rawIn);
                clockInTime = inDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const checkInMinutes = inDate.getHours() * 60 + inDate.getMinutes();

                if (checkInMinutes > SEVEN_AM_MINUTES) {
                  status = 'Late';
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  weekLate++;
                } else {
                  status = 'Present';
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  weekPresent++;
                }
              }

              if (rawOut) {
                clockOutTime = new Date(rawOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              } else if (rawIn) {
                clockOutTime = 'Pending / Active';
              }
            } else {
              if (!isPastFourThirtyPM) {
                status = 'Pending (Before 4:30 PM)';
                badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
              } else {
                status = 'Absent';
                badgeClass = 'bg-red-100 text-red-800 border-red-300';
                weekAbsent++;
              }
            }

            evaluatedRows.push({
              tscNum,
              fullName,
              dayOfWeek: targetDate.toLocaleDateString('en-US', { weekday: 'long' }),
              clockInTime,
              clockOutTime,
              status,
              badgeClass,
              exactDate: targetDate.toLocaleDateString()
            });
          });
        });

        return (
          <div key={weekIndex} className="space-y-4 w-full bg-white p-6 rounded-2xl border border-[#c77dff] shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#c77dff]/40 pb-3 gap-2">
              <h3 className="text-base font-extrabold text-[#10002b] uppercase tracking-wide">
                {week.monthYear} — Week {weeks.length - weekIndex} (Mon to Fri)
              </h3>
              
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700">Present: {weekPresent}</span>
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700">Late: {weekLate}</span>
                <span className="px-3 py-1 rounded-lg bg-red-50 text-red-700">Absent: {weekAbsent}</span>
              </div>
            </div>

            <div className="sa-table-wrapper rounded-xl overflow-x-auto w-full">
              <table className="sa-table w-full text-left text-xs min-w-[950px]">
                <thead>
                  <tr>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">TSC Number</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">First Name & Surname</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Day</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Clock-In Time</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Clock-Out Time</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="p-3.5 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px]">Exact Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c77dff]/30">
                  {evaluatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#c77dff]/5 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#10002b]">{row.tscNum}</td>
                      <td className="p-3.5 font-bold text-[#10002b]">{row.fullName}</td>
                      <td className="p-3.5 font-bold text-[#10002b]">{row.dayOfWeek}</td>
                      <td className="p-3.5 font-mono text-emerald-800 font-semibold">{row.clockInTime}</td>
                      <td className="p-3.5 font-mono text-[#10002b]/70 font-semibold">{row.clockOutTime}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${row.badgeClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[#10002b]/80">{row.exactDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      });
    })()}
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

      {/* ADMIN INVITATION MODAL POPUP */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#c77dff] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-[#10002b]">Invite User to SmartAcademic</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-black font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#10002b]/80">
              Enter the email address and select the role. The system will dispatch an activation link directly to their email.
            </p>

            {inviteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
                {inviteError}
              </div>
            )}

            {inviteMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl text-center">
                {inviteMessage}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10002b] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@smartacademic.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-300 text-[#10002b] focus:outline-none focus:border-[#c77dff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10002b] mb-1">Role Type</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-300 text-[#10002b] focus:outline-none focus:border-[#c77dff] cursor-pointer"
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-5 py-2.5 text-xs font-extrabold rounded-xl bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer disabled:opacity-50"
                >
                  {inviteLoading ? 'Sending Invite...' : 'Send Invitation Email'}
                </button>
              </div>
            </form>
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