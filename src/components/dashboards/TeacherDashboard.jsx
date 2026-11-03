import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/revisions') || path.includes('/materials')) return 'materials';
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/exams')) return 'exams';
    if (path.includes('/submissions') || path.includes('/grading')) return 'submissions';
    if (path.includes('/attendance') || path.includes('/geo')) return 'attendance';
    if (path.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const [teachersList, setTeachersList] = useState([]);
  const [overview, setOverview] = useState(null);
  
  const [submissions, setSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [revisionsList, setRevisionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState({});
  const [examGrades, setExamGrades] = useState({});

  const [pdfBlobs, setPdfBlobs] = useState({});

  const [assignmentForm, setAssignmentForm] = useState({ 
    title: '', 
    description: '', 
    class_name: '', 
    deadline: '', 
    teacher: '', 
    file: null 
  });
  
  const [examForm, setExamForm] = useState({ 
    title: '', 
    term: '', 
    description: '', 
    duration_mins: 60, 
    start_time: '', 
    end_time: '', 
    file: null 
  });

  const [revisionForm, setRevisionForm] = useState({
    title: '',
    description: '',
    class_name: '',
    file: null
  });

  // Geofence Attendance states
  const [teacherId, setTeacherId] = useState('');
  const [statusText, setStatusText] = useState('Click the button to check');
  const [geoLoading, setGeoLoading] = useState(false);

  const apiConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/teachers/list/', apiConfig);
      setTeachersList(res.data);
    } catch (err) {
      console.error('Failed to load teachers list:', err);
    }
  };

  const fetchRevisions = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/teachers/revisions/', apiConfig);
      setRevisionsList(res.data);
    } catch (err) {
      console.error('Failed to load revision materials:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchTeachers();
    }
    if (activeTab === 'materials') {
      fetchRevisions();
    }
    if (activeTab === 'overview') {
      fetchOverview();
      fetchAllSubmissions();
      fetchRevisions();
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/teachers/overview/', apiConfig);
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
          const fileUrl = sub.file.startsWith('http') ? sub.file : `http://127.0.0.1:8000${sub.file}`;
          const response = await axios.get(fileUrl, {
            ...apiConfig,
            responseType: 'blob',
          });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          blobMap[sub.id] = URL.createObjectURL(blob);
        } catch (err) {
          console.error(`Failed to load blob for submission ${sub.id}:`, err);
        }
      }
    }
    setPdfBlobs((prev) => ({ ...prev, ...blobMap }));
  };

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const [assignmentRes, examRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/teachers/assignment-submissions/', apiConfig),
        axios.get('http://127.0.0.1:8000/api/teachers/exam-submissions/', apiConfig)
      ]);
      setSubmissions(assignmentRes.data);
      setExamSubmissions(examRes.data);
      
      await loadPdfBlobs([...assignmentRes.data, ...examRes.data]);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') fetchAllSubmissions();
  }, [activeTab, location.pathname]);

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
      await axios.post('http://127.0.0.1:8000/api/teachers/assignment/', formData, {
        headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' },
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
      await axios.post('http://127.0.0.1:8000/api/teachers/exam/', formData, {
        headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' },
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
      await axios.post('http://127.0.0.1:8000/api/teachers/revisions/', formData, {
        headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Revision material uploaded successfully!');
      setRevisionForm({ title: '', description: '', class_name: '', file: null });
      fetchRevisions();
    } catch (err) {
      console.error('Error posting revision:', err.response?.data || err);
      alert(JSON.stringify(err.response?.data) || 'Failed to upload revision material.');
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    const gradeVal = grades[submissionId];
    if (!gradeVal) {
      alert('Please enter a score.');
      return;
    }
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/teachers/submissions/${submissionId}/grade/`,
        { grade: gradeVal },
        apiConfig
      );
      alert('Score saved successfully!');
      fetchAllSubmissions();
    } catch (err) {
      console.error('Error saving score:', err);
      alert('Failed to save score.');
    }
  };

  const handleExamGradeSubmit = async (submissionId) => {
    const gradeVal = examGrades[submissionId];

    if (!gradeVal) {
      alert('Please enter a score.');
      return;
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/teachers/exams/submissions/${submissionId}/grade/`,
        { marks: gradeVal },
        apiConfig
      );
      alert('Exam score sent to student successfully!');
      fetchAllSubmissions();
    } catch (err) {
      console.error('Error saving exam score:', err);
      alert(JSON.stringify(err.response?.data) || 'Failed to save exam score.');
    }
  };

  const renderStudentAnswers = (sub) => {
    let rawText = sub.content;
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

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          let userLat = position.coords.latitude;
          let userLon = position.coords.longitude;

          const response = await axios.post(
            'http://127.0.0.1:8000/api/teachers/attendance/',
            {
              tsc_number: teacherId,
              direction: statusDirect,
              latitude: userLat,
              longitude: userLon
            },
            apiConfig
          );

          if (response.status === 200 || response.status === 201) {
            setStatusText(`Success! Clocked ${statusDirect}`);
          }
        } catch (error) {
          console.error('API Error:', error.response?.data || error);
          const backendMsg = error.response?.data?.message || error.response?.data?.error;
          if (backendMsg) {
            setStatusText(backendMsg);
          } else {
            setStatusText('You are outside the school compound');
          }
        } finally {
          setGeoLoading(false);
        }
      },
      (gpsError) => {
        setStatusText('GPS ERROR! permission blocked');
        setGeoLoading(false);
      },
      geoOptions
    );
  };

  return (
  <div className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen font-sans space-y-6">
    
    {/* OVERVIEW TAB */}
    {activeTab === 'overview' && (
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Banner Header */}
        <div className="sa-banner sa-flex-between">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--sa-green-dark)' }}>
              Teacher Overview Dashboard
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--sa-muted)' }}>
              Quick summary of your assignments, exams, and student submissions.
            </p>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="sa-grid">
          <div className="sa-card">
            <p className="sa-card-title">Assignments Posted</p>
            <p className="sa-card-value">{overview?.total_assignments_posted || 0}</p>
          </div>
          <div className="sa-card">
            <p className="sa-card-title">Exams Created</p>
            <p className="sa-card-value">{overview?.total_exams_created || 0}</p>
          </div>
          <div className="sa-card">
            <p className="sa-card-title">Submissions Received</p>
            <p className="sa-card-value">{overview?.total_submissions_received || 0}</p>
          </div>
          <div className="sa-card">
            <p className="sa-card-title">Revision Materials</p>
            <p className="sa-card-value">{revisionsList.length}</p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="sa-card space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--sa-muted)' }}>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/dashboard/teacher/assignments')} 
              className="sa-btn-primary"
            >
              Post Assignment
            </button>
            <button 
              onClick={() => navigate('/dashboard/teacher/exams')} 
              className="sa-btn-primary"
            >
              Create Exam
            </button>
            <button 
              onClick={() => navigate('/dashboard/teacher/revisions')} 
              className="sa-btn-secondary"
            >
              Upload Revision Material
            </button>
            <button 
              onClick={() => navigate('/dashboard/teacher/submissions')} 
              className="sa-btn-secondary"
            >
              Grade Submissions
            </button>
          </div>
        </div>

        {/* Recent Student Submissions */}
        <div className="sa-card space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--sa-muted)' }}>
            Recent Student Submissions
          </h3>
          {submissions.length === 0 && examSubmissions.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>No recent student submissions found.</p>
          ) : (
            <div className="space-y-2">
              {[...submissions, ...examSubmissions].slice(0, 4).map((sub, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span>
                    <strong className="font-bold text-slate-800">Student ID {sub.student}</strong> submitted {sub.assignment ? `Assignment ID ${sub.assignment}` : `Exam ID ${sub.exam}`}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--sa-green-light)', color: 'var(--sa-green-dark)' }}>
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* REVISION MATERIALS TAB */}
    {activeTab === 'materials' && (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="sa-card space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Upload Revision Material</h2>
          <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>
            Upload study guides and revision documents for your students.
          </p>

          <form onSubmit={handlePostRevision} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Title</label>
              <input
                type="text"
                placeholder="Title (e.g. Grade 8 Maths Revision Guide)"
                value={revisionForm.title}
                onChange={(e) => setRevisionForm({ ...revisionForm, title: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Description</label>
              <textarea
                rows="3"
                placeholder="Instructions or topic summary..."
                value={revisionForm.description}
                onChange={(e) => setRevisionForm({ ...revisionForm, description: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Target Class</label>
              <input
                type="text"
                placeholder="Target Class (e.g. Grade 8)"
                value={revisionForm.class_name}
                onChange={(e) => setRevisionForm({ ...revisionForm, class_name: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Attach Material Document</label>
              <input
                type="file"
                onChange={(e) => setRevisionForm({ ...revisionForm, file: e.target.files[0] })}
                className="w-full text-xs text-slate-500"
              />
            </div>
            <button type="submit" className="sa-btn-primary w-full py-3">
              Upload Revision Material
            </button>
          </form>
        </div>

        {/* Uploaded Revisions List */}
        <div className="sa-card space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Uploaded Revision Materials</h3>
          {revisionsList.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>No revision materials uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {revisionsList.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{rev.title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--sa-muted)' }}>{rev.description}</p>
                  </div>
                  {rev.file && (
                    <a
                      href={rev.file.startsWith('http') ? rev.file : `http://127.0.0.1:8000${rev.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sa-btn-secondary py-1 px-3 text-xs"
                    >
                      View File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* ASSIGNMENTS TAB */}
    {activeTab === 'assignments' && (
      <div className="max-w-xl mx-auto sa-card space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Post New Assignment</h2>
        <form onSubmit={handlePostAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Assign Teacher</label>
            <select
              value={assignmentForm.teacher}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
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
            <label className="block text-xs font-bold mb-1 text-slate-700">Title</label>
            <input
              type="text"
              placeholder="Title (e.g. Maths Assignment 1)"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Instructions</label>
            <textarea
              rows="3"
              placeholder="Instructions..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Deadline</label>
            <input 
              type="datetime-local" 
              value={assignmentForm.deadline} 
              onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value })} 
              required 
              className='w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400'
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Target Class</label>
            <input
              type="text"
              placeholder="Target Class (e.g. Grade 8)"
              value={assignmentForm.class_name}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, class_name: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Attach Reference File / PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500"
            />
          </div>
          <button type="submit" className="sa-btn-primary w-full py-3">
            Publish Assignment
          </button>
        </form>
      </div>
    )}

    {/* EXAMS TAB */}
    {activeTab === 'exams' && (
      <div className="max-w-xl mx-auto sa-card space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Create New Exam</h2>
        <form onSubmit={handlePostExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Exam Title</label>
            <input
              type="text"
              placeholder="Exam Title (e.g. Midterm Physics)"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Term</label>
            <input
              type="text"
              placeholder="Term (e.g. Term 1)"
              value={examForm.term}
              onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Exam Description</label>
            <input 
              type="text" 
              value={examForm.description} 
              onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
              placeholder="Enter description..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Attach Exam Paper PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setExamForm({ ...examForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500"
            />
          </div>
          <button type="submit" className="sa-btn-primary w-full py-3">
            Publish Exam
          </button>
        </form>
      </div>
    )}

    {/* SUBMISSIONS & GRADING TAB */}
    {activeTab === 'submissions' && (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-slate-800">Student Submissions & Grading</h2>
          <button onClick={fetchAllSubmissions} className="sa-btn-secondary">
            Refresh Submissions
          </button>
        </div>

        {loading ? (
          <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>Loading submissions...</p>
        ) : (
          <div className="space-y-6">
            
            {/* Assignment Submissions */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-slate-200" style={{ color: 'var(--sa-muted)' }}>
                Assignment Submissions
              </h3>
              {submissions.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>No assignment submissions found.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={`assignment-sub-${sub.id}`} className="sa-card space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2 w-full max-w-lg">
                        <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider" style={{ backgroundColor: 'var(--sa-green-light)', color: 'var(--sa-green-dark)' }}>
                          Assignment ID: {sub.assignment}
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Student ID: {sub.student}</p>
                        
                        <div className="p-3.5 rounded-xl border border-slate-100 text-xs bg-slate-50 space-y-1">
                          <span className="font-bold block text-slate-700">Student Typed Response:</span>
                          <p className="whitespace-pre-wrap text-slate-600">{sub.content || 'No text content provided.'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-xs">
                        <div>
                          <label className="block text-[10px] font-bold mb-1 text-slate-500">Score</label>
                          <input
                            type="text"
                            placeholder={sub.grade || 'Score'}
                            value={grades[sub.id] || ''}
                            onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                            className="w-20 p-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                        <button
                          onClick={() => handleGradeSubmit(sub.id)}
                          className="mt-4 sa-btn-primary py-2 px-3 text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {sub.file && (
                      <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden p-3 bg-slate-50">
                        <p className="text-xs font-bold mb-2 text-slate-700">Attached Student PDF:</p>
                        {pdfBlobs[sub.id] ? (
                          <object
                            data={pdfBlobs[sub.id]}
                            type="application/pdf"
                            className="w-full h-96 rounded-lg border border-slate-200"
                          >
                            <p className="text-xs p-4">
                              PDF preview unavailable.{' '}
                              <a href={pdfBlobs[sub.id]} target="_blank" rel="noopener noreferrer" className="underline font-bold text-sky-600">
                                Download PDF
                              </a>
                            </p>
                          </object>
                        ) : (
                          <p className="text-xs p-4 text-slate-400">Loading PDF preview...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Exam Submissions */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-slate-200" style={{ color: 'var(--sa-muted)' }}>
                Exam Submissions
              </h3>
              {examSubmissions.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--sa-muted)' }}>No exam submissions found.</p>
              ) : (
                examSubmissions.map((sub) => (
                  <div key={`exam-sub-${sub.id}`} className="sa-card space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-2 w-full max-w-lg">
                        <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider" style={{ backgroundColor: 'var(--sa-green-light)', color: 'var(--sa-green-dark)' }}>
                          Exam ID: {sub.exam}
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Student ID: {sub.student}</p>
                        
                        <div className="p-3.5 rounded-xl border border-slate-100 text-xs bg-slate-50 space-y-1">
                          <span className="font-bold block text-slate-700">Student Typed Exam Answers:</span>
                          <p className="whitespace-pre-wrap text-slate-600">{renderStudentAnswers(sub)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-xs">
                        <div>
                          <label className="block text-[10px] font-bold mb-1 text-slate-500">Score</label>
                          <input
                            type="text"
                            placeholder={sub.grade || 'Score'}
                            value={examGrades[sub.id] || ''}
                            onChange={(e) => setExamGrades({ ...examGrades, [sub.id]: e.target.value })}
                            className="w-20 p-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400"
                          />
                        </div>
                        <button
                          onClick={() => handleExamGradeSubmit(sub.id)}
                          className="mt-4 sa-btn-primary py-2 px-3 text-xs"
                        >
                          Send Score
                        </button>
                      </div>
                    </div>

                    {sub.file && (
                      <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden p-3 bg-slate-50">
                        <p className="text-xs font-bold mb-2 text-slate-700">Attached Answer Sheet PDF:</p>
                        {pdfBlobs[sub.id] ? (
                          <object
                            data={pdfBlobs[sub.id]}
                            type="application/pdf"
                            className="w-full h-96 rounded-lg border border-slate-200"
                          >
                            <p className="text-xs p-4">
                              PDF preview unavailable.{' '}
                              <a href={pdfBlobs[sub.id]} target="_blank" rel="noopener noreferrer" className="underline font-bold text-sky-600">
                                Download PDF
                              </a>
                            </p>
                          </object>
                        ) : (
                          <p className="text-xs p-4 text-slate-400">Loading PDF preview...</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    )}

    {/* GEOFENCE ATTENDANCE TAB */}
    {activeTab === 'attendance' && (
      <div className="max-w-md mx-auto sa-card text-center space-y-6 my-8">
        <div>
          <h2 className="font-extrabold text-xl text-slate-800">Teacher Attendance Checker</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--sa-muted)' }}>
            Enter your exact registered TSC Number to record your daily clock-in/out.
          </p>
        </div>

        <div className="text-left">
          <label htmlFor="teacherId" className="block text-xs font-bold mb-1 text-slate-700">
            Enter your TSC Number
          </label>
          <input
            className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-400 font-mono font-bold text-slate-800"
            type="text"
            id="teacherId"
            placeholder="e.g. 8000"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        </div>

        <div className="flex justify-center items-center flex-col space-y-4">
          <button
            onClick={() => runGeoFence('in')}
            disabled={geoLoading}
            className="sa-btn-primary rounded-full px-8 py-3 text-xs shadow-md transition-all disabled:opacity-50"
          >
            {geoLoading ? 'Checking Location...' : 'Clock In / Out'}
          </button>
          
          {statusText && (
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 w-full">
              <h3 id="status" className="text-xs font-semibold text-slate-700">{statusText}</h3>
            </div>
          )}
        </div>
      </div>
    )}

  </div>
);
}