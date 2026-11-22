import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePagination, Pagination } from './Pagination';

const API_BASE = import.meta.env.VITE_API_URL || 'https://smartcademic-project.onrender.com';
const API = `${API_BASE}/api/teachers`;
const HOST = `${API_BASE}`;

const getStoredToken = () =>
  localStorage.getItem('access_token') || localStorage.getItem('access') || '';

const buildAuthConfig = (tokenOverride) => {
  const token = tokenOverride || getStoredToken();
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

const clearStoredTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('refresh');
};

const describeError = (err, fallback) => {
  const status = err.response?.status;
  const data = err.response?.data;
  const detail =
    (data && typeof data === 'object' && (data.detail || data.error || data.message)) || '';
  if (status) return `${fallback} (HTTP ${status}${detail ? `: ${detail}` : ''})`;
  return `${fallback} (${err.message})`;
};

// ---------- Accepted file types & client-side check ----------
const ACCEPTED_DOC_TYPES = ['.pdf', '.ppt', '.pptx'];

const validateFileType = (file, allowedExts = ['.pdf']) => {
  if (!file) return { ok: true };
  const lower = file.name.toLowerCase();
  const valid = allowedExts.some((ext) => lower.endsWith(ext));
  if (!valid) {
    return {
      ok: false,
      message: `Unsupported file type "${file.name}". Allowed formats: ${allowedExts.join(', ')}.`,
    };
  }
  return { ok: true };
};

const ACCEPTED_LOGO_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

const isBlank = (val) =>
  val === null || val === undefined || String(val).trim() === '';

// ---------- Shared class strings ----------
const inputClass =
  'w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]';
const primaryBtn =
  'sa-btn-primary w-full py-3.5 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer font-bold rounded-xl mt-2';
const selectClass =
  'w-full sm:w-auto px-3 py-2 sm:py-1.5 border border-[#10002b] rounded-md text-xs font-semibold text-[#10002b] bg-white focus:outline-none focus:ring-2 focus:ring-[#c77dff]';
const smallBtn =
  'w-full sm:w-auto px-4 py-2 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition shadow-sm cursor-pointer';
const cardClass =
  'sa-card border border-[#c77dff] shadow-xs rounded-2xl w-full';
const fileInputClass =
  'w-full text-xs text-[#10002b]/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#10002b] file:text-white hover:file:bg-[#c77dff] hover:file:text-[#10002b] cursor-pointer';
const bannerClass =
  'sa-card border border-[#c77dff] shadow-xs p-4 sm:p-6 rounded-2xl w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between';
const gradingPanelClass =
  'flex flex-col gap-3 p-4 rounded-xl border border-[#c77dff] bg-gray-50 shadow-xs w-full md:w-72 md:shrink-0';
const errorBoxClass =
  'p-3 bg-[#10002b] text-[#c77dff] text-xs font-bold rounded-md border border-[#c77dff] break-words';
const hintClass = 'text-[11px] font-medium text-[#10002b]/70 mt-1.5';
const fileErrorClass = 'text-[11px] font-bold text-red-600 mt-1.5 break-words';

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

export default function TeacherDashboard({
  token: propToken,
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Token: prop first, then whatever is stored in localStorage
  const getToken = () => propToken || getStoredToken();
  const authConfig = () => buildAuthConfig(propToken);

  const handleAuthFailure = (err) => {
    if (err.response?.status === 401) {
      clearStoredTokens();
      navigate('/signin', {
        replace: true,
        state: { message: 'Your session expired. Please sign in again.' },
      });
      return true;
    }
    return false;
  };

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
    if (path.includes('/reports')) return 'reports';
    return 'overview';
  };

  // Tab ids used inside this component, mapped to their routes.
  const TAB_ROUTES = {
    overview: '/dashboard/teacher/overview',
    materials: '/dashboard/teacher/revisions',
    assignments: '/dashboard/teacher/assignments',
    exams: '/dashboard/teacher/exams',
    submissions: '/dashboard/teacher/submissions',
    marks: '/dashboard/teacher/marks',
    analysis: '/dashboard/teacher/analysis',
    analytics: '/dashboard/teacher/analytics',
    attendance: '/dashboard/teacher/attendance',
    reports: '/dashboard/teacher/reports',
  };
  // Alternative names a parent might use for the same tab
  const TAB_ALIASES = { revisions: 'materials', grading: 'submissions', geo: 'attendance' };

  // If a parent controls the tab, use it; otherwise follow the URL
  const routeTab = getActiveTab();
  const activeTab = controlledTab ? TAB_ALIASES[controlledTab] || controlledTab : routeTab;

  // One way to switch tabs: tell the parent (if it controls the tab) and update the URL
  const goToTab = (tab) => {
    const id = TAB_ALIASES[tab] || tab;
    if (setControlledTab) setControlledTab(id === 'materials' ? 'revisions' : id);
    // Always update the URL too, so the sidebar, refresh and back button stay in sync
    navigate(TAB_ROUTES[id] || TAB_ROUTES.overview);
  };

  // ---------- General state ----------
  const [teachersList, setTeachersList] = useState([]);
  const [overview, setOverview] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [revisionsList, setRevisionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashError, setDashError] = useState('');

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

  // ---------- File validation state ----------
  const [fileError, setFileError] = useState('');
  // Bumped after a successful post so uncontrolled file inputs reset visually
  const [fileInputKey, setFileInputKey] = useState(0);

  // ---------- AI assistive marking state ----------
  const [markingKey, setMarkingKey] = useState(null);
  const [manualReviewFlags, setManualReviewFlags] = useState({});
  const [examFeedback, setExamFeedback] = useState({});

  // ---------- Report forms state ----------
  const [year, setYear] = useState(new Date().getFullYear());
  const [useDefaultTemplate, setUseDefaultTemplate] = useState(true);
  const [templateFile, setTemplateFile] = useState(null);
  const [aiEditInstruction, setAiEditInstruction] = useState('');
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reportError, setReportError] = useState('');

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

  // ---------- Pagination ----------
  const assignmentSubsPager = usePagination(submissions, 5);
  const examSubsPager = usePagination(examSubmissions, 5);
  const marksPager = usePagination(studentsTable, 15);
  const analysisPager = usePagination(analysisData?.student_performance_table ?? [], 15);

  // ---------- Fetchers ----------
  const fetchTeachers = async () => {
    setDashError('');
    try {
      const res = await axios.get(`${API}/list/`, authConfig());
      setTeachersList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setDashError(describeError(err, 'Failed to load teachers list'));
    }
  };

  const fetchRevisions = async () => {
    setDashError('');
    try {
      const res = await axios.get(`${API}/revisions/`, authConfig());
      setRevisionsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setDashError(describeError(err, 'Failed to load revision materials'));
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/classes/`, authConfig());
      const list = Array.isArray(res.data) ? res.data : [];
      setClasses(list);
      if (list.length > 0 && !list.some((c) => c.name === className)) {
        setClassName(list[0].name);
      }
    } catch (err) {
      if (handleAuthFailure(err)) return;
      const msg = describeError(err, 'Could not load the class list');
      setMarksError(msg);
      setAnalysisError(msg);
      setReportError(msg);
    }
  };

  const fetchOverview = async () => {
    setDashError('');
    try {
      const res = await axios.get(`${API}/overview/`, authConfig());
      setOverview(res.data);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setDashError(describeError(err, 'Failed to load overview'));
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
          const objectUrl = URL.createObjectURL(blob);
          blobMap[fileUrl] = objectUrl;
          blobMap[sub.id] = objectUrl;
        } catch (err) {
          if (handleAuthFailure(err)) return;
          console.error(`Failed to load file for submission ${sub.id}:`, err);
        }
      }
    }
    setPdfBlobs((prev) => ({ ...prev, ...blobMap }));
  };

  const fetchAllSubmissions = async () => {
    setLoading(true);
    setDashError('');
    try {
      const [assignmentRes, examRes] = await Promise.all([
        axios.get(`${API}/assignment-submissions/`, authConfig()),
        axios.get(`${API}/exam-submissions/`, authConfig()),
      ]);
      const assignList = Array.isArray(assignmentRes.data) ? assignmentRes.data : [];
      const examList = Array.isArray(examRes.data) ? examRes.data : [];
      setSubmissions(assignList);
      setExamSubmissions(examList);
      await loadPdfBlobs(assignList);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setDashError(describeError(err, 'Failed to load submissions'));
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
      setSubjects(res.data.subjects || []);
      setStudentsTable(res.data.students_table || []);
    } catch (err) {
      if (handleAuthFailure(err)) return;
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
      if (handleAuthFailure(err)) return;
      setAnalysisError(describeError(err, 'Could not load class analysis'));
      setAnalysisData(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (!getToken()) {
      navigate('/signin', { replace: true });
      return;
    }
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

  useEffect(() => {
    if (!['marks', 'analysis', 'analytics', 'reports'].includes(activeTab)) return undefined;
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

  useEffect(() => {
    marksPager.setPage(1);
    analysisPager.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, term]);

  // Clear any file error when switching tabs
  useEffect(() => {
    setFileError('');
  }, [activeTab]);

  // Load saved report template config when opening the Report Forms tab
  useEffect(() => {
    if (activeTab !== 'reports') return;
    setReportMessage('');
    setReportError('');
    const loadTemplateConfig = async () => {
      try {
        const res = await axios.get(`${API}/reports/template/`, authConfig());
        setUseDefaultTemplate(Boolean(res.data?.use_default_template));
      } catch (err) {
        if (handleAuthFailure(err)) return;
        // Non-fatal: keep the default template selected
      }
    };
    loadTemplateConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- File picker helper ----------
  const pickFile = (e, allowedExts, onValid) => {
    const file = e.target.files?.[0] || null;
    const check = validateFileType(file, allowedExts);
    if (!check.ok) {
      setFileError(check.message);
      e.target.value = ''; // clear the rejected file from the input
      onValid(null);
      return;
    }
    setFileError('');
    onValid(file);
  };

  // ---------- Post handlers ----------
  const handlePostAssignment = async (e) => {
    e.preventDefault();
    const check = validateFileType(assignmentForm.file, ['.pdf']);
    if (!check.ok) { setFileError(check.message); return; }

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
      setFileError('');
      setFileInputKey((k) => k + 1);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Failed to post assignment'));
    }
  };

  const handlePostExam = async (e) => {
    e.preventDefault();
    const check = validateFileType(examForm.file, ['.pdf']);
    if (!check.ok) { setFileError(check.message); return; }

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
      setFileError('');
      setFileInputKey((k) => k + 1);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Failed to post exam'));
    }
  };

  const handlePostRevision = async (e) => {
    e.preventDefault();
    const check = validateFileType(revisionForm.file, ACCEPTED_DOC_TYPES);
    if (!check.ok) { setFileError(check.message); return; }

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
      setFileError('');
      setFileInputKey((k) => k + 1);
      fetchRevisions();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Failed to upload revision material'));
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
          grade: gradeVal,
          grade_description: descVal || '',
        },
        authConfig()
      );
      alert('Score and review saved successfully!');
      fetchAllSubmissions();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Failed to save score'));
    }
  };

  const handleExamGradeSubmit = async (submissionId) => {
    const gradeVal = examGrades[submissionId];
    if (!gradeVal) {
      alert('Please enter an exam score.');
      return;
    }
    try {
      await axios.patch(
        `${API}/exam-submissions/${submissionId}/grade/`,
        { score: gradeVal, grade: gradeVal, grade_description: examFeedback[submissionId] || '' },
        authConfig()
      );
      alert('Exam score saved successfully!');
      fetchAllSubmissions();
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Failed to save exam score'));
    }
  };

  // ---------- AI assistive marking ----------
  const handleAIDraftMark = async (submissionId, kind) => {
    const key = `${kind}-${submissionId}`;
    setMarkingKey(key);
    try {
      const res = await axios.post(
        `${API}/submissions/ai-mark/`,
        { submission_id: submissionId, submission_type: kind, max_score: 100 },
        authConfig()
      );
      const data = res.data || {};
      if (kind === 'exam') {
        setExamGrades((prev) => ({ ...prev, [submissionId]: data.suggested_score ?? '' }));
        setExamFeedback((prev) => ({ ...prev, [submissionId]: data.feedback ?? '' }));
      } else {
        setGrades((prev) => ({ ...prev, [submissionId]: data.suggested_score ?? '' }));
        setGradeDescriptions((prev) => ({ ...prev, [submissionId]: data.feedback ?? '' }));
      }
      setManualReviewFlags((prev) => ({ ...prev, [key]: Boolean(data.needs_manual_review) }));
    } catch (err) {
      if (handleAuthFailure(err)) return;
      alert(describeError(err, 'Could not generate AI draft mark'));
    } finally {
      setMarkingKey(null);
    }
  };

  // ---------- Report forms ----------
  // withAi = false -> Option 1 (school default layout, optional logo)
  // withAi = true  -> Option 2 (apply the AI layout instruction)
  const handleSaveTemplate = async (withAi) => {
    const check = validateFileType(templateFile, ACCEPTED_LOGO_EXTS);
    if (!check.ok) { setFileError(check.message); return; }
    if (withAi && !aiEditInstruction.trim()) return;

    setReportsLoading(true);
    setReportMessage('');
    setReportError('');
    try {
      const formData = new FormData();
      // Option 1 selects the school default; Option 2 keeps whichever template is currently saved
      formData.append('use_default_template', String(withAi ? useDefaultTemplate : true));
      if (!withAi && templateFile) formData.append('logo_file', templateFile);
      if (withAi) formData.append('ai_edit_instruction', aiEditInstruction.trim());

      const res = await axios.post(`${API}/reports/template/`, formData, {
        headers: { ...authConfig().headers, 'Content-Type': 'multipart/form-data' },
      });
      setUseDefaultTemplate(Boolean(res.data?.use_default_template));
      if (withAi) {
        setAiEditInstruction('');
      } else {
        setTemplateFile(null);
        setFileInputKey((k) => k + 1);
      }
      setFileError('');
      setReportMessage(
        withAi
          ? 'AI layout edit applied to the report form.'
          : templateFile
          ? 'School default layout selected and logo saved.'
          : 'School default report layout selected.'
      );
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setReportError(describeError(err, 'Could not update the report layout'));
    } finally {
      setReportsLoading(false);
    }
  };

  const handleGenerateReports = async () => {
    if (!className) {
      setReportError('Select a class first.');
      return;
    }
    setReportsLoading(true);
    setReportMessage('');
    setReportError('');
    try {
      const res = await axios.post(
        `${API}/reports/generate/`,
        { class_name: className, term, year: Number(year) },
        authConfig()
      );
      const list = Array.isArray(res.data?.reports) ? res.data.reports : [];
      setGeneratedReports(list);
      setReportMessage(`Generated ${list.length} student report form(s) for ${className} (${term}).`);
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setReportError(describeError(err, 'Could not generate report forms'));
    } finally {
      setReportsLoading(false);
    }
  };

  const handleExportReportPDFs = () => {
    if (!generatedReports.length) return;
    const win = window.open('', '_blank', 'width=920,height=720');
    if (!win) {
      setReportError('Allow pop-ups in your browser to export report PDFs.');
      return;
    }
    const body = generatedReports
      .map(
        (r, idx) =>
          `<div style="${idx > 0 ? 'page-break-before: always;' : ''} margin-bottom: 20px;">${r.rendered_html}</div>`
      )
      .join('');
    win.document.write(
      `<html><head><title>${className} - ${term} Report Forms</title></head><body>${body}</body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
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
          if (handleAuthFailure(error)) return;
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
      if (handleAuthFailure(err)) return;
      setMarksError(describeError(err, 'Failed to save marks'));
    } finally {
      setSavingMarks(false);
    }
  };

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
      if (handleAuthFailure(err)) return;
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

  const renderAIDraftRow = (kind, sub) => {
    const key = `${kind}-${sub.id}`;
    const needsManual = Boolean(manualReviewFlags[key] || sub.ai_needs_manual_review);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={markingKey === key}
          onClick={() => handleAIDraftMark(sub.id, kind)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c77dff]/25 text-[#10002b] hover:bg-[#c77dff] transition cursor-pointer disabled:opacity-50"
        >
          {markingKey === key ? 'Drafting...' : 'AI Draft Mark'}
        </button>
        {needsManual && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#c77dff]/25 text-[#10002b]">
            Manual Review Suggested
          </span>
        )}
      </div>
    );
  };

  // Unmarked submissions, used by the marking reminder

  const unmarkedAssignmentsCount = submissions.filter((sub) => isBlank(sub.grade)).length;
  const unmarkedExamsCount = examSubmissions.filter(
    (sub) => isBlank(sub.score) && isBlank(sub.grade)
  ).length;
  const totalUnmarkedCount = unmarkedAssignmentsCount + unmarkedExamsCount;

  return (
    <div
      className="flex-1 min-w-0 pt-20 px-4 pb-6 sm:px-6 lg:pt-8 lg:px-8 overflow-y-auto min-h-screen font-sans space-y-6"
      style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}
    >
      {dashError && <div className={errorBoxClass}>{dashError}</div>}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full">
          <div className={bannerClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10002b]">Teacher Overview Dashboard</h2>
              <p className="text-xs mt-1 text-[#10002b]/70">
                Quick summary of your assignments, exams, and student submissions.
              </p>
            </div>
          </div>

          {/* Marking reminder banner */}
          {totalUnmarkedCount > 0 && (
            <div className="p-4 rounded-2xl border border-[#c77dff] bg-[#c77dff]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">
                  Marking Reminder
                </p>
                <p className="text-xs font-semibold text-[#10002b] mt-0.5">
                  You have {totalUnmarkedCount} unmarked submission{totalUnmarkedCount > 1 ? 's' : ''} (
                  {unmarkedAssignmentsCount} assignment{unmarkedAssignmentsCount === 1 ? '' : 's'} and{' '}
                  {unmarkedExamsCount} exam{unmarkedExamsCount === 1 ? '' : 's'}). Marking promptly helps learners get their results sooner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToTab('submissions')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition cursor-pointer shrink-0"
              >
                Mark Now
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {[
              {
                label: 'Assignments Posted',
                value: overview?.total_assignments_posted || 0,
                actionLabel: 'Add Assignment',
                to: 'assignments',
              },
              {
                label: 'Exams Created',
                value: overview?.total_exams_created || 0,
                actionLabel: 'Add Exam',
                to: 'exams',
              },
              {
                label: 'Submissions Received',
                value: overview?.total_submissions_received || 0,
                actionLabel: 'View Submissions',
                to: 'submissions',
              },
              {
                label: 'Revision Materials',
                value: revisionsList.length,
                actionLabel: 'Add Materials',
                to: 'revisions',
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`${cardClass} p-5 flex flex-col justify-between gap-4`}
                style={{ backgroundColor: 'var(--sa-surface)' }}
              >
                <div>
                  <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{card.value}</p>
                </div>

                <button
                  type="button"
                  onClick={() => goToTab(card.to)}
                  className="w-full py-2.5 px-3 rounded-md bg-[#c77dff]/20 border border-[#c77dff] text-[#10002b] hover:bg-[#10002b] hover:text-white transition-all text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  {card.actionLabel}
                </button>
              </div>
            ))}
          </div>

          <div
            className={`${cardClass} space-y-4 p-4 sm:p-6`}
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 w-full">
              <button
                type="button"
                onClick={() => goToTab('assignments')}
                className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Post Assignment
              </button>
              <button
                type="button"
                onClick={() => goToTab('exams')}
                className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Create Exam
              </button>
              <button
                type="button"
                onClick={() => goToTab('revisions')}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Upload Revision Material
              </button>
              <button
                type="button"
                onClick={() => goToTab('submissions')}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Grade Submissions
              </button>
              <button
                type="button"
                onClick={() => goToTab('reports')}
                className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
              >
                Generate Report Forms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE & GEOFENCE TAB */}
      {activeTab === 'attendance' && (
        <div className="w-full py-2 sm:py-6">
          <div
            className={`${cardClass} space-y-6 p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto`}
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div className="border-b border-[#c77dff]/20 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#10002b]">
                School Compound Geofenced Attendance
              </h2>
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

              <div className="p-4 rounded-xl border border-[#c77dff]/40 bg-gray-50 text-xs text-center font-bold text-[#10002b] break-words">
                Status: {statusText}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => runGeoFence('IN')}
                  disabled={geoLoading}
                  className="flex-1 py-3.5 bg-[#10002b] text-white font-bold rounded-xl text-xs hover:bg-[#10002b]/70 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {geoLoading ? 'Checking...' : 'Clock In'}
                </button>
                <button
                  type="button"
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
        <div className="w-full space-y-6">
          <div
            className={`${cardClass} space-y-4 p-4 sm:p-8`}
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#10002b]">Upload Revision Material</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">
                Upload study guides and revision documents for your students. Mwalimu AI reads these notes to guide learners during revision.
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
                  key={`rev-file-${fileInputKey}`}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) =>
                    pickFile(e, ACCEPTED_DOC_TYPES, (f) => setRevisionForm({ ...revisionForm, file: f }))
                  }
                  className={fileInputClass}
                />
                <p className={hintClass}>
                  Accepted file types: PDF (.pdf) for assignments and exams; PDF (.pdf) or PPT/PPTX (.ppt, .pptx) for revision materials. Other formats are not accepted.
                </p>
                {fileError && <p className={fileErrorClass}>{fileError}</p>}
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
        <div className="w-full space-y-6">
          <div
            className={`${cardClass} space-y-4 p-4 sm:p-8`}
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#10002b]">Post New Assignment</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">
                  Attach Reference File / PDF
                </label>
                <input
                  key={`assign-file-${fileInputKey}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    pickFile(e, ['.pdf'], (f) => setAssignmentForm({ ...assignmentForm, file: f }))
                  }
                  className={fileInputClass}
                />
                <p className={hintClass}>Accepted file type: PDF (.pdf) only.</p>
                {fileError && <p className={fileErrorClass}>{fileError}</p>}
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
        <div className="w-full space-y-6">
          <div
            className={`${cardClass} space-y-4 p-4 sm:p-8`}
            style={{ backgroundColor: 'var(--sa-surface)' }}
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#10002b]">Create New Exam</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">Set up exam specifications and upload the paper.</p>
            </div>

            <form onSubmit={handlePostExam} className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  key={`exam-file-${fileInputKey}`}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => pickFile(e, ['.pdf'], (f) => setExamForm({ ...examForm, file: f }))}
                  className={fileInputClass}
                />
                <p className={hintClass}>Accepted file type: PDF (.pdf) only.</p>
                {fileError && <p className={fileErrorClass}>{fileError}</p>}
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
        <div className="w-full space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-[#10002b]">Student Submissions & Grading</h2>
            <button
              type="button"
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
              <div className="space-y-4 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-[#c77dff]/60 text-[#10002b]">
                  Assignment Submissions & Review
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-[#10002b]/70">No assignment submissions found.</p>
                ) : (
                  assignmentSubsPager.pageItems.map((sub) => (
                    <div
                      key={`assignment-sub-${sub.id}`}
                      className={`${cardClass} space-y-4 p-4 sm:p-6 bg-white`}
                      style={{ backgroundColor: 'var(--sa-surface)' }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-4 w-full">
                        <div className="space-y-3 w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider bg-[#10002b] text-[#c77dff]">
                              Learning Area: {sub.learning_area || ' '}
                            </span>
                            <span className="text-xs font-bold text-[#10002b] break-words">
                              Task: {sub.assignment_title || `Assignment ID ${sub.assignment}`}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#10002b] break-words">
                            Submitted by Student: {sub.student_name || sub.student_username || `ID ${sub.student}`}
                          </p>

                          <div className="p-3.5 rounded-xl border border-[#c77dff]/60 text-xs bg-gray-50 space-y-1 w-full max-h-48 overflow-y-auto">
                            <span className="font-bold block text-[#10002b] uppercase text-[10px]">
                              Student Typed Responses / Notes:
                            </span>
                            <p className="whitespace-pre-wrap break-words font-mono text-[#10002b]/85">
                              {renderStudentAnswers(sub)}
                            </p>
                          </div>

                          {sub.file && (
                            <div className="space-y-1">
                              <span className="font-bold text-[10px] uppercase text-[#10002b]">
                                Attached Answer File:
                              </span>
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

                        <div className={gradingPanelClass}>
                          {renderAIDraftRow('assignment', sub)}
                          <div>
                            <label className="block text-[10px] font-bold mb-1 text-[#10002b]">
                              Award Marks / Grade
                            </label>
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
                              onChange={(e) =>
                                setGradeDescriptions({ ...gradeDescriptions, [sub.id]: e.target.value })
                              }
                              className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGradeSubmit(sub.id)}
                            className="sa-btn-primary py-2.5 px-4 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            Save Marks & Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Pagination pager={assignmentSubsPager} pageSizeOptions={[5, 10, 25]} />
              </div>

              <div className="space-y-4 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-[#c77dff]/60 text-[#10002b]">
                  Exam Submissions
                </h3>
                {examSubmissions.length === 0 ? (
                  <p className="text-xs text-[#10002b]/70">No exam submissions found.</p>
                ) : (
                  examSubsPager.pageItems.map((sub) => (
                    <div
                      key={`exam-sub-${sub.id}`}
                      className={`${cardClass} p-4 sm:p-6 bg-white`}
                      style={{ backgroundColor: 'var(--sa-surface)' }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-4 w-full">
                        <div className="space-y-3 w-full min-w-0">
                          <span className="text-xs font-bold text-[#10002b] break-words block">
                            Exam: {sub.exam_title || `Exam ID ${sub.exam}`}
                          </span>
                          <p className="text-xs font-bold text-[#10002b] break-words">
                            Submitted by Student: {sub.student_name || sub.student_username || `ID ${sub.student}`}
                          </p>
                          <div className="p-3.5 rounded-xl border border-[#c77dff]/60 text-xs bg-gray-50 w-full max-h-48 overflow-y-auto">
                            <p className="whitespace-pre-wrap break-words font-mono text-[#10002b]/85">
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

                        <div className={gradingPanelClass}>
                          {renderAIDraftRow('exam', sub)}
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
                          <label className="block text-[10px] font-bold text-[#10002b]">
                            Feedback / Remarks
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Review AI draft feedback or write your own..."
                            value={
                              examFeedback[sub.id] !== undefined
                                ? examFeedback[sub.id]
                                : sub.grade_description || ''
                            }
                            onChange={(e) => setExamFeedback({ ...examFeedback, [sub.id]: e.target.value })}
                            className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleExamGradeSubmit(sub.id)}
                            className="sa-btn-primary py-2.5 px-4 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            Save Exam Score
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Pagination pager={examSubsPager} pageSizeOptions={[5, 10, 25]} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT FORMS TAB */}
      {activeTab === 'reports' && (
        <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md space-y-6 w-full min-w-0">
          <div className={bannerClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10002b]">AI Student Report Forms</h2>
              <p className="text-xs text-[#10002b]/70">
                Uses saved class marks and class rankings. Starts with the Ngegu Primary &amp; Junior School default layout, with optional logo and optional AI layout editing.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full md:w-auto">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full sm:w-24 px-3 py-2 sm:py-1.5 border border-[#10002b] rounded-md text-xs font-semibold text-[#10002b] bg-white focus:outline-none focus:ring-2 focus:ring-[#c77dff]"
              />
              <button
                type="button"
                onClick={handleGenerateReports}
                disabled={reportsLoading}
                className={`${smallBtn} disabled:opacity-50`}
              >
                {reportsLoading ? 'Working...' : 'Generate Report Forms'}
              </button>
            </div>
          </div>

          {reportMessage && (
            <div className="p-3 bg-[#c77dff]/20 text-[#10002b] text-xs font-bold rounded-md border border-[#c77dff] break-words">
              {reportMessage}
            </div>
          )}
          {reportError && <div className={errorBoxClass}>{reportError}</div>}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 pt-4 border-t border-[#c77dff]/30">
            {/* Option 1: Primary Default School Template & Logo */}
            <div className="p-3.5 border border-[#d8b4fe] rounded-lg bg-[#faf5ff] space-y-2.5">
              <div className="font-bold text-[#10002b] text-sm">
                Option 1 (Default): Ngegu Primary &amp; Junior School Report Layout
              </div>
              <p className="text-xs text-gray-600">
                Keeps the official school header, logo, CBC grading scale, and class ranks automatically.
              </p>

              {/* Logo Image Insertion Spot: Current / Selected Logo Preview */}
              <div className="flex items-center gap-3 p-2.5 bg-white border border-[#e9d5ff] rounded-md">
                <img
                  src={templateFile ? URL.createObjectURL(templateFile) : '/images/logo.jpg'}
                  alt="Ngegu Primary & Junior School Logo"
                  className="w-12 h-12 object-contain rounded border border-gray-200 bg-white shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#10002b]">
                    Upload School Logo (PNG/JPG — optional)
                  </div>
                  <input
                    key={`logo-file-${fileInputKey}`}
                    type="file"
                    accept={ACCEPTED_LOGO_EXTS.join(',')}
                    onChange={(e) => pickFile(e, ACCEPTED_LOGO_EXTS, setTemplateFile)}
                    className={`${fileInputClass} mt-1`}
                  />
                </div>
              </div>

              <p className={hintClass}>
                Place your default crest at <code>public/images/logo.jpg</code> or upload an image (PNG, JPG, JPEG, WEBP).
              </p>
              {fileError && <p className={fileErrorClass}>{fileError}</p>}

              <div className="pt-1 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSaveTemplate(false)}
                  disabled={reportsLoading}
                  className="bg-[#10002b] text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#c77dff] hover:text-[#10002b] transition disabled:opacity-50"
                >
                  Use School Default / Save Logo
                </button>
              </div>
            </div>

            {/* Option 2: Optional AI Layout Adjustment */}
            <div className="p-3.5 border border-gray-200 rounded-[10px] bg-white">
              <div className="font-bold text-[#10002b] mb-1.5 text-sm">
                Option 2 (Optional): Customize Layout with AI
              </div>
              <textarea
                rows={3}
                value={aiEditInstruction}
                onChange={(e) => setAiEditInstruction(e.target.value)}
                placeholder="Optional: e.g. Add a parent signature line at the bottom"
                className="w-full p-2 rounded-lg border border-gray-300 text-xs text-[#10002b] focus:outline-none focus:border-[#10002b]"
              />
              <button
                type="button"
                disabled={!aiEditInstruction.trim() || reportsLoading}
                onClick={() => handleSaveTemplate(true)}
                className="mt-2.5 bg-[#6b21a8] text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Apply AI Edit (Option 2)
              </button>
            </div>
          </div>

          {generatedReports.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#c77dff]/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-extrabold text-[#10002b]">
                  Generated Student Reports ({generatedReports.length})
                </p>
                <button
                  type="button"
                  onClick={handleExportReportPDFs}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c77dff] text-[#10002b] hover:bg-[#10002b] hover:text-white transition cursor-pointer"
                >
                  Export PDFs
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {generatedReports.map((r, idx) => (
                  <div
                    key={r.student_id || idx}
                    className="rounded-xl border border-[#c77dff]/50 p-3 bg-gray-50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#10002b]">{r.name}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#c77dff]/25 text-[#10002b]">
                        Mean: {r.mean_score}%
                      </span>
                    </div>
                    <p className="text-xs text-[#10002b]">{r.class_teacher_comment}</p>
                    <p className="text-[11px] text-[#10002b]/70">
                      <strong>Improvement:</strong> {r.areas_for_improvement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLASS MARKS GRID TAB */}
      {activeTab === 'marks' && (
        <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md space-y-6 w-full min-w-0">
          <div className={bannerClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10002b]">Class Marks Entry</h2>
              <p className="text-xs text-[#10002b]/70">
                Record marks across all 9 subjects, then save them for the selected class and term.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full md:w-auto">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
              <button type="button" onClick={handlePdfReportExport} className={smallBtn}>
                Export PDF Report
              </button>
              <button
                type="button"
                onClick={handleBulkSaveMarks}
                disabled={savingMarks}
                className="w-full sm:w-auto px-4 py-2 bg-[#c77dff] text-[#10002b] rounded-md text-xs font-extrabold hover:bg-[#10002b] hover:text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {savingMarks ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>
          </div>

          {marksMessage && (
            <div className="p-3 bg-[#c77dff]/20 text-[#10002b] text-xs font-bold rounded-md border border-[#c77dff] flex flex-wrap items-center justify-between gap-3">
              <span>{marksMessage}</span>
              <button
                type="button"
                onClick={() => goToTab('analysis')}
                className="px-3 py-1.5 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition cursor-pointer"
              >
                View analysis
              </button>
            </div>
          )}
          {marksError && <div className={errorBoxClass}>{marksError}</div>}

          {marksLoading ? (
            <p className="text-xs text-[#10002b] py-6 text-center font-bold">Loading grade entry sheet...</p>
          ) : studentsTable.length === 0 && !marksError ? (
            <p className="text-xs text-[#10002b]/70 py-6 text-center">No students found for {className}.</p>
          ) : (
            <div className="overflow-x-auto border border-[#10002b] rounded-md shadow-sm max-w-full">
              <table className="min-w-full divide-y divide-[#c77dff]/30 text-xs">
                <thead className="bg-[#10002b] text-white">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold whitespace-nowrap">Adm No</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-bold whitespace-nowrap sticky left-0 z-10 bg-[#10002b]">
                      Student Name
                    </th>
                    {subjects.map((sub) => (
                      <th key={sub.key} className="px-3 py-3 text-center font-bold whitespace-nowrap">
                        {sub.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10002b]/20 bg-white">
                  {marksPager.pageItems.map((student) => (
                    <tr key={student.student_id} className="hover:bg-[#c77dff]/10">
                      <td className="px-3 sm:px-4 py-3 font-semibold text-[#10002b] whitespace-nowrap">
                        {student.admission_number}
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-medium text-[#10002b] whitespace-nowrap sticky left-0 z-10 bg-white">
                        {student.student_name}
                      </td>
                      {subjects.map((sub) => (
                        <td key={sub.key} className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            inputMode="decimal"
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
          {!marksLoading && <Pagination pager={marksPager} pageSizeOptions={[10, 15, 30, 50]} />}
        </div>
      )}

      {/* CLASS ANALYSIS REPORT TAB */}
      {activeTab === 'analysis' && (
        <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md space-y-6 w-full min-w-0">
          <div className={bannerClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10002b]">
                Class Performance & Analysis Report
              </h2>
              <p className="text-xs text-[#10002b]/70">
                Review rankings, subject means, and grade levels (EE, ME, AE, BE).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full md:w-auto">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
              <button type="button" onClick={handlePdfReportExport} className={smallBtn}>
                Download PDF Report
              </button>
            </div>
          </div>

          {analysisError && <div className={errorBoxClass}>{analysisError}</div>}

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
                type="button"
                onClick={() => goToTab('marks')}
                className="px-4 py-2 bg-[#10002b] text-white rounded-md text-xs font-bold hover:bg-[#c77dff] hover:text-[#10002b] transition cursor-pointer"
              >
                Enter marks
              </button>
            </div>
          ) : analysisData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div className="overflow-x-auto border border-[#10002b] rounded-md shadow-sm max-w-full">
                <table className="min-w-full divide-y divide-[#c77dff]/30 text-xs">
                  <thead className="bg-[#10002b] text-white">
                    <tr>
                      <th className="px-3 py-3 text-left font-bold">Rank</th>
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Adm No</th>
                      <th className="px-3 py-3 text-left font-bold whitespace-nowrap">Student Name</th>
                      {analysisData.subject_columns.map((sub) => (
                        <th
                          key={sub}
                          className="px-3 py-3 text-center font-bold border-l border-white/20 whitespace-nowrap"
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
                    {analysisPager.pageItems.map((student) => (
                      <tr key={student.admission_number} className="hover:bg-[#c77dff]/10">
                        <td className="px-3 py-2 font-extrabold text-[#10002b]">#{student.rank}</td>
                        <td className="px-3 py-2 font-semibold text-[#10002b]/80 whitespace-nowrap">
                          {student.admission_number}
                        </td>
                        <td className="px-3 py-2 font-medium text-[#10002b] whitespace-nowrap">{student.name}</td>
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
                      <td colSpan="3" className="px-3 py-3 text-right whitespace-nowrap">
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
              <Pagination pager={analysisPager} pageSizeOptions={[10, 15, 30, 50]} />
              <p className="text-[11px] text-[#10002b]/60 sm:hidden">Swipe the table sideways to see all subjects.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* CLASS ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md space-y-6 w-full min-w-0">
          <div className={bannerClass} style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10002b]">Class Analytics</h2>
              <p className="text-xs text-[#10002b]/70">
                Subject means and level distribution for the selected class.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full md:w-auto">
              <ClassTermSelectors
                classes={classes}
                selectedClass={className}
                setSelectedClass={setClassName}
                term={term}
                setTerm={setTerm}
              />
            </div>
          </div>

          {analysisError && <div className={errorBoxClass}>{analysisError}</div>}

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
                      <div className="flex justify-between gap-2 text-xs text-[#10002b]">
                        <span className="font-semibold break-words">{sub.replace(/_/g, ' ')}</span>
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
                <p className="text-[11px] text-[#10002b]/60">EE 90+, ME 70-89, AE 40-69, BE below 40.</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
