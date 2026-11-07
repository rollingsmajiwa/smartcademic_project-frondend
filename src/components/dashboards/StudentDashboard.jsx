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
  const [viewingNotesId, setViewingNotesId] = useState(null);
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

  // 1. Grab a fresh token and config INSIDE the function call
  const token = localStorage.getItem('access_token');
  const apiConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    if (tab === 'overview' || !tab || tab === 'home') {
      const res = await axios.get('http://127.0.0.1:8000/api/students/overview/', apiConfig);
      setOverview(res.data);
    } else if (tab === 'materials') {
      const res = await axios.get('http://127.0.0.1:8000/api/students/materials/', apiConfig);
      setMaterials(Array.isArray(res.data) ? res.data : res.data.results || []);
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
 <div className="space-y-6 w-full overflow-y-auto min-h-screen lg:p-8 p-4 font-sans max-w-5xl mx-auto" style={{ backgroundColor: 'var(--sa-bg)', color: 'var(--sa-text)' }}>
    {/* LOADING STATE */}
    {loading && (
      <div className="flex flex-col justify-center items-center h-64 gap-3 sa-card border border-[#c77dff] shadow-xs rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#10002b' }} />
        <span className="font-semibold text-sm text-[#10002b]">Loading portal records...</span>
      </div>
    )}

    {/* ERROR STATE */}
    {error && (
      <div className="flex items-center gap-3 p-4 border rounded-2xl bg-red-50 text-red-700 border-red-200 text-xs font-semibold shadow-xs w-full">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    )}

    {!loading && !error && (
      <>
        {/* OVERVIEW TAB */}
        {(activeTab === 'overview' || activeTab === 'home') && overview && (
          <div className="space-y-6 w-full">
            {/* Banner Header */}
            <div className="sa-banner sa-flex-between flex-col md:flex-row gap-4 border border-[#c77dff] shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
              <div>
                <span 
                  className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-md border tracking-wider bg-white border-[#c77dff] text-[#10002b]"
                >
                  {overview.term_info || 'Term 1, 2026'}
                </span>
                <h1 className="text-xl font-extrabold mt-3 text-[#10002b]">
                  Hello, {overview.student_name || 'Student'}!
                </h1>
                <p className="text-xs mt-1 max-w-xl text-[#10002b]/70">
                  {overview.status_message || 'Your profile is updated live from your academic records.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/dashboard/student/assignments')} 
                  className="sa-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
                >
                  Submit Pending Task
                </button>
                <button 
                  onClick={() => navigate('/dashboard/student/materials')} 
                  className="sa-btn-secondary py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all cursor-pointer shadow-xs"
                >
                  Download Revision Materials
                </button>
              </div>
            </div>

            {/* Overview Stat Cards Grid */}
            <div className="sa-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Overall Mean Grade</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">
                  {overview.mean_grade || 'Active'}
                </p>
                <span className="text-[11px] font-medium mt-2 block text-[#10002b]/70">
                  {overview.grade_description || 'Calculated from submissions'}
                </span>
              </div>

              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Task Completion</p>
                <p className="sa-card-value text-[#10002b] text-2xl font-extrabold mt-2">
                  {completedTasks} / {totalTasks}
                </p>
                <span className="text-[11px] font-medium mt-2 block text-[#10002b]/70">
                  {handInRate}% done
                </span>
              </div>

              <div className="sa-card border border-[#c77dff] shadow-xs p-5 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="sa-card-title text-[#10002b] text-xs font-bold uppercase tracking-wider">Urgent Action Items</p>
                <p className="sa-card-value text-red-600 font-extrabold text-2xl mt-2">
                  {overview.urgent_deadlines ?? 0} Deadlines
                </p>
                <span className="text-[11px] font-medium mt-2 block text-[#10002b]/70">
                  {overview.urgent_notes || '0 pending deadlines due soon'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REVISION MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4 w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">Revision Materials</h2>
            
            {materials.length === 0 ? (
              <div className="sa-card border border-[#c77dff] p-6 text-center rounded-2xl shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="text-xs text-[#10002b]/70">
                  No revision materials available at this time.
                </p>
              </div>
            ) : (
              <div className="sa-card border border-[#c77dff] p-0 rounded-2xl overflow-hidden divide-y divide-[#c77dff]/40 shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                {materials.map((mat) => {
                  const fileUrl = getFullUrl(mat.file_url || mat.file);
                  return (
                    <div key={mat.id} className="p-4 flex items-center justify-between bg-white hover:bg-[#c77dff]/10 transition-colors w-full">
                      <div>
                        <h4 className="font-bold text-xs text-[#10002b]">{mat.title}</h4>
                        <p className="text-[11px] mt-0.5 text-[#10002b]/70">
                          Subject: {mat.course_name || mat.subject || 'General'} | Uploaded: {mat.created_at || mat.uploaded_at || 'Recently'}
                        </p>
                        {mat.description && (
                          <p className="text-[11px] mt-1 text-[#10002b]/70">{mat.description}</p>
                        )}
                      </div>
                      
                      {fileUrl && (
                        <a 
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sa-btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] rounded-lg font-bold transition-all cursor-pointer"
                        >
                          Open File
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB - 3 Columns Grid */}
        {activeTab === 'assignments' && (
          <div className="space-y-4 w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">Assignments</h2>
            {assignments.length === 0 ? (
              <div className="sa-card border border-[#c77dff] py-12 text-center rounded-2xl shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="text-xs text-[#10002b]/70">
                  No assignments posted yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {assignments.map((asg) => {
                  const fileUrl = getFullUrl(asg.file);
                  return (
                    <div key={asg.id} className="sa-card border border-[#c77dff] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                      <div>
                        <span 
                          className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-[#10002b] text-[#c77dff]"
                        >
                          Due: {asg.due_date || asg.deadline}
                        </span>
                        <h3 className="font-bold mt-3 text-sm text-[#10002b]">{asg.title}</h3>
                        <p className="text-xs mt-1 text-[#10002b]/70">{asg.description}</p>
                      </div>

                      {fileUrl && (
                        <div>
                          <button 
                            type="button" 
                            onClick={() => window.open(fileUrl, '_blank')} 
                            className="text-xs flex items-center gap-1.5 font-bold text-[#10002b] hover:text-[#c77dff] transition-colors cursor-pointer hover:underline"
                          >
                            <Download size={14} /> View Posted Assignment PDF
                          </button>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#c77dff]/60 w-full">
                        {submittedIds.includes(asg.id) ? (
                          <div className="text-xs font-bold text-[#10002b] flex items-center gap-1.5 p-2.5 rounded-xl bg-white border border-[#c77dff] w-full">
                            <CheckCircle2 size={16} className="text-[#c77dff]" /> Submitted Successfully
                          </div>
                        ) : submittingId === asg.id ? (
                          <div className="space-y-3 w-full">
                            <textarea 
                              rows="3" 
                              placeholder="Enter notes or answers..." 
                              value={submissionContent} 
                              onChange={(e) => setSubmissionContent(e.target.value)} 
                              className="w-full p-3 text-xs rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]" 
                            />
                            <input 
                              type="file" 
                              accept=".pdf" 
                              onChange={(e) => setSelectedFile(e.target.files[0])} 
                              className="w-full text-xs text-[#10002b]/70 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#10002b] file:text-white font-semibold hover:file:bg-[#c77dff] hover:file:text-[#10002b]" 
                            />
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => handleAssignmentSubmit(asg.id)} 
                                className="sa-btn-primary py-2 px-3 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer font-bold"
                              >
                                Confirm & Submit
                              </button>
                              <button 
                                onClick={() => setSubmittingId(null)} 
                                className="sa-btn-secondary py-2 px-3 text-xs bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSubmittingId(asg.id)} 
                            className="sa-btn-primary py-2.5 px-4 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer font-bold shadow-xs w-full"
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
          <div className="space-y-4 w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">Exams Portal</h2>
            {exams.length === 0 ? (
              <div className="sa-card border border-[#c77dff] py-12 text-center rounded-2xl shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="text-xs text-[#10002b]/70">
                  No upcoming exams scheduled.
                </p>
              </div>
            ) : activeExam ? (
              <div className="sa-card border border-[#c77dff] space-y-6 shadow-xs p-6 rounded-2xl w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <div className="flex justify-between items-center border-b border-[#c77dff]/60 pb-4 w-full">
                  <div>
                    <h3 className="text-base font-bold text-[#10002b]">{activeExam.title}</h3>
                    <p className="text-xs mt-1 text-[#10002b]/70">
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
                      className="sa-btn-secondary py-2 px-3 text-xs bg-white text-[#10002b] border border-[#c77dff] hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer"
                    >
                      Exit Exam
                    </button>
                  </div>
                </div>

                {activeExam.file && (
                  <div className="space-y-2 w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#10002b]">Exam Question Paper</h4>
                      <a 
                        href={getFullUrl(activeExam.file)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-[#10002b] hover:text-[#c77dff] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={14} /> Open PDF in New Tab
                      </a>
                    </div>
                    <PdfCanvasViewer fileUrl={getFullUrl(activeExam.file)} />
                  </div>
                )}

                <div className="pt-4 border-t border-[#c77dff]/60 space-y-4 w-full">
                  <div className="w-full">
                    <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Option A: Type Your Answers Here</label>
                    <textarea 
                      rows="8" 
                      placeholder="Type your exam responses here..." 
                      value={examTextAnswer} 
                      onChange={(e) => setExamTextAnswer(e.target.value)} 
                      className="w-full p-4 text-xs rounded-xl border border-[#c77dff] bg-white text-[#10002b] focus:outline-none focus:border-[#10002b]" 
                    />
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-bold mb-1.5 text-[#10002b]">Option B: Upload Answer Sheet (PDF)</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setExamAnswerFile(e.target.files[0])} 
                      className="w-full text-xs text-[#10002b]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#10002b] file:text-white font-semibold hover:file:bg-[#c77dff] hover:file:text-[#10002b]" 
                    />
                  </div>

                  <button 
                    onClick={() => handleExamSubmit(activeExam.id)} 
                    className="sa-btn-primary w-full py-3.5 text-xs bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer font-bold shadow-xs"
                  >
                    Finalize & Submit Exam
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {exams.map((exam) => (
                  <div key={exam.id} className="sa-card border border-[#c77dff] p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-[#10002b] text-[#c77dff]">
                        Duration: {exam.duration_mins} Mins
                      </span>
                      <h3 className="font-bold mt-3 text-base text-[#10002b]">{exam.title}</h3>
                      <p className="text-xs mt-1 text-[#10002b]/70">{exam.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#c77dff]/60 flex items-center justify-between w-full">
                      {exam.file && (
                        <button 
                          type="button" 
                          onClick={() => window.open(getFullUrl(exam.file), '_blank')} 
                          className="text-xs flex items-center gap-1 font-bold text-[#10002b] hover:text-[#c77dff] transition-colors cursor-pointer"
                        >
                          <Download size={14} /> View Paper PDF
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveExam(exam)} 
                        className="sa-btn-primary py-2 px-4 text-xs ml-auto bg-[#10002b] text-white hover:bg-[#c77dff] hover:text-[#10002b] transition-all rounded-xl cursor-pointer font-bold shadow-xs"
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
          <div className="space-y-4 w-full">
            <h2 className="text-lg font-extrabold text-[#10002b]">My Submissions & Grades</h2>
            {submissions.length === 0 ? (
              <div className="sa-card border border-[#c77dff] py-12 text-center rounded-2xl shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                <p className="text-xs text-[#10002b]/70">
                  No graded submissions found yet.
                </p>
              </div>
            ) : (
              <div className="sa-card border border-[#c77dff] p-0 rounded-2xl overflow-hidden divide-y divide-[#c77dff]/40 shadow-xs w-full" style={{ backgroundColor: 'var(--sa-surface)' }}>
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between bg-white hover:bg-[#c77dff]/10 transition-colors w-full">
                    <div>
                      <h4 className="font-bold text-xs text-[#10002b]">{sub.assignment_title || sub.title || 'Submission'}</h4>
                      <p className="text-[11px] mt-0.5 text-[#10002b]/70">
                        Submitted: {sub.submitted_at || 'Recently'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#10002b]">
                        {sub.score ?? sub.grade ?? sub.marks ?? 'Pending'}
                      </span>
                      <p className="text-[10px] text-[#10002b]/70">
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