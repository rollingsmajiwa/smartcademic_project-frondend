import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function TeacherDashboard() {
  const location = useLocation();

  // Dynamically determine active view based on current URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/revisions') || path.includes('/materials')) return 'materials';
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/exams')) return 'exams';
    if (path.includes('/submissions') || path.includes('/grading')) return 'submissions';
    if (path.includes('/attendance')) return 'attendance';
    if (path.includes('/analytics')) return 'analytics';
    return 'overview'; // Default home / overview
  };

  const activeTab = getActiveTab();

  const [overview, setOverview] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState({});

  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', class_name: '', file: null });
  const [examForm, setExamForm] = useState({ title: '', term: '', file: null });

  const apiConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const fetchOverview = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/teachers/overview/', apiConfig);
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/teachers/assignment-submissions/', apiConfig);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, location.pathname]);

  const handlePostAssignment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', assignmentForm.title);
    formData.append('description', assignmentForm.description);
    formData.append('class_name', assignmentForm.class_name);
    if (assignmentForm.file) formData.append('file', assignmentForm.file);

    try {
      await axios.post('http://127.0.0.1:8000/api/teachers/assignment/', formData, {
        headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Assignment posted successfully!');
      setAssignmentForm({ title: '', description: '', class_name: '', file: null });
    } catch (err) {
      console.error('Error posting assignment:', err);
      alert('Failed to post assignment.');
    }
  };

  const handlePostExam = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', examForm.title);
    formData.append('term', examForm.term);
    if (examForm.file) formData.append('file', examForm.file);

    try {
      await axios.post('http://127.0.0.1:8000/api/teachers/exam/', formData, {
        headers: { ...apiConfig.headers, 'Content-Type': 'multipart/form-data' },
      });
      alert('Exam posted successfully!');
      setExamForm({ title: '', term: '', file: null });
    } catch (err) {
      console.error('Error posting exam:', err);
      alert('Failed to post exam.');
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    const gradeVal = grades[submissionId];
    if (!gradeVal) {
      alert('Please enter a grade.');
      return;
    }
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/teachers/submissions/${submissionId}/grade/`,
        { grade: gradeVal },
        apiConfig
      );
      alert('Grade saved successfully!');
      fetchSubmissions();
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Failed to save grade.');
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen">
      {/* OVERVIEW TAB */}
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

      {/* REVISION MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Revision Materials</h2>
          <p className="text-xs">Upload revision guides and documents for students.</p>
        </div>
      )}

      {/* ASSIGNMENTS HUB TAB */}
      {activeTab === 'assignments' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Post New Assignment</h2>
          <form onSubmit={handlePostAssignment} className="space-y-3">
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
            <button type="submit" className="w-full py-2 font-semibold text-xs rounded-xl border">
              Publish Assignment
            </button>
          </form>
        </div>
      )}

      {/* EXAMS MANAGER TAB */}
      {activeTab === 'exams' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl border space-y-4">
          <h2 className="text-lg font-bold">Create New Exam</h2>
          <form onSubmit={handlePostExam} className="space-y-3">
            <input
              type="text"
              placeholder="Exam Title (e.g. Midterm Physics)"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border"
              required
            />
            <input
              type="text"
              placeholder="Term (e.g. Term 1)"
              value={examForm.term}
              onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border"
              required
            />
            <div>
              <label className="block text-xs font-bold mb-1">Attach Exam Paper PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setExamForm({ ...examForm, file: e.target.files[0] })}
                className="w-full text-xs"
              />
            </div>
            <button type="submit" className="w-full py-2 font-semibold text-xs rounded-xl border">
              Publish Exam
            </button>
          </form>
        </div>
      )}

      {/* SUBMISSIONS & GRADING TAB */}
      {activeTab === 'submissions' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Student Submissions & Grading</h2>
            <button onClick={fetchSubmissions} className="px-3 py-1.5 text-xs font-semibold rounded-lg border">
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-xs">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div className="p-8 rounded-2xl text-center border">
              <p className="text-xs">No submissions found.</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded border">
                    Assignment #{sub.assignment}
                  </span>
                  <p className="text-xs font-bold">Student ID: {sub.student}</p>
                  <p className="text-xs p-2 rounded-xl border">
                    <strong>Notes:</strong> {sub.content || 'No text content.'}
                  </p>
                  {sub.file && (
                    <button
                      onClick={() => window.open(`http://127.0.0.1:8000${sub.file}`, '_blank')}
                      className="text-xs font-semibold underline block mt-1"
                    >
                      📄 Open Student PDF
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl border">
                  <div>
                    <label className="block text-[10px] font-bold mb-1">Grade</label>
                    <input
                      type="text"
                      placeholder={sub.grade || 'Grade'}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}