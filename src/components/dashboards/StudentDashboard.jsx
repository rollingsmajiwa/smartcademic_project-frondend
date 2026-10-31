import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, BookOpenCheck, FileText, GraduationCap, 
  CheckCircle2, Clock, Award, AlertCircle, Download, Send, Loader2 
} from 'lucide-react';

export default function StudentDashboard() {
  const { subpage } = useParams();
  const activeTab = subpage || 'overview';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live state connected to API endpoints
  const [overview, setOverview] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Submission text state for specific assignment handling
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
// submission of files
  const [selectedFile, setSelectedFile] = useState(null);
// submission state
  const [submittedIds, setsubmittedIds] = useState([])


  const token = localStorage.getItem('access_token');
  const apiConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch data dynamically whenever the active tab changes
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


  // Live submit handler for assignments
  const handleAssignmentSubmit = async (assignmentId) => {
    try {
      const formData = new FormData();
      formData.append('assignment', assignmentId);
      if (submissionContent) {
        formData.append('content', submissionContent);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      await axios.post(
        `http://127.0.0.1:8000/api/students/assignments/submit/`, formData,
        { headers: {
          ...apiConfig.headers,
          'Content-Type': 'multipart/formData',
        } 

        },
      );
      alert('Assignment submitted successfully!');
      setSubmittingId(null);
      setSubmissionContent('');
      setSelectedFile(null)
      setsubmittedIds(prev => [...prev, assignmentId]);
      fetchTabData('assignments'); // Refresh list
    } catch (err) {
      console.error('Submission failed:', err);
      alert(JSON.stringify(err.response?.data) || 'Failed to submit assignment.');

    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <Loader2 className="w-8 h-8 " />
          <span className="font-medium text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 1. OVERVIEW TAB */}
          {(activeTab === 'overview' || activeTab === 'home') && overview && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold">
                    {overview.term_info}
                  </span>
                  <h1 className="text-2xl font-bold mt-2">Hello, {overview.student_name}!</h1>
                  <p className=" text-sm mt-1 max-w-xl">
                    {overview.status_message}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => navigate('/dashboard/student/assignments')} 
                    className=" px-4 py-2 rounded-xl text-xs font-semibold shadow flex items-center gap-2 transition"
                  >
                    <Send size={14} /> Submit Pending Task
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/student/materials')} 
                    className=" px-4 py-2 rounded-xl text-xs  flex items-center gap-2 transition"
                  >
                    <Download size={14} /> Download Revision Materials
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl shadow-sm">
                  <span className=" font-semibold uppercase">Overall Mean Grade</span>
                  <h3 className="text-3xl mt-2">{overview.mean_grade}</h3>
                  <span className=" font-medium mt-1 block">{overview.grade_description}</span>
                </div>
                <div className=" p-5 rounded-2xl shadow-sm">
                  <span className="font-semibold uppercase">Task Completion</span>
                  <h3 className="text-3xl mt-2">{overview.completed_tasks} / {overview.total_tasks}</h3>
                  <span className=" font-medium mt-1 block">{overview.completion_rate} hand-in rate</span>
                </div>
                <div className=" p-5 rounded-2xl shadow-sm">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Urgent Action Items</span>
                  <h3 className="text-3xl mt-2">{overview.urgent_deadlines} Deadlines</h3>
                  <span className="font-medium mt-1 block">{overview.urgent_notes}</span>
                </div>
                
              </div>

              {/* Dynamic Performance Profile Strands */}
              {overview.performance_strands && overview.performance_strands.length > 0 && (
                <div className="p-5 rounded-2x space-y-3">
                  <h3 className="font-bold ">Core Learning Strands & Performance Profile</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {overview.performance_strands.map((strand, index) => (
                      <div key={index} className="p-3 text-center">
                        <span className="text-xs block truncate">{strand.name}</span>
                        <span className="text-lg mt-1 block">{strand.score}</span>
                        <span className="text-[10px] font-medium">{strand.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. REVISION MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Revision Materials</h2>
              {materials.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No revision materials available.</p>
              ) : (
                <div className="rounded-2xl border divide-y  shadow-sm">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-4 flex items-center justify-between transition">
                      <div>
                        <h4 className="font-bold text-sm">{mat.title}</h4>
                        <p className="text-xs mt-0.5">Course: {mat.course_name} • Uploaded: {mat.created_at}</p>
                      </div>
                      {mat.file_url && (
                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className=" px-3 py-1.5 flex items-center gap-1.5 shadow transition">
                          <Download size={14} /> Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ASSIGNMENTS HUB TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold ">Assignments</h2>
              {assignments.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No assignments posted yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((asg) => (
                    <div key={asg.id} className="p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Due: {asg.due_date}</span>
                        <h3 className="font-bold mt-2 text-base">{asg.title}</h3>
                        <p className="text-xs mt-1">{asg.description}</p>
                      </div>

                      {asg.file && (
                        <div className='mt-3'>
                          <button type='button'
                          onClick={()=> {const file_url = asg.file.startsWith('http')? asg.file : `http://127.0.0.1:8000${asg.file}`
                            window.open(file_url, '_blank')
                          } }
                          className='text-xs flex items-center gap-1 hover:underline'>
                            <Download size={14}/>View Posted Assignments
                        
                  

                          </button>

                        </div>
                      )

                      }
                      <div className="mt-4 pt-3 border-t">
                        {submittedIds.includes(asg.id) ? (
                          <div><p>Submitted Successfully</p></div>
                        ):
                        submittingId === asg.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows="3"
                              placeholder="Enter your assignment solution or notes..."
                              value={submissionContent}
                              onChange={(e) => setSubmissionContent(e.target.value)}
                              className="w-full p-2.5 text-xs  rounded-xl "
                            />

                            <div>
                              <label className='block font-bold'>Upload PDF solution</label>
                              <input type="file" accept='.pdf' onChange={(e) => setSelectedFile(e.target.files[0]) } className='w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl'/>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleAssignmentSubmit(asg.id)} className=" px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition">
                                Confirm & Submit
                              </button>
                              <button onClick={() => setSubmittingId(null)} className=" px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSubmittingId(asg.id)} className=" px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition">
                            Submit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. EXAMS PORTAL TAB */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold ">Exams Portal</h2>
              {exams.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No upcoming exams scheduled.</p>
              ) : (
                <div className="rounded-2xl border divide-y divide-blue-50 shadow-sm">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{exam.title}</h4>
                        <p className="text-xs mt-0.5">Date: {exam.date} • Venue: {exam.venue}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-semibold">
                        {exam.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. MY SUBMISSIONS & GRADES TAB */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold ">My Submissions & Grades</h2>
              {submissions.length === 0 ? (
                <p className="text-sm py-8 text-center rounded-2xl border">No graded submissions found yet.</p>
              ) : (
                <div className="bg-white rounded-2xl border divide-y divide-gray-50 shadow-sm">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{sub.assignment_title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Submitted: {sub.submitted_at}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold">{sub.grade}</span>
                        <p className="text-[10px] text-gray-400">{sub.feedback ? 'Feedback available' : 'Pending review'}</p>
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