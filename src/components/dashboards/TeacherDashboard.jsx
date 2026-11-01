import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function TeacherDashboard() {
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/revisions') || path.includes('/materials')) return 'materials';
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/exams')) return 'exams';
    if (path.includes('/submissions') || path.includes('/grading')) return 'submissions';
    if (path.includes('/attendance')) return 'attendance';
    if (path.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const [teachersList, setTeachersList] = useState([]);
  const [overview, setOverview] = useState(null);
  
  const [submissions, setSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState({});
  const [examGrades, setExamGrades] = useState({});
  const [examReviews, setExamReviews] = useState({});

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

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchTeachers();
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
    if (activeTab === 'overview') fetchOverview();
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

  const handleGradeSubmit = async (submissionId) => {
    const gradeVal = grades[submissionId];
    if (!gradeVal) {
      alert('Please enter a score.');
      return;
    }
    try {
      await axios.post(
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
  // Helper parser to clearly display structured JSON or plain text answers
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

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen">
      {activeTab === 'overview' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold">Teacher Overview Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase">Assignments Posted</p>
              <p className="text-xl font-extrabold mt-1">{overview?.total_assignments_posted || 0}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase">Exams Created</p>
              <p className="text-xl font-extrabold mt-1">{overview?.total_exams_created || 0}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase">Submissions Received</p>
              <p className="text-xl font-extrabold mt-1">{overview?.total_submissions_received || 0}</p>
            </div>
            <div className="p-5 rounded-2xl border">
              <p className="text-[10px] font-bold uppercase">Pending Grades</p>
              <p className="text-xl font-extrabold mt-1">{overview?.pending_grades || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Revision Materials</h2>
          <p className="text-xs">Upload revision guides and documents for students.</p>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Post New Assignment</h2>
          <form onSubmit={handlePostAssignment} className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1">Assign Teacher</label>
              <select
                value={assignmentForm.teacher}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border"
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
            <input
              type="text"
              placeholder="Title (e.g. Grade 8 Maths)"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border"
              required
            />
            <textarea
              rows="3"
              placeholder="Instructions / description..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border"
            />
            <div>
              <label className="block text-xs font-bold mb-1">Deadline</label>
              <input 
                type="datetime-local" 
                value={assignmentForm.deadline} 
                onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value })} 
                required 
                className='w-full p-2.5 text-xs rounded-xl border'
              />
            </div>
            <input
              type="text"
              placeholder="Target Class (e.g. Grade 8)"
              value={assignmentForm.class_name}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, class_name: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border"
            />
            <div>
              <label className="block text-xs font-bold mb-1">Attach Reference File / PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
                className="w-full text-xs"
              />
            </div>
            <button type="submit" className="w-full py-2.5 font-semibold text-xs rounded-xl border">
              Publish Assignment
            </button>
          </form>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Create New Exam</h2>
          <form onSubmit={handlePostExam} className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1">Exam Title</label>
              <input
                type="text"
                placeholder="Exam Title (e.g. Midterm Physics)"
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Term</label>
              <input
                type="text"
                placeholder="Term (e.g. Term 1)"
                value={examForm.term}
                onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Exam Description</label>
              <input 
                type="text" 
                value={examForm.description} 
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                placeholder="Enter description..."
                className="w-full p-2.5 text-xs rounded-xl border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Attach Exam Paper PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setExamForm({ ...examForm, file: e.target.files[0] })}
                className="w-full text-xs"
              />
            </div>
            <button type="submit" className="w-full py-2.5 font-semibold text-xs rounded-xl border">
              Publish Exam
            </button>
          </form>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Student Submissions & Grading</h2>
            <button onClick={fetchAllSubmissions} className="px-3 py-1.5 text-xs font-semibold rounded-lg border">
              Refresh Submissions
            </button>
          </div>

          {loading ? (
            <p className="text-xs">Loading submissions...</p>
          ) : (
            <div className="space-y-6">
              
              {/* Assignment Submissions */}
              <div className="space-y-3">
                <h3 className="text-md font-semibold border-b pb-1">Assignment Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-xs">No assignment submissions found.</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={`assignment-sub-${sub.id}`} className="p-5 rounded-2xl border space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 w-full max-w-lg">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded border">
                            Assignment #{sub.assignment}
                          </span>
                          <p className="text-xs font-bold">Student ID: {sub.student}</p>
                          
                          {/* Clearly Displayed Student Typed Response Box */}
                          <div className="p-3 rounded-xl border text-xs space-y-1 bg-gray-50">
                            <span className="font-bold block">Student Typed Response:</span>
                            <p className="whitespace-pre-wrap">{sub.content || 'No text content provided.'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl border">
                          <div>
                            <label className="block text-[10px] font-bold mb-1">Score</label>
                            <input
                              type="text"
                              placeholder={sub.grade || 'Score'}
                              value={grades[sub.id] || ''}
                              onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                              className="w-20 p-1.5 text-xs rounded-lg border"
                            />
                          </div>
                          <button
                            onClick={() => handleGradeSubmit(sub.id)}
                            className="mt-4 px-3 py-1.5 text-xs font-semibold rounded-lg border"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      {sub.file && (
                        <div className="mt-2 border rounded-xl overflow-hidden p-3">
                          <p className="text-xs font-bold mb-2">Attached Student PDF:</p>
                          {pdfBlobs[sub.id] ? (
                            <object
                              data={pdfBlobs[sub.id]}
                              type="application/pdf"
                              className="w-full h-96 rounded-lg border"
                            >
                              <p className="text-xs p-4">
                                PDF preview unavailable.{' '}
                                <a href={pdfBlobs[sub.id]} target="_blank" rel="noopener noreferrer" className="underline">
                                  Download PDF
                                </a>
                              </p>
                            </object>
                          ) : (
                            <p className="text-xs p-4">Loading PDF preview...</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Exam Submissions */}
              <div className="space-y-3 pt-4">
                <h3 className="text-md font-semibold border-b pb-1">Exam Submissions</h3>
                {examSubmissions.length === 0 ? (
                  <p className="text-xs">No exam submissions found.</p>
                ) : (
                  examSubmissions.map((sub) => (
                    <div key={`exam-sub-${sub.id}`} className="p-5 rounded-2xl border space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 w-full max-w-lg">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded border">
                            Exam ID: {sub.exam}
                          </span>
                          <p className="text-xs font-bold">Student ID: {sub.student}</p>
                          
                          {/* Clearly Displayed Student Typed Exam Answers Box */}
                          <div className="p-3 rounded-xl border text-xs space-y-1 bg-gray-50">
                            <span className="font-bold block">Student Typed Exam Answers:</span>
                            <p className="whitespace-pre-wrap">{renderStudentAnswers(sub)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl border">
                          <div>
                            <label className="block text-[10px] font-bold mb-1">Score</label>
                            <input
                              type="text"
                              placeholder={sub.grade || 'Score'}
                              value={examGrades[sub.id] || ''}
                              onChange={(e) => setExamGrades({ ...examGrades, [sub.id]: e.target.value })}
                              className="w-20 p-1.5 text-xs rounded-lg border"
                            />
                          </div>
                          
                          <button
                            onClick={() => handleExamGradeSubmit(sub.id)}
                            className="mt-4 px-3 py-1.5 text-xs font-semibold rounded-lg border"
                          >
                            Send Score
                          </button>
                        </div>
                      </div>

                      {sub.file && (
                        <div className="mt-2 border rounded-xl overflow-hidden p-3">
                          <p className="text-xs font-bold mb-2">Attached Answer Sheet PDF:</p>
                          {pdfBlobs[sub.id] ? (
                            <object
                              data={pdfBlobs[sub.id]}
                              type="application/pdf"
                              className="w-full h-96 rounded-lg border"
                            >
                              <p className="text-xs p-4">
                                PDF preview unavailable.{' '}
                                <a href={pdfBlobs[sub.id]} target="_blank" rel="noopener noreferrer" className="underline">
                                  Download PDF
                                </a>
                              </p>
                            </object>
                          ) : (
                            <p className="text-xs p-4">Loading PDF preview...</p>
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
    </div>
  );
}