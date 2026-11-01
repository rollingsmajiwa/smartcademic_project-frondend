import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, BookOpenCheck, FileText, GraduationCap, 
  CheckCircle2, Clock, Award, AlertCircle, Download, Send, Loader2 
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// --- ROBUST COUNTDOWN TIMER COMPONENT ---
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

// --- BULLETPROOF BLOB EMBED VIEWER ---
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
    return <div className="h-96 flex items-center justify-center border rounded-xl text-xs">Loading exam document...</div>;
  }

  return (
    <object 
      data={localBlobUrl} 
      type="application/pdf" 
      className="w-full h-96 border rounded-xl bg-white"
    >
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2">
        <p className="text-xs">Unable to display PDF directly in this view.</p>
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
  const [submittedIds, setsubmittedIds] = useState([]);

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
        `http://127.0.0.1:8000/api/students/assignments/submit/`, formData,
        { headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' } }
      );
      alert('Assignment submitted successfully!');
      setSubmittingId(null);
      setSubmissionContent('');
      setSelectedFile(null);
      setsubmittedIds(prev => [...prev, assignmentId]);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {loading && (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-medium text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 border rounded-xl">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* OVERVIEW TAB */}
          {(activeTab === 'overview' || activeTab === 'home') && overview && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border">
                <div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold border">{overview.term_info}</span>
                  <h1 className="text-2xl font-bold mt-2">Hello, {overview.student_name}!</h1>
                  <p className="text-sm mt-1 max-w-xl">{overview.status_message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => navigate('/dashboard/student/assignments')} className="px-4 py-2 rounded-xl text-xs font-semibold shadow flex items-center gap-2 transition border">
                    <Send size={14} /> Submit Pending Task
                  </button>
                  <button onClick={() => navigate('/dashboard/student/materials')} className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border">
                    <Download size={14} /> Download Revision Materials
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl shadow-sm border">
                  <span className="text-xs font-semibold uppercase">Overall Mean Grade</span>
                  <h3 className="text-3xl font-bold mt-2">{overview.mean_grade}</h3>
                  <span className="text-xs font-medium mt-1 block">{overview.grade_description}</span>
                </div>
                <div className="p-5 rounded-2xl shadow-sm border">
                  <span className="text-xs font-semibold uppercase">Task Completion</span>
                  <h3 className="text-3xl font-bold mt-2">{overview.completed_tasks} / {overview.total_tasks}</h3>
                  <span className="text-xs font-medium mt-1 block">{overview.completion_rate} hand-in rate</span>
                </div>
                <div className="p-5 rounded-2xl shadow-sm border">
                  <span className="text-xs font-semibold uppercase">Urgent Action Items</span>
                  <h3 className="text-3xl font-bold mt-2">{overview.urgent_deadlines} Deadlines</h3>
                  <span className="text-xs font-medium mt-1 block">{overview.urgent_notes}</span>
                </div>
              </div>
            </div>
          )}

          {/* REVISION MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Revision Materials</h2>
              {materials.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No revision materials available.</p>
              ) : (
                <div className="rounded-2xl border divide-y shadow-sm">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{mat.title}</h4>
                        <p className="text-xs mt-0.5">Course: {mat.course_name} | Uploaded: {mat.created_at}</p>
                      </div>
                      {mat.file_url && (
                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border">
                          <Download size={14} /> Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Assignments</h2>
              {assignments.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No assignments posted yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((asg) => (
                    <div key={asg.id} className="p-5 rounded-2xl shadow-sm flex flex-col justify-between border">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border">Due: {asg.due_date}</span>
                        <h3 className="font-bold mt-2 text-base">{asg.title}</h3>
                        <p className="text-xs mt-1">{asg.description}</p>
                      </div>
                      {asg.file && (
                        <div className="mt-3">
                          <button type="button" onClick={() => {
                            const file_url = asg.file.startsWith('http') ? asg.file : `http://127.0.0.1:8000${asg.file}`;
                            window.open(file_url, '_blank');
                          }} className="text-xs flex items-center gap-1 hover:underline font-semibold">
                            <Download size={14} /> View Posted Assignment PDF
                          </button>
                        </div>
                      )}
                      <div className="mt-4 pt-3 border-t">
                        {submittedIds.includes(asg.id) ? (
                          <div className="text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Submitted Successfully
                          </div>
                        ) : submittingId === asg.id ? (
                          <div className="space-y-2">
                            <textarea rows="3" placeholder="Enter notes..." value={submissionContent} onChange={(e) => setSubmissionContent(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border focus:outline-none" />
                            <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0" />
                            <div className="flex gap-2">
                              <button onClick={() => handleAssignmentSubmit(asg.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition border">Confirm & Submit</button>
                              <button onClick={() => setSubmittingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition border">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSubmittingId(asg.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition border">Submit Assignment</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXAMS PORTAL TAB */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Exams Portal</h2>
              {exams.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No upcoming exams scheduled.</p>
              ) : activeExam ? (
                <div className="p-6 rounded-2xl border shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-lg font-bold">{activeExam.title}</h3>
                      <p className="text-xs mt-1">Instructions: {activeExam.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <ExamTimer 
                        durationMins={activeExam.duration_mins} 
                        onTimeUp={() => {
                          alert("Time is up! Your exam is auto-submitting now.");
                          handleExamSubmit(activeExam.id);
                        }} 
                      />
                      <button onClick={() => setActiveExam(null)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition border">
                        Exit Exam
                      </button>
                    </div>
                  </div>

                  {activeExam.file && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-xs uppercase">Exam Question Paper</h4>
                        <a href={activeExam.file.startsWith('http') ? activeExam.file : `http://127.0.0.1:8000${activeExam.file}`} target="_blank" rel="noopener noreferrer" className="text-xs underline font-semibold flex items-center gap-1">
                          <Download size={14} /> Open PDF in New Tab (External)
                        </a>
                      </div>
                      <PdfCanvasViewer fileUrl={activeExam.file.startsWith('http') ? activeExam.file : `http://127.0.0.1:8000${activeExam.file}`} />
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Option A: Type Your Answers Here</label>
                      <textarea rows="6" placeholder="Type your exam responses here..." value={examTextAnswer} onChange={(e) => setExamTextAnswer(e.target.value)} className="w-full p-3 text-xs rounded-xl border focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Option B: Upload Completed Answer Sheet (PDF)</label>
                      <input type="file" accept=".pdf" onChange={(e) => setExamAnswerFile(e.target.files[0])} className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0" />
                    </div>

                    <button onClick={() => handleExamSubmit(activeExam.id)} className="px-6 py-2.5 rounded-xl text-xs font-semibold shadow transition border w-full">
                      Finalize & Submit Exam
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border">
                          Duration: {exam.duration_mins} Mins
                        </span>
                        <h3 className="font-bold mt-2 text-base">{exam.title}</h3>
                        <p className="text-xs mt-1">{exam.description}</p>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        {exam.file && (
                          <button type="button" onClick={() => {
                            const fileUrl = exam.file.startsWith('http') ? exam.file : `http://127.0.0.1:8000${exam.file}`;
                            window.open(fileUrl, '_blank');
                          }} className="text-xs flex items-center gap-1 hover:underline font-semibold">
                            <Download size={14} /> View Paper PDF
                          </button>
                        )}
                        <button onClick={() => setActiveExam(exam)} className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition border ml-auto">
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
              <h2 className="text-xl font-bold">My Submissions & Grades</h2>
              {submissions.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No graded submissions found yet.</p>
              ) : (
                <div className="rounded-2xl border divide-y shadow-sm">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{sub.assignment_title}</h4>
                        <p className="text-xs mt-0.5">Submitted: {sub.submitted_at}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold">{sub.grade}</span>
                        <p className="text-[10px]">{sub.feedback ? 'Feedback available' : 'Pending review'}</p>
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