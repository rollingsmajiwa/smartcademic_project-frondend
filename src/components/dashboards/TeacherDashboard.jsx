import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api/teachers';
const HOST = 'http://127.0.0.1:8000';

// Build auth headers fresh on every call so a new login is always picked up
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
});

// Turn an axios error into a message that shows the HTTP status and server detail
const describeError = (err, fallback) => {
  const status = err.response?.status;
  const data = err.response?.data;
  const detail =
    (data && typeof data === 'object' && (data.detail || data.error || data.message)) || '';
  if (status) return `${fallback} (HTTP ${status}${detail ? `: ${detail}` : ''})`;
  return `${fallback} (${err.message})`;
};

const inputClass =
  'w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]';
const primaryBtn =
  'sa-btn-primary w-full py-3.5 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer font-bold rounded-xl mt-2';
const selectClass =
  'px-3 py-1.5 border border-[#10002b] rounded-md text-xs font-semibold text-[#10002b] bg-white focus:outline-none focus:ring-2 focus:ring-[#c77dff]';
const smallBtn =
  'px-4 py-2 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition shadow-sm cursor-pointer';

// Shared class + term dropdowns used by Marks, Analysis and Analytics tabs
function ClassTermSelectors({ classes, selectedClass, setSelectedClass, term, setTerm }) {
  return (
    <>
      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={selectClass}>
        {classes.length === 0 && <option value="">No classes found</option>}
        {classes.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <select value={term} onChange={(e) => setTerm(e.target.value)} className={selectClass}>
        <option value="Term 1">Term 1</option>
        <option value="Term 2">Term 2</option>
        <option value="Term 3">Term 3</option>
      </select>
    </>
  );
}

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/revisions') || path.includes('/materials')) return 'materials';
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/exams')) return 'exams';
    if (path.includes('/submissions') || path.includes('/grading')) return 'submissions';
    if (path.includes('/marks')) return 'marks';
    if (path.includes('/analysis')) return 'analysis';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/attendance') || path.includes('/geo')) return 'attendance';
    return 'overview';
  };
  const activeTab = getActiveTab();

  // ---------- General state ----------
  const [teachersList, setTeachersList] = useState([]);
  const [overview, setOverview] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [revisionsList, setRevisionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState({});
  const [gradeDescriptions, setGradeDescriptions] = useState({});
  const [examGrades, setExamGrades] = useState({});
  const [pdfBlobs, setPdfBlobs] = useState({});

  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', class_name: '', deadline: '', teacher: '', file: null,
  });
  const [examForm, setExamForm] = useState({
    title: '', term: '', description: '', duration_mins: 60, start_time: '', end_time: '', file: null,
  });
  const [revisionForm, setRevisionForm] = useState({
    title: '', description: '', class_name: '', file: null,
  });

  // ---------- Geofence attendance state ----------
  const [teacherId, setTeacherId] = useState('');
  const [statusText, setStatusText] = useState('Click the button to check');
  const [geoLoading, setGeoLoading] = useState(false);

  // ---------- Marks / analysis state ----------
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [subjects, setSubjects] = useState([]);
  const [studentsTable, setStudentsTable] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksMessage, setMarksMessage] = useState('');
  const [marksError, setMarksError] = useState('');

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // ---------- Fetchers ----------
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API}/list/`, authConfig());
      setTeachersList(res.data);
    } catch (err) {
      console.error('Failed to load teachers list:', err);
    }
  };

  const fetchRevisions = async () => {
    try {
      const res = await axios.get(`${API}/revisions/`, authConfig());
      setRevisionsList(res.data);
    } catch (err) {
      console.error('Failed to load revision materials:', err);
    }
  };

  // Classes created by the admin; the dropdowns are built from this list
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/classes/`, authConfig());
      setClasses(res.data);
      if (res.data.length > 0 && !res.data.some((c) => c.name === className)) {
        setClassName(res.data[0].name);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
      const msg = describeError(err, 'Could not load the class list');
      setMarksError(msg);
      setAnalysisError(msg);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await axios.get(`${API}/overview/`, authConfig());
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  const loadPdfBlobs = async (subList) => {
    const blobMap = {};
    for (const sub of subList) {
      if (sub.file) {
        try {
          const fileUrl = sub.file.startsWith('http') ? sub.file : `${HOST}${sub.file}`;
          const response = await axios.get(fileUrl, { ...authConfig(), responseType: 'blob' });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          blobMap[`${fileUrl}`] = URL.createObjectURL(blob);
          blobMap[sub.id] = blobMap[`${fileUrl}`];
        } catch (err) {
          console.error(`Failed to load file for submission ${sub.id}:`, err);
        }
      }
    }
    setPdfBlobs((prev) => ({ ...prev, ...blobMap }));
  };

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const [assignmentRes, examRes] = await Promise.all([
        axios.get(`${API}/assignment-submissions/`, authConfig()),
        axios.get(`${API}/exam-submissions/`, authConfig()),
      ]);
      setSubmissions(assignmentRes.data);
      setExamSubmissions(examRes.data);
      await loadPdfBlobs(assignmentRes.data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassGradesTable = async () => {
    setMarksLoading(true);
    setMarksError('');
    try {
      const res = await axios.get(
        `${API}/grades/${encodeURIComponent(className)}/${encodeURIComponent(term)}/marks-table/`,
        authConfig()
      );
      setSubjects(res.data.subjects);
      setStudentsTable(res.data.students_table);
    } catch (err) {
      console.error('Failed to load marks table:', err);
      setSubjects([]);
      setStudentsTable([]);
      setMarksError(describeError(err, 'Failed to load student marks for this class/term'));
    } finally {
      setMarksLoading(false);
    }
  };

  const fetchClassAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError('');
    try {
      const res = await axios.get(
        `${API}/grades/analysis/${encodeURIComponent(className)}/${encodeURIComponent(term)}/`,
        authConfig()
      );
      setAnalysisData(res.data);
    } catch (err) {
      console.error('Failed to load class analysis:', err);
      setAnalysisError(describeError(err, 'Could not load class analysis'));
      setAnalysisData(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (activeTab === 'assignments') fetchTeachers();
    if (activeTab === 'materials') fetchRevisions();
    if (activeTab === 'overview') {
      fetchOverview();
      fetchAllSubmissions();
      fetchRevisions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'submissions') fetchAllSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, location.pathname]);

  // Load the admin's classes when one of these tabs opens, and again whenever the
  // browser tab regains focus, so a class added meanwhile appears without a reload
  useEffect(() => {
    if (!['marks', 'analysis', 'analytics'].includes(activeTab)) return undefined;
    fetchClasses();
    window.addEventListener('focus', fetchClasses);
    return () => window.removeEventListener('focus', fetchClasses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'marks' && className) fetchClassGradesTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, className, term]);

  useEffect(() => {
    if ((activeTab === 'analysis' || activeTab === 'analytics') && className) fetchClassAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, className, term]);

  // ---------- Post handlers ----------
  const handlePostAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', assignmentForm.title);
    formData.append('description', assignmentForm.description);
    formData.append('class_name', assignmentForm.class_name);
    formData.append('deadline', assignmentForm.deadline);
    formData.append('teacher', assignmentForm.teacher);
    if (assignmentForm.file) formData.append('file', assignmentForm.file);

    try {
      await axios.post(`${API}/assignment/`, formData, {
        headers: { ...authConfig().headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Assignment posted successfully!');
      setAssignmentForm({ title: '', description: '', class_name: '', deadline: '', teacher: '', file: null });
    } catch (err) {
      console.error('Error posting assignment:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to post assignment.');
    }
  };

  const handlePostExam = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', examForm.title);
    formData.append('term', examForm.term);
    formData.append('description', examForm.description || '');
    formData.append('duration_mins', examForm.duration_mins || 60);
    formData.append('start_time', examForm.start_time || new Date().toISOString());
    formData.append('end_time', examForm.end_time || new Date().toISOString());
    if (examForm.file) formData.append('file', examForm.file);

    try {
      await axios.post(`${API}/exam/`, formData, {
        headers: { ...authConfig().headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Exam posted successfully!');
      setExamForm({ title: '', term: '', description: '', duration_mins: 60, start_time: '', end_time: '', file: null });
    } catch (err) {
      console.error('Error posting exam:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to post exam.');
    }
  };

  const handlePostRevision = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', revisionForm.title);
    formData.append('description', revisionForm.description || '');
    if (revisionForm.class_name) formData.append('class_name', revisionForm.class_name);
    if (revisionForm.file) formData.append('file', revisionForm.file);

    try {
      await axios.post(`${API}/revisions/`, formData, {
        headers: { ...authConfig().headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Revision material uploaded successfully!');
      setRevisionForm({ title: '', description: '', class_name: '', file: null });
      fetchRevisions();
    } catch (err) {
      console.error('Error posting revision:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to upload revision material.');
    }
  };

  // ---------- Grading handlers ----------
  const handleGradeSubmit = async (submissionId) => {
    const gradeVal = grades[submissionId];
    const descVal = gradeDescriptions[submissionId];
    if (!gradeVal) {
      alert('Please enter a score / grade.');
      return;
    }
    try {
      await axios.patch(
        `${API}/assignment-submissions/${submissionId}/grade/`,
        {
          grade: gradeVal, // change to 'score' if your serializer uses 'score'
          grade_description: descVal || '',
        },
        authConfig()
      );
      alert('Score and review saved successfully!');
      fetchAllSubmissions();
    } catch (err) {
      console.error('Error saving score:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to save score.');
    }
  };

  const handleExamGradeSubmit = async (submissionId) => {
    const gradeVal = examGrades[submissionId];
    if (!gradeVal) {
      alert('Please enter an exam score.');
      return;
    }
    try {
      // URL fixed to match Django: exam-submissions/<pk>/grade/
      // Both keys are sent because the exam serializer may use either `score` or `grade`;
      // DRF ignores the one it does not know.
      await axios.patch(
        `${API}/exam-submissions/${submissionId}/grade/`,
        { score: gradeVal, grade: gradeVal },
        authConfig()
      );
      alert('Exam score saved successfully!');
      fetchAllSubmissions();
    } catch (err) {
      console.error('Error saving exam score:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to save exam score.');
    }
  };

  // ---------- Geofence ----------
  const runGeoFence = (statusDirect) => {
    if (!teacherId) {
      setStatusText('Please enter your TSC Number!');
      return;
    }

    setStatusText('Checking School location..');
    setGeoLoading(true);

    if (!navigator.geolocation) {
      setStatusText('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await axios.post(
            `${API}/attendance/`,
            {
              tsc_number: teacherId,
              direction: statusDirect,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            authConfig()
          );
          if (response.status === 200 || response.status === 201) {
            setStatusText(`Success! Clocked ${statusDirect}`);
          }
        } catch (error) {
          console.error('API Error:', error.response?.data || error);
          const backendMsg = error.response?.data?.message || error.response?.data?.error;
          setStatusText(backendMsg || 'You are outside the school compound');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setStatusText('GPS ERROR! permission blocked');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ---------- Marks handlers ----------
  const handleGridMarkChange = (studentId, subjectKey, value) => {
    setStudentsTable((prev) =>
      prev.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              marks: { ...student.marks, [subjectKey]: value === '' ? '' : parseFloat(value) },
            }
          : student
      )
    );
  };

  const handleBulkSaveMarks = async () => {
    setSavingMarks(true);
    setMarksMessage('');
    setMarksError('');

    const entries = [];
    studentsTable.forEach((student) => {
      Object.entries(student.marks).forEach(([subject, markVal]) => {
        if (markVal !== '' && !isNaN(markVal)) {
          entries.push({ student_id: student.student_id, subject, marks: markVal });
        }
      });
    });

    try {
      await axios.post(
        `${API}/grades/marks/bulk-save/`,
        { class_name: className, term, entries },
        authConfig()
      );
      setMarksMessage('Marks saved successfully!');
      fetchClassGradesTable();
    } catch (err) {
      console.error('Error saving marks in bulk:', err);
      setMarksError(describeError(err, 'Failed to save marks'));
    } finally {
      setSavingMarks(false);
    }
  };

  // PDF export: uses the Authorization header, so the token is never put in the URL
  const handlePdfReportExport = async () => {
    const setErr = activeTab === 'marks' ? setMarksError : setAnalysisError;
    setErr('');
    try {
      const res = await axios.get(
        `${API}/grades/analysis/${encodeURIComponent(className)}/${encodeURIComponent(term)}/`,
        { ...authConfig(), params: { export: 'pdf' }, responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${className}_${term}_Class_Report.pdf`.replace(/\s+/g, '_');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      setErr(describeError(err, 'Could not export the PDF report (save marks for this class and term first)'));
    }
  };

  // ---------- Helpers ----------
  const renderStudentAnswers = (sub) => {
    let rawText = sub.answer_text || sub.content;
    if (!rawText && sub.answers_json) {
      try {
        const parsed = typeof sub.answers_json === 'string' ? JSON.parse(sub.answers_json) : sub.answers_json;
        rawText = parsed.response || JSON.stringify(parsed, null, 2);
      } catch {
        rawText = sub.answers_json;
      }
    }
    return rawText || 'No text answers provided.';
  };

  const fileHref = (sub) =>
    pdfBlobs[sub.id] || (sub.file.startsWith('http') ? sub.file : `${HOST}${sub.file}`);

  // Level distribution for the analytics tab (EE / ME / AE / BE)
  const levelCounts = () => {
    const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
    if (!analysisData) return counts;
    analysisData.student_performance_table.forEach((student) => {
      Object.values(student.subjects).forEach((s) => {
        if (counts[s.level] !== undefined) counts[s.level] += 1;
      });
    });
    return counts;
  };

  // ---------- Render ----------
  return (
    <div
      className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen font-sans space-y-6"
      style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}
    >
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full px-4 sm:px-6">
          <div
            className="sa-banner sa-flex-between border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-xl font-extrabold text-[#10002b]">Teacher Overview Dashboard</h2>
              <p className="text-xs mt-1 text-[#10002b]/70">
                Quick summary of your assignments, exams, and student submissions.
              </p>
            </div>
          </div>

          <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              { label: 'Assignments Posted', value: overview?.total_assignments_posted || 0, to: '/dashboard/student/assignments' },
              { label: 'Exams Created', value: overview?.total_exams_created || 0, to: '/dashboard/student/exams' },
              { label: 'Submissions Received', value: overview?.total_submissions_received || 0, to: '/dashboard/teacher/submissions/' },
              { label: 'Revision Materials', value: revisionsList.length, to: '/dashboard/student/materials/' },
            ].map((card) => (
              <button key={card.label} onClick={() => navigate(card.to)} className="cursor-pointer">
                <div
                  className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full"
                  style={{ backgroundColor: 'var(--sa-surface)' }}
                >
                  <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">{card.label}</p>
                  <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{card.value}</p>
                </div>
              </button>
            ))}
          </div>

          <div
            className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 rounded-2xl w-full"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">Quick Actions</h3>
            <div className="flex flex-wrap gap-3 w-full">
              <button
                onClick={() => navigate('/dashboard/teacher/assignments')}
                className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Post Assignment
              </button>
              <button
                onClick={() => navigate('/dashboard/teacher/exams')}
                className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Create Exam
              </button>
              <button
                onClick={() => navigate('/dashboard/teacher/materials')}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Upload Revision Material
              </button>
              <button
                onClick={() => navigate('/dashboard/teacher/submissions')}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Grade Submissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE & GEOFENCE TAB */}
      {activeTab === 'attendance' && (
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
          <div
            className="sa-card border border-[#c77dff] space-y-6 shadow-xs p-6 sm:p-10 rounded-2xl w-full max-w-4xl mx-auto"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div className="border-b border-[#c77dff]/20 pb-4">
              <h2 className="text-lg font-bold text-[#10002b]">School Compound Geofenced Attendance</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">
                Verify your location within the school premises to clock in or out.
              </p>
            </div>

            <div className="space-y-6 w-full max-w-2xl">
              <div>
                <label className="block text-xs font-bold mb-2 text-[#10002b]">Enter TSC Number</label>
                <input
                  type="text"
                  placeholder="e.g. TSC123456"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:ring-2 focus:ring-[#7b2cbf]/30"
                />
              </div>

              <div className="p-4 rounded-xl border border-[#c77dff]/40 bg-gray-50 text-xs text-center font-bold text-[#10002b]">
                Status: {statusText}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => runGeoFence('IN')}
                  disabled={geoLoading}
                  className="flex-1 py-3.5 bg-[#10002b] text-white font-bold rounded-xl text-xs hover:bg-[#10002b]/70 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {geoLoading ? 'Checking...' : 'Clock In'}
                </button>
                <button
                  onClick={() => runGeoFence('OUT')}
                  disabled={geoLoading}
                  className="flex-1 py-3.5 bg-[#10002b] text-white font-bold rounded-xl text-xs hover:bg-[#10002b]/70 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {geoLoading ? 'Checking...' : 'Clock Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVISION MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div
            className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-lg font-bold text-[#10002b]">Upload Revision Material</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">
                Upload study guides and revision documents for your students.
              </p>
            </div>

            <form onSubmit={handlePostRevision} className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Title</label>
                <input
                  type="text"
                  placeholder="Title (e.g. Grade 8 Maths Revision Guide)"
                  value={revisionForm.title}
                  onChange={(e) => setRevisionForm({ ...revisionForm, title: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Description</label>
                <textarea
                  rows="4"
                  placeholder="Instructions or topic summary..."
                  value={revisionForm.description}
                  onChange={(e) => setRevisionForm({ ...revisionForm, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Target Class</label>
                <input
                  type="text"
                  placeholder="Target Class (e.g. Grade 8)"
                  value={revisionForm.class_name}
                  onChange={(e) => setRevisionForm({ ...revisionForm, class_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Attach Material Document</label>
                <input
                  type="file"
                  onChange={(e) => setRevisionForm({ ...revisionForm, file: e.target.files[0] })}
                  className="w-full text-xs text-[#10002b]/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#10002b] file:text-white hover:file:bg-[#c77dff] hover:file:text-[#10002b] cursor-pointer"
                />
              </div>
              <button type="submit" className={primaryBtn}>
                Upload Revision Material
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div
            className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-lg font-bold text-[#10002b]">Post New Assignment</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">Fill out the details below to publish an assignment.</p>
            </div>

            <form onSubmit={handlePostAssignment} className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Assign Teacher</label>
                <select
                  value={assignmentForm.teacher}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Select Teacher...</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Title</label>
                <input
                  type="text"
                  placeholder="Title (e.g. Maths Assignment 1)"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Instructions</label>
                <textarea
                  rows="4"
                  placeholder="Instructions..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Deadline</label>
                <input
                  type="datetime-local"
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Target Class</label>
                <input
                  type="text"
                  placeholder="Target Class (e.g. Grade 8)"
                  value={assignmentForm.class_name}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, class_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Attach Reference File / PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
                  className="w-full text-xs text-[#10002b]/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#10002b] file:text-white hover:file:bg-[#c77dff]"
                />
              </div>
              <button type="submit" className={primaryBtn}>
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div
            className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full"
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-lg font-bold text-[#10002b]">Create New Exam</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">Set up exam specifications and upload the paper.</p>
            </div>

            <form onSubmit={handlePostExam} className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Exam Title</label>
                <input
                  type="text"
                  placeholder="Exam Title (e.g. Midterm Physics)"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Term</label>
                <input
                  type="text"
                  placeholder="Term (e.g. Term 1)"
                  value={examForm.term}
                  onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Exam Description</label>
                <input
                  type="text"
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="Enter description..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Attach Exam Paper PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setExamForm({ ...examForm, file: e.target.files[0] })}
                  className="w-full text-xs text-[#10002b]/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#10002b] file:text-white hover:file:bg-[#c77dff]"
                />
              </div>
              <button type="submit" className={primaryBtn}>
                Publish Exam
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSIONS & GRADING TAB */}
      {activeTab === 'submissions' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">Student Submissions & Grading</h2>
            <button
              onClick={fetchAllSubmissions}
              className="sa-btn-secondary py-2 px-3 text-xs bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] transition-all rounded-xl cursor-pointer font-bold"
            >
              Refresh Submissions
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-[#10002b]/70">Loading submissions...</p>
          ) : (
            <div className="space-y-8 w-full">
              {/* Assignment submissions */}
              <div className="space-y-4 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-[#c77dff]/60 text-[#10002b]">
                  Assignment Submissions & Review
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-[#10002b]/70">No assignment submissions found.</p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={`assignment-sub-${sub.id}`}
                      className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 rounded-2xl w-full bg-white"
                      style={{ backgroundColor: 'var(--sa-surface)' }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider bg-[#10002b] text-[#c77dff]">
                              Learning Area: {sub.learning_area || 'General'}
                            </span>
                            <span className="text-xs font-bold text-[#10002b]">
                              Task: {sub.assignment_title || `Assignment ID ${sub.assignment}`}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#10002b]">
                            Submitted by Student: {sub.student_name || sub.student_username || `ID ${sub.student}`}
                          </p>

                          <div className="p-3.5 rounded-xl border border-[#c77dff]/60 text-xs bg-gray-50 space-y-1 w-full max-h-48 overflow-y-auto">
                            <span className="font-bold block text-[#10002b] uppercase text-[10px]">
                              Student Typed Responses / Notes:
                            </span>
                            <p className="whitespace-pre-wrap font-mono text-[#10002b]/85">
                              {renderStudentAnswers(sub)}
                            </p>
                          </div>

                          {sub.file && (
                            <div className="space-y-1">
                              <span className="font-bold text-[10px] uppercase text-[#10002b]">Attached Answer File:</span>
                              <a
                                href={fileHref(sub)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-600 underline block"
                              >
                                Open Attached Submission PDF in New Tab
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Grading & feedback inputs */}
                        <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#c77dff] bg-gray-50 shadow-xs min-w-[280px]">
                          <div>
                            <label className="block text-[10px] font-bold mb-1 text-[#10002b]">Award Marks / Grade</label>
                            <input
                              type="text"
                              placeholder={sub.grade || 'e.g. 85% or A'}
                              value={grades[sub.id] !== undefined ? grades[sub.id] : sub.grade || ''}
                              onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                              className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold mb-1 text-[#10002b]">
                              Teacher Qualitative Review / Feedback
                            </label>
                            <textarea
                              rows="3"
                              placeholder="Write review comments..."
                              value={
                                gradeDescriptions[sub.id] !== undefined
                                  ? gradeDescriptions[sub.id]
                                  : sub.grade_description || ''
                              }
                              onChange={(e) => setGradeDescriptions({ ...gradeDescriptions, [sub.id]: e.target.value })}
                              className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleGradeSubmit(sub.id)}
                            className="sa-btn-primary py-2 px-4 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            Save Marks & Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Exam submissions */}
              <div className="space-y-4 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-[#c77dff]/60 text-[#10002b]">
                  Exam Submissions
                </h3>
                {examSubmissions.length === 0 ? (
                  <p className="text-xs text-[#10002b]/70">No exam submissions found.</p>
                ) : (
                  examSubmissions.map((sub) => (
                    <div
                      key={`exam-sub-${sub.id}`}
                      className="sa-card border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full bg-white"
                      style={{ backgroundColor: 'var(--sa-surface)' }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <div className="space-y-3 w-full">
                          <span className="text-xs font-bold text-[#10002b]">
                            Exam: {sub.exam_title || `Exam ID ${sub.exam}`}
                          </span>
                          <p className="text-xs font-bold text-[#10002b]">
                            Submitted by Student: {sub.student_name || sub.student_username || `ID ${sub.student}`}
                          </p>
                          <div className="p-3.5 rounded-xl border border-[#c77dff]/60 text-xs bg-gray-50 w-full max-h-48 overflow-y-auto">
                            <p className="whitespace-pre-wrap font-mono text-[#10002b]/85">
                              {renderStudentAnswers(sub)}
                            </p>
                          </div>
                          {sub.file && (
                            <a
                              href={fileHref(sub)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 underline block"
                            >
                              Open Attached Submission PDF in New Tab
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#c77dff] bg-gray-50 shadow-xs min-w-[280px]">
                          <label className="block text-[10px] font-bold text-[#10002b]">Exam Score</label>
                          <input
                            type="text"
                            placeholder="e.g. 78"
                            value={
                              examGrades[sub.id] !== undefined
                                ? examGrades[sub.id]
                                : sub.score ?? sub.grade ?? ''
                            }
                            onChange={(e) => setExamGrades({ ...examGrades, [sub.id]: e.target.value })}
                            className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                          />
                          <button
                            onClick={() => handleExamGradeSubmit(sub.id)}
                            className="sa-btn-primary py-2 px-4 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            Save Exam Score
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLASS MARKS GRID TAB */}
      {activeTab === 'marks' && (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c77dff]/30 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#10002b]">Class Marks Entry</h2>
              <p className="text-xs text-[#10002b]/70">
                Record marks across all 9 subjects, then save them for the selected class and term.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
              <button onClick={handlePdfReportExport} className={smallBtn}>
                Export PDF Report
              </button>
              <button
                onClick={handleBulkSaveMarks}
                disabled={savingMarks}
                className="px-4 py-2 bg-[#c77dff] text-[#10002b] rounded-md text-xs font-extrabold hover:bg-[#10002b] hover:text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {savingMarks ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>
          </div>

          {marksMessage && (
            <div className="p-3 bg-[#c77dff]/20 text-[#10002b] text-xs font-bold rounded-md border border-[#c77dff] flex flex-wrap items-center justify-between gap-3">
              <span>{marksMessage}</span>
              <button
                onClick={() => navigate('/dashboard/teacher/analysis')}
                className="px-3 py-1.5 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition cursor-pointer"
              >
                View analysis
              </button>
            </div>
          )}
          {marksError && (
            <div className="p-3 bg-[#10002b] text-[#c77dff] text-xs font-bold rounded-md border border-[#c77dff]">
              {marksError}
            </div>
          )}

          {marksLoading ? (
            <p className="text-xs text-[#10002b] py-6 text-center font-bold">Loading grade entry sheet...</p>
          ) : studentsTable.length === 0 && !marksError ? (
            <p className="text-xs text-[#10002b]/70 py-6 text-center">No students found for {className}.</p>
          ) : (
            <div className="overflow-x-auto border border-[#10002b] rounded-md shadow-sm">
              <table className="min-w-full divide-y divide-[#c77dff]/30 text-xs">
                <thead className="bg-[#10002b] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Adm No</th>
                    <th className="px-4 py-3 text-left font-bold">Student Name</th>
                    {subjects.map((sub) => (
                      <th key={sub.key} className="px-3 py-3 text-center font-bold">
                        {sub.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10002b]/20 bg-white">
                  {studentsTable.map((student) => (
                    <tr key={student.student_id} className="hover:bg-[#c77dff]/10">
                      <td className="px-4 py-3 font-semibold text-[#10002b]">{student.admission_number}</td>
                      <td className="px-4 py-3 font-medium text-[#10002b]">{student.student_name}</td>
                      {subjects.map((sub) => (
                        <td key={sub.key} className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={student.marks[sub.key] ?? ''}
                            onChange={(e) => handleGridMarkChange(student.student_id, sub.key, e.target.value)}
                            className="w-16 px-2 py-1 text-center border border-[#10002b]/30 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#c77dff] text-[#10002b] font-semibold"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CLASS ANALYSIS REPORT TAB */}
      {activeTab === 'analysis' && (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c77dff]/30 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#10002b]">Class Performance & Analysis Report</h2>
              <p className="text-xs text-[#10002b]/70">
                Review rankings, subject means, and grade levels (EE, ME, AE, BE).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
              <button onClick={handlePdfReportExport} className={smallBtn}>
                Download PDF Report
              </button>
            </div>
          </div>

          {analysisError && (
            <div className="p-3 bg-[#10002b] text-[#c77dff] text-xs font-bold rounded-md border border-[#c77dff]">
              {analysisError}
            </div>
          )}

          {analysisLoading ? (
            <p className="text-xs text-[#10002b] py-6 text-center font-bold">
              Computing ranks and analyzing student performance...
            </p>
          ) : analysisData && analysisData.student_performance_table.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#c77dff] rounded-md space-y-3">
              <p className="text-xs text-[#10002b] font-bold">
                No marks saved for {className}, {term} yet.
              </p>
              <button
                onClick={() => navigate('/dashboard/teacher/marks')}
                className="px-4 py-2 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition cursor-pointer"
              >
                Enter marks
              </button>
            </div>
          ) : analysisData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#c77dff]/10 border border-[#c77dff] rounded-md">
                  <p className="text-xs font-bold text-[#10002b]/70">Total Class Mean</p>
                  <p className="text-lg font-extrabold text-[#10002b]">{analysisData.total_class_mean}</p>
                </div>
                <div className="p-4 bg-[#c77dff]/10 border border-[#c77dff] rounded-md">
                  <p className="text-xs font-bold text-[#10002b]/70">Term / Year</p>
                  <p className="text-lg font-extrabold text-[#10002b]">
                    {analysisData.term} - {analysisData.year}
                  </p>
                </div>
                <div className="p-4 bg-[#c77dff]/10 border border-[#c77dff] rounded-md">
                  <p className="text-xs font-bold text-[#10002b]/70">Total Students Evaluated</p>
                  <p className="text-lg font-extrabold text-[#10002b]">
                    {analysisData.student_performance_table.length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#10002b] rounded-md shadow-sm">
                <table className="min-w-full divide-y divide-[#c77dff]/30 text-xs">
                  <thead className="bg-[#10002b] text-white">
                    <tr>
                      <th className="px-3 py-3 text-left font-bold">Rank</th>
                      <th className="px-3 py-3 text-left font-bold">Adm No</th>
                      <th className="px-3 py-3 text-left font-bold">Student Name</th>
                      {analysisData.subject_columns.map((sub) => (
                        <th
                          key={sub}
                          className="px-3 py-3 text-center font-bold border-l border-white/20"
                          colSpan="2"
                        >
                          {sub.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center font-bold border-l border-white/20">Total</th>
                    </tr>
                    <tr className="bg-[#10002b] text-white/80 text-[10px]">
                      <th colSpan="3"></th>
                      {analysisData.subject_columns.map((sub) => (
                        <React.Fragment key={`${sub}-subheaders`}>
                          <th className="px-1 py-1 text-center border-l border-white/10">Score</th>
                          <th className="px-1 py-1 text-center">Level</th>
                        </React.Fragment>
                      ))}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#10002b]/20 bg-white">
                    {analysisData.student_performance_table.map((student) => (
                      <tr key={student.admission_number} className="hover:bg-[#c77dff]/10">
                        <td className="px-3 py-2 font-extrabold text-[#10002b]">#{student.rank}</td>
                        <td className="px-3 py-2 font-semibold text-[#10002b]/80">{student.admission_number}</td>
                        <td className="px-3 py-2 font-medium text-[#10002b]">{student.name}</td>
                        {analysisData.subject_columns.map((sub) => {
                          const subData = student.subjects[sub] || { score: 0, level: 'BE' };
                          return (
                            <React.Fragment key={sub}>
                              <td className="px-2 py-2 text-center border-l border-[#10002b]/20 text-[#10002b]">
                                {subData.score}
                              </td>
                              <td className="px-2 py-2 text-center font-extrabold text-[#10002b] bg-[#c77dff]/10">
                                {subData.level}
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-extrabold text-[#10002b] border-l border-[#10002b]/20 bg-[#c77dff]/20">
                          {student.total_marks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#10002b] text-white font-bold">
                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-right">
                        SUBJECT MEANS:
                      </td>
                      {analysisData.subject_columns.map((sub) => (
                        <td key={sub} colSpan="2" className="px-2 py-3 text-center border-l border-white/20">
                          {analysisData.subject_means[sub] || 0.0}
                        </td>
                      ))}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* CLASS ANALYTICS TAB (subject means + level distribution) */}
      {activeTab === 'analytics' && (
        <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c77dff]/30 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#10002b]">Class Analytics</h2>
              <p className="text-xs text-[#10002b]/70">Subject means and level distribution for the selected class.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
            </div>
          </div>

          {analysisError && (
            <div className="p-3 bg-[#10002b] text-[#c77dff] text-xs font-bold rounded-md border border-[#c77dff]">
              {analysisError}
            </div>
          )}

          {analysisLoading ? (
            <p className="text-xs text-[#10002b] py-6 text-center font-bold">Loading analytics...</p>
          ) : analysisData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">Subject means</h3>
                {analysisData.subject_columns.map((sub) => {
                  const mean = analysisData.subject_means[sub] || 0;
                  return (
                    <div key={sub} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#10002b]">
                        <span className="font-semibold">{sub.replace(/_/g, ' ')}</span>
                        <span className="font-extrabold">{mean}</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#c77dff]/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10002b] rounded-full"
                          style={{ width: `${Math.min(Math.max(mean, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">
                  Level distribution (all subjects)
                </h3>
                {(() => {
                  const counts = levelCounts();
                  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
                  return Object.entries(counts).map(([level, count]) => (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#10002b]">
                        <span className="font-semibold">{level}</span>
                        <span className="font-extrabold">{count}</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#c77dff]/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7b2cbf] rounded-full"
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
                <p className="text-[11px] text-[#10002b]/60">
                  EE 90+, ME 70-89, AE 40-69, BE below 40.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
