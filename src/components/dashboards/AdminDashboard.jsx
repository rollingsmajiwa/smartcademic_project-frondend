import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import { usePagination, Pagination } from './Pagination';

const API_ORIGIN = import.meta.env.VITE_API_URL || 'https://smartcademic-project.onrender.com';
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// ---------- Shared class strings ----------
const thClass =
  'p-4 bg-[#10002b] text-white font-bold uppercase tracking-wider text-[10px] whitespace-nowrap';
const modalInput =
  'w-full p-3 rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]';
const cardClass = 'sa-card border border-[#c77dff] shadow-xs rounded-2xl w-full';
const tableWrapperClass =
  'sa-table-wrapper border border-[#c77dff] shadow-xs rounded-2xl overflow-x-auto w-full max-w-full';
const addBtnClass =
  'sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs';
const editBtnClass =
  'sa-btn-secondary py-1.5 px-3 text-xs bg-[#10002b] text-white border border-[#10002b] hover:bg-[#c77dff] hover:text-[#10002b] rounded-xl font-bold transition-all cursor-pointer';
const deleteBtnClass =
  'py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer';

async function extractEmailsFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();

  if (pdfjsLib?.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    fullText += `${pageText}\n`;
  }

  const matches = fullText.match(EMAIL_REGEX) || [];
  return Array.from(new Set(matches.map((addr) => addr.trim().toLowerCase())));
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [accountUsers, setAccountUsers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [assignmentSubs, setAssignmentSubs] = useState([]);
  const [examSubs, setExamSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- Pagination ----------
  const teacherPager = usePagination(teachers, 10);
  const studentPager = usePagination(students, 10);
  const classroomPager = usePagination(classrooms, 10);

  // Map auth users by id and email to check `is_active` and `is_admin_approved`
  const accountLookup = useMemo(() => {
    const byId = {};
    const byEmail = {};
    accountUsers.forEach((u) => {
      if (u.id != null) byId[u.id] = u;
      if (u.email) byEmail[u.email.trim().toLowerCase()] = u;
    });
    return { byId, byEmail };
  }, [accountUsers]);

  const getLinkedAccount = (record) => {
    const uid = typeof record.user === 'object' ? record.user?.id : record.user || record.user_id;
    if (uid && accountLookup.byId[uid]) return accountLookup.byId[uid];
    const email = (record.email || record.user?.email || '').trim().toLowerCase();
    if (email && accountLookup.byEmail[email]) return accountLookup.byEmail[email];
    return null;
  };

  const pendingApprovals = useMemo(
    () =>
      accountUsers.filter(
        (u) =>
          u.is_active &&
          u.is_admin_approved === false &&
          (u.role === 'teacher' || u.role === 'student')
      ),
    [accountUsers]
  );

  // Group attendance logs by date and split them into Mon-Fri weeks (newest first)
  const { logsByDate, weeks } = useMemo(() => {
    const byDate = {};
    attendanceLogs.forEach((log) => {
      const dateRaw = log.date || log.timestamp;
      if (!dateRaw) return;
      const dateStr = new Date(dateRaw).toISOString().split('T')[0];

      if (!byDate[dateStr]) byDate[dateStr] = {};
      const tKey = log.tsc_number || log.teacher_id || log.teacher;

      if (!byDate[dateStr][tKey]) {
        byDate[dateStr][tKey] = log;
      }
    });

    const dates = Object.keys(byDate).length > 0
      ? Object.keys(byDate).sort().reverse()
      : [new Date().toISOString().split('T')[0]];

    const result = [];
    let currentWeekDates = [];

    dates.forEach((dateStr) => {
      const d = new Date(dateStr);
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        currentWeekDates.push(dateStr);
        if (dayOfWeek === 5 || currentWeekDates.length >= 5) {
          result.push({
            startDate: new Date(currentWeekDates[0]),
            dates: [...currentWeekDates],
            monthYear: new Date(currentWeekDates[0]).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          });
          currentWeekDates = [];
        }
      }
    });

    if (currentWeekDates.length > 0) {
      result.push({
        startDate: new Date(currentWeekDates[0]),
        dates: [...currentWeekDates],
        monthYear: new Date(currentWeekDates[0]).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      });
    }

    return { logsByDate: byDate, weeks: result };
  }, [attendanceLogs]);

  const weeksPager = usePagination(weeks, 2);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [userRoleType, setUserRoleType] = useState('teacher');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedAccountUserId, setSelectedAccountUserId] = useState(null);

  // Invitation Modal States (Single & Bulk PDF)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMode, setInviteMode] = useState('single'); // 'single' | 'bulk'
  const [inviteEmail, setInviteEmail] = useState('');
  const [bulkInviteText, setBulkInviteText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfParsing, setPdfParsing] = useState(false);
  const [inviteRole, setInviteRole] = useState('teacher');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

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
    teacher: '',
  });

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
        teachersRes,
        studentsRes,
        classRes,
        attRes,
        asSubRes,
        exSubRes,
        usersRes,
      ] = await Promise.all([
        axios.get(`${API_ORIGIN}/api/admin/teachers/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/admin/students/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/admin/classrooms/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/admin/attendance/teachers/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/admin/submissions/assignments/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/admin/submissions/exams/`, getAuthConfig()).catch(() => ({ data: [] })),
        axios.get(`${API_ORIGIN}/api/accounts/admin/users/`, getAuthConfig()).catch(() => ({ data: [] })),
      ]);

      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
      setClassrooms(classRes.data);
      setAttendanceLogs(attRes.data);
      setAssignmentSubs(asSubRes.data);
      setExamSubs(exSubRes.data);
      setAccountUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, location.pathname]);

  const parsedBulkEmails = useMemo(() => {
    const matches = bulkInviteText.match(EMAIL_REGEX) || [];
    return Array.from(new Set(matches.map((addr) => addr.trim().toLowerCase())));
  }, [bulkInviteText]);

  const handleBulkPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setInviteError('');
    setPdfFileName(file.name);

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setInviteError('Please select a valid PDF (.pdf) file.');
      return;
    }

    setPdfParsing(true);
    try {
      const extracted = await extractEmailsFromPdf(file);
      if (extracted.length === 0) {
        setInviteError(
          'No email addresses were found in this PDF. Make sure the PDF contains selectable text rather than a scanned image.'
        );
      } else {
        setBulkInviteText((prev) =>
          prev ? `${prev.trim()}\n${extracted.join('\n')}` : extracted.join('\n')
        );
      }
    } catch (pdfErr) {
      console.error('PDF parsing failed:', pdfErr);
      setInviteError(
        'Could not read the PDF file. Ensure pdfjs-dist is installed and the PDF is not password-protected.'
      );
    } finally {
      setPdfParsing(false);
    }
  };

  const openCreateModal = (role) => {
    setUserRoleType(role);
    setModalMode('create');
    setSelectedUserId(null);
    setSelectedAccountUserId(null);
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
      teacher: '',
    });
    setShowModal(true);
  };

  const openEditModal = (obj, role) => {
    setUserRoleType(role);
    setModalMode('edit');
    setSelectedUserId(obj.id);

    const linkedAcc = role === 'teacher' || role === 'student' ? getLinkedAccount(obj) : null;
    setSelectedAccountUserId(linkedAcc?.id || null);

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
      teacher: currentTeacherId,
    });
    setShowModal(true);
  };

  const handleApproveAccount = async (accountUserId, label = 'User') => {
    try {
      await axios.patch(
        `${API_ORIGIN}/api/accounts/admin/users/${accountUserId}/`,
        { is_admin_approved: true },
        getAuthConfig()
      );
      alert(`${label} approved for login!`);
      fetchAdminData();
    } catch (err) {
      console.error('Approval failed:', err.response?.data || err);
      alert(err.response?.data?.error || 'Failed to approve user account.');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteMessage('');
    setInviteLink('');
    setBulkResult(null);
    setInviteLoading(true);

    try {
      if (inviteMode === 'bulk') {
        if (parsedBulkEmails.length === 0) {
          setInviteError('Upload a PDF or enter at least one valid email address.');
          setInviteLoading(false);
          return;
        }

        const response = await axios.post(
          `${API_ORIGIN}/api/accounts/admin/invite/bulk/`,
          { emails: parsedBulkEmails, role: inviteRole },
          getAuthConfig()
        );

        setInviteMessage(response.data.message || 'Bulk invitations processed.');
        setBulkResult(response.data);
        setBulkInviteText('');
        setPdfFileName('');
      } else {
        const response = await axios.post(
          `${API_ORIGIN}/api/accounts/admin/invite/`,
          { email: inviteEmail, role: inviteRole },
          getAuthConfig()
        );

        setInviteMessage(response.data.message || `Invitation successfully sent to ${inviteEmail}`);
        if (response.data.invite_link) {
          setInviteLink(response.data.invite_link);
        }
        setInviteEmail('');
      }

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
    let endpoint = `${API_ORIGIN}/api/admin/teachers/`;
    if (userRoleType === 'student') endpoint = `${API_ORIGIN}/api/admin/students/`;
    if (userRoleType === 'classroom') endpoint = `${API_ORIGIN}/api/admin/classrooms/`;

    try {
      if (modalMode === 'create') {
        await axios.post(endpoint, formData, getAuthConfig());
        alert(`${userRoleType.charAt(0).toUpperCase() + userRoleType.slice(1)} created successfully!`);
      } else {
        await axios.patch(`${endpoint}${selectedUserId}/`, formData, getAuthConfig());

        if ((userRoleType === 'teacher' || userRoleType === 'student') && selectedAccountUserId) {
          await axios
            .patch(
              `${API_ORIGIN}/api/accounts/admin/users/${selectedAccountUserId}/`,
              {
                first_name: formData.first_name,
                last_name: formData.last_name,
                is_admin_approved: true,
              },
              getAuthConfig()
            )
            .catch(() => null);
        }

        alert(
          `${userRoleType.charAt(0).toUpperCase() + userRoleType.slice(1)} updated and approved for login!`
        );
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
    let endpoint = `${API_ORIGIN}/api/admin/teachers/${id}/`;
    if (role === 'student') endpoint = `${API_ORIGIN}/api/admin/students/${id}/`;
    if (role === 'classroom') endpoint = `${API_ORIGIN}/api/admin/classrooms/${id}/`;

    try {
      await axios.delete(endpoint, getAuthConfig());
      alert(`${role} deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error(`Delete failed:`, err.response?.data || err);
      alert(`Failed to delete ${role}.`);
    }
  };

  const renderApprovalBadge = (record) => {
    const acc = getLinkedAccount(record);
    if (!acc) return null;
    if (!acc.is_active) {
      return (
        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gray-100 text-gray-700 border border-gray-300">
          Awaiting Activation
        </span>
      );
    }
    if (acc.is_admin_approved === false) {
      return (
        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
          Needs Admin Update
        </span>
      );
    }
    return (
      <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
        Approved
      </span>
    );
  };

  const renderNameFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
      <div>
        <label className="block font-bold mb-1 text-[#10002b]">First Name</label>
        <input
          type="text"
          placeholder="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          className={modalInput}
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
          className={modalInput}
        />
      </div>
      <div>
        <label className="block font-bold mb-1 text-[#10002b]">Last Name</label>
        <input
          type="text"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          className={modalInput}
        />
      </div>
    </div>
  );

  return (
    <div
      className="flex-1 w-full min-w-0 min-h-screen pt-20 px-4 pb-6 sm:px-6 lg:pt-8 lg:px-8 space-y-6 font-sans max-w-7xl mx-auto"
      style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}
    >
      {/* Top Header with Invite Button */}
      <div
        className="sa-card border border-[#c77dff] shadow-xs p-4 sm:p-6 rounded-2xl w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        style={{ backgroundColor: 'var(--sa-surface)' }}
      >
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider bg-white border-[#c77dff] text-[#10002b]">
            System Administrator
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold mt-2 text-[#10002b]">SmartAcademic Management Portal</h1>
          <p className="text-xs mt-1 text-[#10002b]/70">
            Invite users individually or via PDF batch upload, review activated profiles, and monitor weekly teacher attendance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInviteError('');
            setInviteMessage('');
            setInviteLink('');
            setBulkResult(null);
            setPdfFileName('');
            setShowInviteModal(true);
          }}
          className="w-full md:w-auto shrink-0 py-2.5 px-5 rounded-xl text-xs font-extrabold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-md"
        >
          Send User Invitation
        </button>
      </div>

      {/* PENDING ADMIN REVIEW ALERT BANNER */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-amber-900">
              Action Required: {pendingApprovals.length} newly activated account(s) need admin profile review before login
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              {pendingApprovals
                .map((u) => `${u.email || u.username} (${u.role})`)
                .join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {pendingApprovals.some((u) => u.role === 'teacher') && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/admin/teachers')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer"
              >
                Review Teachers
              </button>
            )}
            {pendingApprovals.some((u) => u.role === 'student') && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/admin/students')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer"
              >
                Review Students
              </button>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {[
              { label: 'Teachers', value: teachers.length, to: '/dashboard/admin/teachers' },
              { label: 'Students', value: students.length, to: '/dashboard/admin/students' },
              { label: 'Classrooms', value: classrooms.length, to: '/dashboard/admin/classrooms' },
              { label: 'Attendance Logs', value: attendanceLogs.length, to: '/dashboard/admin/attendance' },
            ].map((card) => (
              <div
                key={card.label}
                onClick={() => navigate(card.to)}
                className={`${cardClass} p-5 cursor-pointer hover:border-[#10002b] transition-all`}
                style={{ backgroundColor: 'var(--sa-surface)' }}
              >
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">{card.label}</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEACHERS CRUD MANAGEMENT TAB */}
      {activeTab === 'teachers' && (
        <div className="w-full space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">Manage Teachers</h2>
            <button type="button" onClick={() => openCreateModal('teacher')} className={addBtnClass}>
              Add New Teacher
            </button>
          </div>

          <div className={tableWrapperClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs min-w-[980px]">
              <thead>
                <tr>
                  <th className={thClass}>TSC Number</th>
                  <th className={thClass}>Name (First, Surname, Last)</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Account Status</th>
                  <th className={thClass}>Gender</th>
                  <th className={thClass}>Date Joined</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-[#10002b]/70 bg-white">No teachers registered yet.</td>
                  </tr>
                ) : (
                  teacherPager.pageItems.map((t) => {
                    const linkedAcc = getLinkedAccount(t);
                    const needsApproval = linkedAcc && linkedAcc.is_active && linkedAcc.is_admin_approved === false;

                    return (
                      <tr key={t.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#10002b] whitespace-nowrap">{t.tsc_number || t.id}</td>
                        <td className="p-4 font-bold text-[#10002b]">
                          {t.first_name || t.user?.first_name || ''} {t.surname ? `, ${t.surname}` : ''} {t.last_name || t.user?.last_name || ''}
                        </td>
                        <td className="p-4 text-[#10002b]/80 break-all">{t.email || t.user?.email || 'N/A'}</td>
                        <td className="p-4">{renderApprovalBadge(t) || <span className="text-[#10002b]/60">Active</span>}</td>
                        <td className="p-4 text-[#10002b]">{t.gender || 'N/A'}</td>
                        <td className="p-4 text-[#10002b]/80 font-mono whitespace-nowrap">
                          {t.date_joined ? new Date(t.date_joined).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                          {needsApproval && (
                            <button
                              type="button"
                              onClick={() => handleApproveAccount(linkedAcc.id, getDisplayName(t))}
                              className="py-1.5 px-3 text-xs bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-bold transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button type="button" onClick={() => openEditModal(t, 'teacher')} className={editBtnClass}>
                            {needsApproval ? 'Update & Approve' : 'Edit'}
                          </button>
                          <button type="button" onClick={() => handleDeleteUser(t.id, 'teacher')} className={deleteBtnClass}>
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
          <Pagination pager={teacherPager} />
          <p className="text-[11px] text-[#10002b]/60 sm:hidden">Swipe the table sideways to see all columns.</p>
        </div>
      )}

      {/* STUDENTS CRUD MANAGEMENT TAB */}
      {activeTab === 'students' && (
        <div className="w-full space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">Manage Students</h2>
            <button type="button" onClick={() => openCreateModal('student')} className={addBtnClass}>
              Add New Student
            </button>
          </div>

          <div className={tableWrapperClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr>
                  <th className={thClass}>Admission No.</th>
                  <th className={thClass}>Name (First, Surname, Last)</th>
                  <th className={thClass}>Username</th>
                  <th className={thClass}>Account Status</th>
                  <th className={thClass}>Gender</th>
                  <th className={thClass}>Classroom</th>
                  <th className={thClass}>Date Admitted</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-[#10002b]/70 bg-white">No students registered yet.</td>
                  </tr>
                ) : (
                  studentPager.pageItems.map((s) => {
                    let assignedClass = s.classroom_name || 'Unassigned';
                    if (assignedClass === 'Unassigned' && s.classroom) {
                      if (typeof s.classroom === 'object') {
                        assignedClass = s.classroom.name;
                      } else {
                        const found = classrooms.find((c) => c.id === Number(s.classroom));
                        if (found) assignedClass = found.name;
                      }
                    }

                    const linkedAcc = getLinkedAccount(s);
                    const needsApproval = linkedAcc && linkedAcc.is_active && linkedAcc.is_admin_approved === false;

                    return (
                      <tr key={s.id} className="bg-white hover:bg-[#c77dff]/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#10002b] whitespace-nowrap">{s.admission_number || s.id}</td>
                        <td className="p-4 font-bold text-[#10002b]">
                          {s.first_name || s.user?.first_name || ''} {s.surname ? `, ${s.surname}` : ''} {s.last_name || s.user?.last_name || ''}
                        </td>
                        <td className="p-4 font-mono text-[#10002b]">{s.username || s.user?.username || 'N/A'}</td>
                        <td className="p-4">{renderApprovalBadge(s) || <span className="text-[#10002b]/60">Active</span>}</td>
                        <td className="p-4 text-[#10002b]">{s.gender || 'N/A'}</td>
                        <td className="p-4 text-[#10002b] font-semibold whitespace-nowrap">{assignedClass}</td>
                        <td className="p-4 text-[#10002b]/80 font-mono whitespace-nowrap">
                          {s.date_admitted ? new Date(s.date_admitted).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                          {needsApproval && (
                            <button
                              type="button"
                              onClick={() => handleApproveAccount(linkedAcc.id, getDisplayName(s))}
                              className="py-1.5 px-3 text-xs bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-bold transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button type="button" onClick={() => openEditModal(s, 'student')} className={editBtnClass}>
                            {needsApproval ? 'Update & Approve' : 'Edit'}
                          </button>
                          <button type="button" onClick={() => handleDeleteUser(s.id, 'student')} className={deleteBtnClass}>
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
          <Pagination pager={studentPager} />
          <p className="text-[11px] text-[#10002b]/60 sm:hidden">Swipe the table sideways to see all columns.</p>
        </div>
      )}

      {/* CLASSROOMS CRUD MANAGEMENT TAB */}
      {activeTab === 'classrooms' && (
        <div className="w-full space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">Manage Classrooms</h2>
            <button type="button" onClick={() => openCreateModal('classroom')} className={addBtnClass}>
              Add New Classroom
            </button>
          </div>

          <div className={tableWrapperClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <table className="sa-table w-full text-left text-xs min-w-[520px]">
              <thead>
                <tr>
                  <th className={thClass}>Classroom ID</th>
                  <th className={thClass}>Class Name</th>
                  <th className={thClass}>Class Teacher</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c77dff]/40">
                {classrooms.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-[#10002b]/70 bg-white">No classrooms configured yet.</td>
                  </tr>
                ) : (
                  classroomPager.pageItems.map((c) => {
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
                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                          <button type="button" onClick={() => openEditModal(c, 'classroom')} className={editBtnClass}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteUser(c.id, 'classroom')} className={deleteBtnClass}>
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
          <Pagination pager={classroomPager} />
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="w-full space-y-8">
          <div className="w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">Teacher Attendance Tracking & Analytics</h2>
            <p className="text-xs text-[#10002b]/70 mt-0.5">
              Evaluated against {teachers.length} registered teachers. Rules: On Time (&le; 7:00 AM), Late (&gt; 7:00 AM), Absent (Unclocked after 4:30 PM).
            </p>
          </div>

          {(() => {
            if (teachers.length === 0) {
              return (
                <div className="sa-card border border-[#c77dff] p-8 rounded-2xl text-center text-xs text-[#10002b]/70 bg-white shadow-xs">
                  No teachers registered in the system to calculate attendance.
                </div>
              );
            }

            return (
              <>
                {weeksPager.pageItems.map((week, weekIndex) => {
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
                      const isPastFourThirtyPM =
                        currentTimeMinutes >= 990 || now.toDateString() !== targetDate.toDateString();

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
                          clockInTime = inDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          });
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
                          clockOutTime = new Date(rawOut).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          });
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
                        exactDate: targetDate.toLocaleDateString(),
                      });
                    });
                  });

                  return (
                    <div
                      key={weekIndex}
                      className="space-y-4 w-full bg-white p-4 sm:p-6 rounded-2xl border border-[#c77dff] shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#c77dff]/40 pb-3 gap-3">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#10002b] uppercase tracking-wide">
                          {week.monthYear} — Week {weeks.length - (weeksPager.startIndex + weekIndex)} (Mon to Fri)
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700">Present: {weekPresent}</span>
                          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700">Late: {weekLate}</span>
                          <span className="px-3 py-1 rounded-lg bg-red-50 text-red-700">Absent: {weekAbsent}</span>
                        </div>
                      </div>

                      <div className="sa-table-wrapper rounded-xl overflow-x-auto w-full max-w-full">
                        <table className="sa-table w-full text-left text-xs min-w-[950px]">
                          <thead>
                            <tr>
                              <th className={thClass}>TSC Number</th>
                              <th className={thClass}>First Name & Surname</th>
                              <th className={thClass}>Day</th>
                              <th className={thClass}>Clock-In Time</th>
                              <th className={thClass}>Clock-Out Time</th>
                              <th className={thClass}>Status</th>
                              <th className={thClass}>Exact Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#c77dff]/30">
                            {evaluatedRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#c77dff]/5 transition-colors">
                                <td className="p-3.5 font-mono font-bold text-[#10002b] whitespace-nowrap">{row.tscNum}</td>
                                <td className="p-3.5 font-bold text-[#10002b] whitespace-nowrap">{row.fullName}</td>
                                <td className="p-3.5 font-bold text-[#10002b]">{row.dayOfWeek}</td>
                                <td className="p-3.5 font-mono text-emerald-800 font-semibold whitespace-nowrap">{row.clockInTime}</td>
                                <td className="p-3.5 font-mono text-[#10002b]/70 font-semibold whitespace-nowrap">{row.clockOutTime}</td>
                                <td className="p-3.5">
                                  <span
                                    className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${row.badgeClass}`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono text-[#10002b]/80 whitespace-nowrap">{row.exactDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-[#10002b]/60 sm:hidden">Swipe the table sideways to see all columns.</p>
                    </div>
                  );
                })}
                <Pagination pager={weeksPager} pageSizeOptions={[2, 4, 8]} unit="Weeks" />
              </>
            );
          })()}
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div className="w-full space-y-6">
          <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">All Student Submissions</h2>
          <div className={`${cardClass} p-4 sm:p-6 space-y-4`} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <p className="text-xs text-[#10002b]/80">
              Assignment Submissions Count: <strong>{assignmentSubs.length}</strong>
            </p>
            <p className="text-xs text-[#10002b]/80">
              Exam Submissions Count: <strong>{examSubs.length}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ADMIN INVITATION MODAL POPUP (SINGLE & BULK PDF) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#c77dff] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-[#10002b]">Invite Users to SmartAcademic</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-black font-bold text-2xl leading-none px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Single vs Bulk Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setInviteMode('single');
                  setInviteError('');
                  setInviteMessage('');
                  setBulkResult(null);
                }}
                className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  inviteMode === 'single'
                    ? 'bg-[#10002b] text-white shadow-xs'
                    : 'text-[#10002b]/70 hover:text-[#10002b]'
                }`}
              >
                Single Invitation
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteMode('bulk');
                  setInviteError('');
                  setInviteMessage('');
                  setInviteLink('');
                }}
                className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  inviteMode === 'bulk'
                    ? 'bg-[#10002b] text-white shadow-xs'
                    : 'text-[#10002b]/70 hover:text-[#10002b]'
                }`}
              >
                Bulk Invitation (PDF)
              </button>
            </div>

            <p className="text-xs text-[#10002b]/80">
              {inviteMode === 'single'
                ? 'Enter an email address and role. An activation link will be emailed directly.'
                : 'Upload a PDF (.pdf) containing recipient emails or paste emails below to send invitations in one batch.'}
            </p>

            {inviteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
                {inviteError}
              </div>
            )}

            {inviteMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl space-y-2">
                <p className="text-center">{inviteMessage}</p>

                {inviteLink && (
                  <div className="mt-2 p-2 bg-white rounded border border-emerald-300 text-left">
                    <span className="block text-[10px] text-gray-500 uppercase font-semibold">Activation Link:</span>
                    <a
                      href={inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs break-all block mt-0.5 font-normal"
                    >
                      {inviteLink}
                    </a>
                  </div>
                )}

                {bulkResult && (
                  <div className="mt-2 p-2.5 bg-white rounded border border-emerald-300 text-left space-y-1.5 font-normal text-[#10002b]">
                    <p className="text-xs font-bold">
                      Created: {bulkResult.created_count} | Emails Sent: {bulkResult.emails_sent}
                    </p>
                    {Array.isArray(bulkResult.skipped) && bulkResult.skipped.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                        <span className="font-bold block mb-1">Skipped ({bulkResult.skipped.length}):</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {bulkResult.skipped.map((item, i) => (
                            <li key={i}>
                              {item.email}: {item.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              {inviteMode === 'single' ? (
                <div>
                  <label className="block text-xs font-bold text-[#10002b] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rollingsmajiwa@gmail.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-300 text-[#10002b] focus:outline-none focus:border-[#c77dff]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-[#10002b]">
                      Recipient Emails ({parsedBulkEmails.length} detected)
                    </label>
                    <label className="px-3 py-1 rounded-lg bg-[#c77dff]/20 border border-[#c77dff] text-[11px] font-bold text-[#10002b] hover:bg-[#c77dff] transition-all cursor-pointer">
                      {pdfParsing ? 'Reading PDF...' : 'Upload PDF'}
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleBulkPdfUpload}
                        disabled={pdfParsing}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {pdfFileName && (
                    <p className="text-[11px] font-semibold text-[#10002b]/70 truncate">
                      Selected PDF: <span className="font-mono">{pdfFileName}</span>
                    </p>
                  )}

                  <textarea
                    rows={5}
                    required
                    placeholder={'Upload a PDF file or paste emails here...\nuser1@school.ac.ke\nuser2@school.ac.ke'}
                    value={bulkInviteText}
                    onChange={(e) => setBulkInviteText(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-300 text-[#10002b] focus:outline-none focus:border-[#c77dff] font-mono"
                  />
                </div>
              )}

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

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading || pdfParsing}
                  className="px-5 py-2.5 text-xs font-extrabold rounded-xl bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer disabled:opacity-50"
                >
                  {inviteLoading
                    ? 'Sending...'
                    : inviteMode === 'bulk'
                    ? `Send ${parsedBulkEmails.length || ''} PDF Invitations`
                    : 'Send Invitation Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARED CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#10002b]/50 backdrop-blur-xs flex justify-center items-center p-4 z-[60]">
          <div
            className="sa-card max-w-md w-full space-y-4 shadow-xl border border-[#c77dff] p-4 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <h3 className="font-extrabold text-base text-[#10002b] capitalize">
              {modalMode === 'create' ? `Add New ${userRoleType}` : `Edit & Approve ${userRoleType}`}
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
                      className={modalInput}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Assigned Teacher</label>
                    <select
                      value={formData.teacher}
                      onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                      className={modalInput}
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
                  {renderNameFields()}

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={modalInput}
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
                      className={`${modalInput} font-mono`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Date Joined Institution</label>
                    <input
                      type="date"
                      value={formData.date_joined}
                      onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                      className={modalInput}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={modalInput}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {renderNameFields()}

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Admission Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-2026-001"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      className={`${modalInput} font-mono`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#10002b]">Date Admitted</label>
                    <input
                      type="date"
                      value={formData.date_admitted}
                      onChange={(e) => setFormData({ ...formData, date_admitted: e.target.value })}
                      className={modalInput}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-[#10002b]">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={modalInput}
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
                        className={modalInput}
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

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
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
                  {modalMode === 'edit' && (userRoleType === 'teacher' || userRoleType === 'student')
                    ? 'Save & Approve'
                    : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}