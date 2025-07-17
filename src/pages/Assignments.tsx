import React, { useState, useEffect } from 'react';
import { Plus, Clock, FileText, Download, Upload, Star, X, Paperclip } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentsAPI, groupsAPI } from '../services/api';
import { Assignment, Group } from '../types';
import { format } from 'date-fns';

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    groupId: '',
    deadline: '',
    maxMarks: 100,
  });

  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupsResponse = await groupsAPI.getGroups();
      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      const allAssignments: Assignment[] = [];
      for (const group of groupsData) {
        try {
          const assignmentsResponse = await assignmentsAPI.getAssignments(group._id);
          allAssignments.push(...assignmentsResponse.data);
        } catch (error) {
          console.error(`Error fetching assignments for group ${group._id}:`, error);
        }
      }

      allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('groupId', newAssignment.groupId);
    formData.append('deadline', newAssignment.deadline);
    formData.append('maxMarks', newAssignment.maxMarks.toString());

    try {
      await assignmentsAPI.createAssignment(formData);
      setShowCreateModal(false);
      setNewAssignment({
        title: '',
        description: '',
        groupId: '',
        deadline: '',
        maxMarks: 100,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || selectedFiles.length === 0) {
      alert('Please select at least one file to submit.');
      return;
    }

    setSubmissionLoading(true);
    const formData = new FormData();
    
    // Append all selected files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      console.log('📝 Submitting assignment:', selectedAssignment._id);
      console.log('📎 Files:', selectedFiles.length);
      
      await assignmentsAPI.submitAssignment(selectedAssignment._id, formData);
      
      console.log('✅ Assignment submitted successfully');
      alert('Assignment submitted successfully!');
      
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSelectedFiles([]);
      fetchData(); // Refresh to show updated submission status
      
    } catch (error: any) {
      console.error('❌ Error submitting assignment:', error);
      
      // More detailed error handling
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'Assignment deadline has passed or already submitted.');
      } else if (error.response?.status === 404) {
        alert('Assignment not found.');
      } else {
        alert('Failed to submit assignment. Please try again.');
      }
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGradeSubmission = async (assignmentId: string, submissionId: string) => {
    if (!gradeData.grade || gradeData.grade < 0) {
      alert('Please enter a valid grade.');
      return;
    }

    try {
      await assignmentsAPI.gradeAssignment(assignmentId, submissionId, gradeData);
      setGradeData({ grade: 0, feedback: '' });
      fetchData();
      alert('Grade submitted successfully!');
    } catch (error) {
      console.error('Error grading assignment:', error);
      alert('Failed to submit grade. Please try again.');
    }
  };

  const downloadGradeSheet = async (assignmentId: string) => {
    try {
      const response = await assignmentsAPI.getGradeSheet(assignmentId);
      const gradeSheet = response.data;
      
      const csvContent = [
        ['Name', 'Registration Number', 'Submitted At', 'Grade', 'Feedback', 'Graded'].join(','),
        ...gradeSheet.submissions.map((sub: any) => [
          sub.studentName,
          sub.regdno,
          sub.submittedAt ? format(new Date(sub.submittedAt), 'yyyy-MM-dd HH:mm') : 'Not submitted',
          sub.grade || 0,
          sub.feedback || '',
          sub.graded ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gradeSheet.assignmentTitle}_grades.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading grade sheet:', error);
      alert('Failed to download grade sheet.');
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-yellow-600' };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
    return { text: `Due in ${days} days`, color: 'text-green-600' };
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (user?.role === 'student') {
      const submission = assignment.submissions.find(sub => sub.student._id === user._id);
      if (submission) {
        return {
          text: submission.graded ? `Graded: ${submission.grade}/${assignment.maxMarks}` : 'Submitted',
          color: submission.graded ? 'text-green-600' : 'text-blue-600',
          submitted: true,
          submission
        };
      }
      return { text: 'Not submitted', color: 'text-gray-600', submitted: false };
    }
    return { 
      text: `${assignment.submissions.length} submissions`, 
      color: 'text-blue-600',
      submitted: false
    };
  };

  const canCreateAssignments = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          {canCreateAssignments && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Assignment</span>
            </button>
          )}
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const deadlineStatus = formatDeadline(assignment.deadline);
            const submissionStatus = getSubmissionStatus(assignment);
            const isStudent = user?.role === 'student';
            const canSubmit = isStudent && !submissionStatus.submitted && new Date(assignment.deadline) > new Date();

            return (
              <div key={assignment._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Created by {assignment.createdBy.name}</span>
                      <span>Max Marks: {assignment.maxMarks}</span>
                      <span className={deadlineStatus.color}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        {deadlineStatus.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canSubmit && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmitModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Submit</span>
                      </button>
                    )}
                    {canCreateAssignments && (
                      <button
                        onClick={() => downloadGradeSheet(assignment._id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Grade Sheet</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${submissionStatus.color}`}>
                      {submissionStatus.text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Due: {format(new Date(assignment.deadline), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>

                {/* Show submission details for students */}
                {isStudent && submissionStatus.submitted && submissionStatus.submission && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Submission</h4>
                    <div className="text-sm text-gray-600">
                      <p>Submitted: {format(new Date(submissionStatus.submission.submittedAt), 'MMM dd, yyyy HH:mm')}</p>
                      <p>Files: {submissionStatus.submission.files.length}</p>
                      {submissionStatus.submission.graded && (
                        <>
                          <p className="text-green-600 font-medium">
                            Grade: {submissionStatus.submission.grade}/{assignment.maxMarks}
                          </p>
                          {submissionStatus.submission.feedback && (
                            <p>Feedback: {submissionStatus.submission.feedback}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Submissions for Faculty */}
                {canCreateAssignments && assignment.submissions.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Submissions</h4>
                    <div className="space-y-2">
                      {assignment.submissions.map((submission) => (
                        <div
                          key={submission._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {submission.student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {submission.student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {submission.student.regdno} • Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {submission.graded ? (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-green-600">
                                  {submission.grade}/{assignment.maxMarks}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  max={assignment.maxMarks}
                                  min="0"
                                  placeholder="Grade"
                                  value={gradeData.grade}
                                  onChange={(e) => setGradeData({ ...gradeData, grade: parseInt(e.target.value) || 0 })}
                                  className="w-16 px-2 py-1 text-sm border rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Feedback"
                                  value={gradeData.feedback}
                                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                  className="w-32 px-2 py-1 text-sm border rounded"
                                />
                                <button
                                  onClick={() => handleGradeSubmission(assignment._id, submission._id)}
                                  className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Grade
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <select
                    required
                    value={newAssignment.groupId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, groupId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} - {group.subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submit Assignment Modal */}
        {showSubmitModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Submit Assignment
                </h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.description}</p>
                <p className="text-sm text-red-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Due: {format(new Date(selectedAssignment.deadline), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Select multiple files (documents, images, etc.)
                    </p>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      setSelectedAssignment(null);
                      setSelectedFiles([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedFiles.length === 0 || submissionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submissionLoading ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;