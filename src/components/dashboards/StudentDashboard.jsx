import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, BookOpenCheck, FileText, GraduationCap, 
  CheckCircle2, Clock, Award, AlertCircle, Download, Send, Loader2 
} from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
        if (tab === 'materials') {
            const res = await axios.get('http://127.0.0.1:8000/api/students/materials/', apiConfig);
            setMaterials(res.data);
        }else if (tab === 'assignments') {
            const res = await axios.get('http://127.0.0.1:8000/api/students/assignments/', apiConfig); // Added /students/
            setAssignments(res.data);
        } else if (tab === 'exams') {
            const res = await axios.get('http://127.0.0.1:8000/api/students/exams/', apiConfig); // Added /students/
            setExams(res.data);
        } else if (tab === 'results') {
            const res = await axios.get('http://127.0.0.1:8000/api/students/my-assignment-submissions/', apiConfig); // Added /students/
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
      await axios.post(
        `http://127.0.0.1:8000/api/assignments/${assignmentId}/submit/`, 
        { content: submissionContent }, 
        apiConfig
      );
      alert('Assignment submitted successfully!');
      setSubmittingId(null);
      setSubmissionContent('');
      fetchTabData('assignments'); // Refresh list
    } catch (err) {
      console.error('Submission failed:', err);
      alert(err.response?.data?.detail || 'Failed to submit assignment.');
    }
  };

  return (
    <div>
     

      
    </div>
  );
}