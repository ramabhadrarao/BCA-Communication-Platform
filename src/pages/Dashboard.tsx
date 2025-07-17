import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, BookOpen, BarChart3, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI, assignmentsAPI, pollsAPI } from '../services/api';
import { Group, Assignment, Poll } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [recentPolls, setRecentPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalAssignments: 0,
    totalPolls: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsResponse] = await Promise.all([
        groupsAPI.getGroups(),
      ]);

      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      // Fetch assignments and polls for each group
      const allAssignments: Assignment[] = [];
      const allPolls: Poll[] = [];

      for (const group of groupsData) {
        try {
          const [assignmentsResponse, pollsResponse] = await Promise.all([
            assignmentsAPI.getAssignments(group._id),
            pollsAPI.getPolls(group._id),
          ]);

          allAssignments.push(...assignmentsResponse.data);
          allPolls.push(...pollsResponse.data);
        } catch (error) {
          console.error(`Error fetching data for group ${group._id}:`, error);
        }
      }

      // Sort by creation date and take recent ones
      allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      allPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRecentAssignments(allAssignments.slice(0, 5));
      setRecentPolls(allPolls.slice(0, 5));

      // Calculate stats
      const pendingSubmissions = allAssignments.filter(assignment => {
        if (user?.role === 'student') {
          return !assignment.submissions.some(sub => sub.student._id === user._id) &&
                 new Date(assignment.deadline) > new Date();
        }
        return 0;
      }).length;

      setStats({
        totalGroups: groupsData.length,
        totalAssignments: allAssignments.length,
        totalPolls: allPolls.length,
        pendingSubmissions,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { text: 'Overdue', color: 'text-red-600', icon: AlertCircle };
    if (days === 0) return { text: 'Due today', color: 'text-yellow-600', icon: Clock };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600', icon: Clock };
    return { text: `Due in ${days} days`, color: 'text-green-600', icon: CheckCircle };
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (user?.role === 'student') {
      // Check if the current user has submitted this assignment
      const userSubmission = assignment.submissions.find(
        submission => submission.student._id === user._id
      );
      
      if (userSubmission) {
        if (userSubmission.graded) {
          return {
            text: `Graded: ${userSubmission.grade}/${assignment.maxMarks}`,
            color: 'text-green-600',
            status: 'graded',
            submission: userSubmission
          };
        } else {
          return {
            text: 'Submitted - Awaiting Grade',
            color: 'text-blue-600',
            status: 'submitted',
            submission: userSubmission
          };
        }
      } else {
        // Check if deadline has passed
        const isOverdue = new Date() > new Date(assignment.deadline);
        return {
          text: isOverdue ? 'Not Submitted (Overdue)' : 'Not Submitted',
          color: isOverdue ? 'text-red-600' : 'text-orange-600',
          status: 'not_submitted'
        };
      }
    } else {
      // For faculty/admin
      const totalSubmissions = assignment.submissions.length;
      const gradedSubmissions = assignment.submissions.filter(sub => sub.graded).length;
      
      return {
        text: `${totalSubmissions} submissions (${gradedSubmissions} graded)`,
        color: 'text-blue-600',
        status: 'faculty_view'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <div className="text-sm text-gray-500">
            {user?.role === 'student' ? `${user.regdno} • ${user.currentBatch}` : user?.role}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Polls</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPolls}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {user?.role === 'student' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
                </div>
                <div className={`p-3 rounded-lg ${stats.pendingSubmissions > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <Clock className={`w-6 h-6 ${stats.pendingSubmissions > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Groups */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
                <Link to="/groups" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                {groups.slice(0, 5).map((group) => (
                  <Link
                    key={group._id}
                    to={`/chat/${group._id}`}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {group.subject} • {group.members.length} members
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
                {groups.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No groups joined yet</p>
                    <Link 
                      to="/groups" 
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                    >
                      Browse groups
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                <Link to="/assignments" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                {recentAssignments.map((assignment) => {
                  const submissionStatus = getSubmissionStatus(assignment);
                  const deadlineStatus = formatDeadline(assignment.deadline);
                  
                  return (
                    <Link
                      key={assignment._id}
                      to="/assignments"
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {assignment.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs ${deadlineStatus.color}`}>
                            {deadlineStatus.text}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs ${submissionStatus.color} font-medium`}>
                            {submissionStatus.text}
                          </span>
                          {submissionStatus.status === 'graded' && submissionStatus.submission && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                              {submissionStatus.submission.grade}/{assignment.maxMarks}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <span>{assignment.maxMarks} pts</span>
                          {user?.role !== 'student' && (
                            <span className="text-blue-600">{assignment.submissions.length} submissions</span>
                          )}
                          {user?.role === 'student' && submissionStatus.status === 'not_submitted' && (
                            <span className="text-orange-600 font-medium">Action needed</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {recentAssignments.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No assignments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Polls */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Polls</h2>
              <Link to="/polls" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentPolls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                {recentPolls.map((poll) => (
                  <div key={poll._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {poll.question}
                      </h3>
                      <BarChart3 className="w-4 h-4 text-purple-500 flex-shrink-0 ml-2" />
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Created by {poll.createdBy.name}
                    </p>
                    
                    <div className="space-y-2">
                      {poll.options.slice(0, 2).map((option, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 truncate flex-1">
                            {option.text}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {option.votes.length} votes
                          </span>
                        </div>
                      ))}
                      {poll.options.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{poll.options.length - 2} more options
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No polls yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Faculty */}
        {(user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod') && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/groups"
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Group</p>
                    <p className="text-xs text-gray-500">Start a new class group</p>
                  </div>
                </Link>

                <Link
                  to="/assignments"
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Assignment</p>
                    <p className="text-xs text-gray-500">Create assignment</p>
                  </div>
                </Link>

                <Link
                  to="/polls"
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Poll</p>
                    <p className="text-xs text-gray-500">Get student feedback</p>
                  </div>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admin Panel</p>
                      <p className="text-xs text-gray-500">Manage users</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;