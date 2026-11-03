import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, BookOpenCheck, FileText, GraduationCap, 
  CheckCircle2, Clock, Award, AlertCircle, Download, Send, Loader2 
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to CDN for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Helper to format full file URLs
const getFullUrl = (filePath) => {
  if (!filePath) return '';
  return filePath.startsWith('http') ? filePath : `http://127.0.0.1:8000${filePath}`;
};

// --- COUNTDOWN TIMER COMPONENT ---
function ExamTimer({ durationMins, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(durationMins * 60);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUpRef.current) onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMins]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold">
      <Clock size={16} />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}

// --- EMBEDDED PDF CANVAS VIEWER ---
function PdfCanvasViewer({ fileUrl }) {
  const [localBlobUrl, setLocalBlobUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let blobUrl = null;

    const fetchBlob = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(fileUrl, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        });

        if (!isMounted) return;

        const fileBlob = new Blob([response.data], { type: 'application/pdf' });
        blobUrl = URL.createObjectURL(fileBlob);
        setLocalBlobUrl(blobUrl);
      } catch (err) {
        console.error('Error loading PDF blob:', err);
      }
    };

    if (fileUrl) fetchBlob();

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [fileUrl]);

  if (!localBlobUrl) {
    return <div className="h-96 flex items-center justify-center border rounded-xl text-xs">Loading document preview...</div>;
  }

  return (
    <object 
      data={localBlobUrl} 
      type="application/pdf" 
      className="w-full h-96 border rounded-xl"
    >
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2">
        <p className="text-xs">Unable to display PDF preview directly.</p>
        <a 
          href={localBlobUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-4 py-2 rounded-lg text-xs font-semibold border underline"
        >
          Open PDF in New Tab
        </a>
      </div>
    </object>
  );
}

export default function StudentDashboard() {
  const { subpage } = useParams();
  const activeTab = subpage || 'overview';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittedIds, setSubmittedIds] = useState([]);

  // Active Exam Taking States
  const [activeExam, setActiveExam] = useState(null);
  const [examTextAnswer, setExamTextAnswer] = useState('');
  const [examAnswerFile, setExamAnswerFile] = useState(null);

  const activeExamRef = useRef(activeExam);
  const examTextAnswerRef = useRef(examTextAnswer);
  const examAnswerFileRef = useRef(examAnswerFile);

  useEffect(() => {
    activeExamRef.current = activeExam;
    examTextAnswerRef.current = examTextAnswer;
    examAnswerFileRef.current = examAnswerFile;
  }, [activeExam, examTextAnswer, examAnswerFile]);

  const token = localStorage.getItem('access_token');
  const apiConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'overview' || !tab || tab === 'home') {
        const res = await axios.get('http://127.0.0.1:8000/api/students/overview/', apiConfig);
        setOverview(res.data);
      } else if (tab === 'materials') {
        const res = await axios.get('http://127.0.0.1:8000/api/students/materials/', apiConfig);
        setMaterials(res.data);
      } else if (tab === 'assignments') {
        const res = await axios.get('http://127.0.0.1:8000/api/students/assignments/', apiConfig);
        setAssignments(res.data);
      } else if (tab === 'exams') {
        const res = await axios.get('http://127.0.0.1:8000/api/students/exams/', apiConfig);
        setExams(res.data);
      } else if (tab === 'results') {
        const res = await axios.get('http://127.0.0.1:8000/api/students/my-assignment-submissions/', apiConfig);
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
      setError(err.response?.data?.detail || `Failed to load ${tab} data from the server.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (assignmentId) => {
    try {
      const formData = new FormData();
      formData.append('assignment', assignmentId);
      if (submissionContent) formData.append('content', submissionContent);
      if (selectedFile) formData.append('file', selectedFile);
      
      await axios.post(
        `http://127.0.0.1:8000/api/students/assignments/submit/`, 
        formData,
        { headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' } }
      );
      alert('Assignment submitted successfully!');
      setSubmittingId(null);
      setSubmissionContent('');
      setSelectedFile(null);
      setSubmittedIds((prev) => [...prev, assignmentId]);
      fetchTabData('assignments');
    } catch (err) {
      console.error('Submission failed:', err);
      alert(JSON.stringify(err.response?.data) || 'Failed to submit assignment.');
    }
  };

  const handleExamSubmit = async (examIdToSubmit) => {
    const targetExamId = examIdToSubmit || activeExamRef.current?.id;
    if (!targetExamId) return;

    try {
      const formData = new FormData();
      formData.append('exam', targetExamId);
      
      const textVal = examTextAnswerRef.current;
      const fileVal = examAnswerFileRef.current;

      const structuredAnswers = JSON.stringify({ response: textVal || "" });
      formData.append('answers_json', structuredAnswers);
      
      if (textVal) formData.append('content', textVal);
      if (fileVal) formData.append('file', fileVal);
      
      await axios.post(
        'http://127.0.0.1:8000/api/teachers/exam-submissions/', 
        formData, 
        { headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' } }
      );
      
      alert('Exam submitted successfully!');
      setActiveExam(null);
      setExamTextAnswer('');
      setExamAnswerFile(null);
      fetchTabData('exams');
    } catch (err) {
      console.error('Exam submission failed:', err);
      alert(JSON.stringify(err.response?.data) || 'Failed to submit exam.');
    }
  };

  // Safe Math Computations for Student Overview
  const completedTasks = overview?.completed_tasks ?? 0;
  const totalTasks = overview?.total_tasks || overview?.total_assigned_tasks || 0;
  const handInRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
  <div className="space-y-6 max-w-7xl mx-auto p-4 font-sans">
    {/* LOADING STATE */}
    {loading && (
      <div className="flex flex-col justify-center items-center h-64 gap-3 sa-card my-8">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sa-green-dark)' }} />
        <span className="font-semibold text-sm text-slate-700">Loading portal records...</span>
      </div>
    )}

    {/* ERROR STATE */}
    {error && (
      <div className="flex items-center gap-3 p-4 border rounded-2xl bg-red-50 text-red-700 border-red-200 text-xs font-semibold">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    )}

    {!loading && !error && (
      <>
        {/* OVERVIEW TAB */}
        {(activeTab === 'overview' || activeTab === 'home') && overview && (
          <div className="space-y-6">
            {/* Banner Header */}
            <div className="sa-banner sa-flex-between flex-col md:flex-row gap-4">
              <div>
                <span 
                  className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg border tracking-wider"
                  style={{ backgroundColor: 'var(--sa-surface)', borderColor: 'var(--sa-green-soft)', color: 'var(--sa-green-dark)' }}
                >
                  {overview.term_info || 'Term 1, 2026 • Current Week'}
                </span>
                <h1 className="text-2xl font-extrabold mt-3 text-slate-800">
                  Hello, {overview.student_name || 'Student'}!
                </h1>
                <p className="text-xs mt-1 max-w-xl" style={{ color: 'var(--sa-muted)' }}>
                  {overview.status_message || 'Your profile is updated live from your academic records.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/dashboard/student/assignments')} 
                  className="sa-btn-primary"
                >
                  Submit Pending Task
                </button>
                <button 
                  onClick={() => navigate('/dashboard/student/materials')} 
                  className="sa-btn-secondary"
                >
                  Download Revision Materials
                </button>
              </div>
            </div>

            {/* Overview Stat Cards Grid */}
            <div className="sa-grid">
              <div className="sa-card">
                <p className="sa-card-title">Overall Mean Grade</p>
                <p className="sa-card-value" style={{ color: 'var(--sa-green-dark)' }}>
                  {overview.mean_grade || 'Active'}
                </p>
                <span className="text-[11px] font-medium mt-2 block" style={{ color: 'var(--sa-muted)' }}>
                  {overview.grade_description || 'Calculated from submissions'}
                </span>
              </div>

              <div className="sa-card">
                <p className="sa-card-title">Task Completion</p>
                <p className="sa-card-value">
                  {completedTasks} / {totalTasks}
                </p>
                <span className="text-[11px] font-medium mt-2 block" style={{ color: 'var(--sa-muted)' }}>
                  {handInRate}% done
                </span>
              </div>

              <div className="sa-card">
                <p className="sa-card-title">Urgent Action Items</p>
                <p className="sa-card-value text-amber-600">
                  {overview.urgent_deadlines ?? 0} Deadlines
                </p>
                <span className="text-[11px] font-medium mt-2 block" style={{ color: 'var(--sa-muted)' }}>
                  {overview.urgent_notes || '0 pending deadlines due soon'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REVISION MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Revision Materials</h2>
            {materials.length === 0 ? (
              <p className="text-xs py-12 text-center sa-card" style={{ color: 'var(--sa-muted)' }}>
                No revision materials available at this time.
              </p>
            ) : (
              <div className="sa-card p-0 overflow-hidden divide-y divide-slate-100">
                {materials.map((mat) => {
                  const fileUrl = getFullUrl(mat.file_url || mat.file);
                  return (
                    <div key={mat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{mat.title}</h4>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--sa-muted)' }}>
                          Course/Subject: {mat.course_name || mat.subject || 'General'} | Uploaded: {mat.created_at || mat.uploaded_at || 'Recently'}
                        </p>
                        {mat.description && (
                          <p className="text-[11px] mt-1 text-slate-600">{mat.description}</p>
                        )}
                      </div>
                      {fileUrl && (
                        <a 
                          href={fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="sa-btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                        >
                          <Download size={14} /> Download Notes
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Assignments</h2>
            {assignments.length === 0 ? (
              <p className="text-xs py-12 text-center sa-card" style={{ color: 'var(--sa-muted)' }}>
                No assignments posted yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map((asg) => {
                  const fileUrl = getFullUrl(asg.file);
                  return (
                    <div key={asg.id} className="sa-card flex flex-col justify-between space-y-4">
                      <div>
                        <span 
                          className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg border"
                          style={{ backgroundColor: 'var(--sa-green-light)', borderColor: 'var(--sa-green-soft)', color: 'var(--sa-green-dark)' }}
                        >
                          Due: {asg.due_date || asg.deadline}
                        </span>
                        <h3 className="font-bold mt-3 text-sm text-slate-800">{asg.title}</h3>
                        <p className="text-xs mt-1 text-slate-600">{asg.description}</p>
                      </div>

                      {fileUrl && (
                        <div>
                          <button 
                            type="button" 
                            onClick={() => window.open(fileUrl, '_blank')} 
                            className="text-xs flex items-center gap-1.5 font-bold text-sky-600 hover:underline"
                          >
                            <Download size={14} /> View Posted Assignment PDF
                          </button>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100">
                        {submittedIds.includes(asg.id) ? (
                          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 size={16} /> Submitted Successfully
                          </div>
                        ) : submittingId === asg.id ? (
                          <div className="space-y-3">
                            <textarea 
                              rows="3" 
                              placeholder="Enter notes or answers..." 
                              value={submissionContent} 
                              onChange={(e) => setSubmissionContent(e.target.value)} 
                              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400" 
                            />
                            <input 
                              type="file" 
                              accept=".pdf" 
                              onChange={(e) => setSelectedFile(e.target.files[0])} 
                              className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 font-semibold" 
                            />
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => handleAssignmentSubmit(asg.id)} 
                                className="sa-btn-primary py-2 px-3 text-xs"
                              >
                                Confirm & Submit
                              </button>
                              <button 
                                onClick={() => setSubmittingId(null)} 
                                className="sa-btn-secondary py-2 px-3 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSubmittingId(asg.id)} 
                            className="sa-btn-primary py-2 px-4 text-xs"
                          >
                            Submit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EXAMS PORTAL TAB */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Exams Portal</h2>
            {exams.length === 0 ? (
              <p className="text-xs py-12 text-center sa-card" style={{ color: 'var(--sa-muted)' }}>
                No upcoming exams scheduled.
              </p>
            ) : activeExam ? (
              <div className="sa-card space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{activeExam.title}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--sa-muted)' }}>
                      Instructions: {activeExam.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExamTimer 
                      durationMins={activeExam.duration_mins} 
                      onTimeUp={() => {
                        alert("Time is up! Your exam is auto-submitting now.");
                        handleExamSubmit(activeExam.id);
                      }} 
                    />
                    <button 
                      onClick={() => setActiveExam(null)} 
                      className="sa-btn-secondary py-1.5 px-3 text-xs"
                    >
                      Exit Exam
                    </button>
                  </div>
                </div>

                {activeExam.file && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Exam Question Paper</h4>
                      <a 
                        href={getFullUrl(activeExam.file)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        <Download size={14} /> Open PDF in New Tab
                      </a>
                    </div>
                    <PdfCanvasViewer fileUrl={getFullUrl(activeExam.file)} />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Option A: Type Your Answers Here</label>
                    <textarea 
                      rows="6" 
                      placeholder="Type your exam responses here..." 
                      value={examTextAnswer} 
                      onChange={(e) => setExamTextAnswer(e.target.value)} 
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Option B: Upload Answer Sheet (PDF)</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setExamAnswerFile(e.target.files[0])} 
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 font-semibold" 
                    />
                  </div>

                  <button 
                    onClick={() => handleExamSubmit(activeExam.id)} 
                    className="sa-btn-primary w-full py-3 text-xs"
                  >
                    Finalize & Submit Exam
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="sa-card flex flex-col justify-between space-y-4">
                    <div>
                      <span 
                        className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg border"
                        style={{ backgroundColor: 'var(--sa-green-light)', borderColor: 'var(--sa-green-soft)', color: 'var(--sa-green-dark)' }}
                      >
                        Duration: {exam.duration_mins} Mins
                      </span>
                      <h3 className="font-bold mt-3 text-base text-slate-800">{exam.title}</h3>
                      <p className="text-xs mt-1 text-slate-600">{exam.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      {exam.file && (
                        <button 
                          type="button" 
                          onClick={() => window.open(getFullUrl(exam.file), '_blank')} 
                          className="text-xs flex items-center gap-1 font-bold text-sky-600 hover:underline"
                        >
                          <Download size={14} /> View Paper PDF
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveExam(exam)} 
                        className="sa-btn-primary py-2 px-4 text-xs ml-auto"
                      >
                        Start Exam
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">My Submissions & Grades</h2>
            {submissions.length === 0 ? (
              <p className="text-xs py-12 text-center sa-card" style={{ color: 'var(--sa-muted)' }}>
                No graded submissions found yet.
              </p>
            ) : (
              <div className="sa-card p-0 overflow-hidden divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{sub.assignment_title || sub.title || 'Submission'}</h4>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sa-muted)' }}>
                        Submitted: {sub.submitted_at || 'Recently'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold" style={{ color: 'var(--sa-green-dark)' }}>
                        {sub.score ?? sub.grade ?? sub.marks ?? 'Pending'}
                      </span>
                      <p className="text-[10px]" style={{ color: 'var(--sa-muted)' }}>
                        {sub.feedback ? 'Feedback available' : 'Pending review'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);
}