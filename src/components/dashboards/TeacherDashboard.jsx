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
  const [gradeDescriptions, setGradeDescriptions] = useState({});
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
  const descVal = gradeDescriptions[submissionId];
  if (!gradeVal) {
    alert('Please enter a score / grade.');
    return;
  }
  try {
    await axios.patch(
      `http://127.0.0.1:8000/api/teachers/assignment-submissions/${submissionId}/grade/`,
      { 
        grade: gradeVal, // Change this to 'score' if your serializer uses 'score'
        grade_description: descVal || '' 
      },
      apiConfig
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
      await axios.patch(
        `http://127.0.0.1:8000/api/teachers/exams/submissions/${submissionId}/grade/`,
        { grade: gradeVal },
        apiConfig
      );
      alert('Exam score sent to student successfully!');
      fetchAllSubmissions();
    } catch (err) {
      console.error('Error saving exam score:', err);
      alert(JSON.stringify(err.response?.data) || 'Failed to save exam score.');
    }
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

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-screen font-sans space-y-6" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full px-4 sm:px-6">
          <div className="sa-banner sa-flex-between border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-xl font-extrabold text-[#10002b]">
                Teacher Overview Dashboard
              </h2>
              <p className="text-xs mt-1 text-[#10002b]/70">
                Quick summary of your assignments, exams, and student submissions.
              </p>
            </div>
          </div>

          <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <button onClick={() => navigate('/dashboard/student/assignments')} className='cursor-pointer'>
              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Assignments Posted</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{overview?.total_assignments_posted || 0}</p>
              </div>
            </button>
            <button onClick={() => navigate('/dashboard/student/exams')} className='cursor-pointer'>
              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Exams Created</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{overview?.total_exams_created || 0}</p>
              </div>
            </button>
            <button onClick={() => navigate('/dashboard/teacher/submissions/')} className='cursor-pointer'>
              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Submissions Received</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{overview?.total_submissions_received || 0}</p>
              </div>
            </button>
            <button onClick={() => navigate('/dashboard/student/materials/')} className='cursor-pointer'>
              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Revision Materials</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">{revisionsList.length}</p>
              </div>
            </button>
          </div>

          <div className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#10002b]">
              Quick Actions
            </h3>
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
    <div className="sa-card border border-[#c77dff] space-y-6 shadow-xs p-6 sm:p-10 rounded-2xl w-full max-w-4xl mx-auto" style={{ backgroundColor: 'var(--sa-surface)' }}>
      <div className="border-b border-[#c77dff]/20 pb-4">
        <h2 className="text-lg font-bold text-[#10002b]">School Compound Geofenced Attendance</h2>
        <p className="text-xs text-[#10002b]/70 mt-1">Verify your location within the school premises to clock in or out.</p>
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
          <div className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
            <div>
              <h2 className="text-lg font-bold text-[#10002b]">Upload Revision Material</h2>
              <p className="text-xs text-[#10002b]/70 mt-1">Upload study guides and revision documents for your students.</p>
            </div>

            <form onSubmit={handlePostRevision} className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Title</label>
                <input
                  type="text"
                  placeholder="Title (e.g. Grade 8 Maths Revision Guide)"
                  value={revisionForm.title}
                  onChange={(e) => setRevisionForm({ ...revisionForm, title: e.target.value })}
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Target Class</label>
                <input
                  type="text"
                  placeholder="Target Class (e.g. Grade 8)"
                  value={revisionForm.class_name}
                  onChange={(e) => setRevisionForm({ ...revisionForm, class_name: e.target.value })}
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
              <button type="submit" className="sa-btn-primary w-full py-3.5 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer font-bold rounded-xl mt-2">
                Upload Revision Material
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
                  required
                >
                  <option value="">Select Teacher...</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Deadline</label>
                <input 
                  type="datetime-local" 
                  value={assignmentForm.deadline} 
                  onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value })} 
                  required 
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Target Class</label>
                <input
                  type="text"
                  placeholder="Target Class (e.g. Grade 8)"
                  value={assignmentForm.class_name}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, class_name: e.target.value })}
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
              <button type="submit" className="sa-btn-primary w-full py-3.5 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer font-bold rounded-xl mt-2">
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="w-full space-y-6 px-4 sm:px-6">
          <div className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 sm:p-8 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
                  className="w-full p-3.5 text-xs rounded-xl border border-[#c77dff] bg-[#ffffff] text-[#10002b] focus:outline-none focus:border-[#10002b]"
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
              <button type="submit" className="sa-btn-primary w-full py-3.5 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer font-bold rounded-xl mt-2">
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
            <button onClick={fetchAllSubmissions} className="sa-btn-secondary py-2 px-3 text-xs bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] transition-all rounded-xl cursor-pointer font-bold">
              Refresh Submissions
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-[#10002b]/70">Loading submissions...</p>
          ) : (
            <div className="space-y-6 w-full">
              {/* Assignment Submissions */}
              <div className="space-y-4 w-full">
                <h3 className="text-xs font-extrabold uppercase tracking-wider pb-1 border-b border-[#c77dff]/60 text-[#10002b]">
                  Assignment Submissions & Review
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-[#10002b]/70">No assignment submissions found.</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={`assignment-sub-${sub.id}`} className="sa-card border border-[#c77dff] space-y-4 shadow-xs p-6 rounded-2xl w-full bg-white" style={{ backgroundColor: 'var(--sa-surface)' }}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider bg-[#10002b] text-[#c77dff]">
                              Learning Area: {sub.learning_area || 'General'}
                            </span>
                            <span className="text-xs font-bold text-[#10002b]">Task: {sub.assignment_title || `Assignment ID ${sub.assignment}`}</span>
                          </div>
                          <p className="text-xs font-bold text-[#10002b]">Submitted by Student: {sub.student_name || sub.student_username || `ID ${sub.student}`}</p>

                          {/* Scrollable Student Answers */}
                          <div className="p-3.5 rounded-xl border border-[#c77dff]/60 text-xs bg-gray-50 space-y-1 w-full max-h-48 overflow-y-auto">
                            <span className="font-bold block text-[#10002b] uppercase text-[10px]">Student Typed Responses / Notes:</span>
                            <p className="whitespace-pre-wrap font-mono text-[#10002b]/85">{renderStudentAnswers(sub)}</p>
                          </div>

                          {/* PDF Document Viewer if attached */}
                          {sub.file && (
                            <div className="space-y-1">
                              <span className="font-bold text-[10px] uppercase text-[#10002b]">Attached Answer File:</span>
                              <a 
                                href={pdfBlobs[sub.id] || (sub.file.startsWith('http') ? sub.file : `http://127.0.0.1:8000${sub.file}`)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-600 underline block"
                              >
                                Open Attached Submission PDF in New Tab
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Grading & Feedback Inputs */}
                        <div className="flex flex-col gap-3 p-4 rounded-xl border border-[#c77dff] bg-gray-50 shadow-xs min-w-[280px]">
                          <div>
                            <label className="block text-[10px] font-bold mb-1 text-[#10002b]">Award Marks / Grade</label>
                            <input
                              type="text"
                              placeholder={sub.grade || 'e.g. 85% or A'}
                              value={grades[sub.id] !== undefined ? grades[sub.id] : (sub.grade || '')}
                              onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                              className="w-full p-2 text-xs border border-[#c77dff] rounded-lg bg-white text-[#10002b] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold mb-1 text-[#10002b]">Teacher Qualitative Review / Feedback</label>
                            <textarea
                              rows="3"
                              placeholder="Write review comments..."
                              value={gradeDescriptions[sub.id] !== undefined ? gradeDescriptions[sub.id] : (sub.grade_description || '')}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}