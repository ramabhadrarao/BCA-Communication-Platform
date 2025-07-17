import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Users, Clock, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pollsAPI, groupsAPI } from '../services/api';
import { Poll, Group } from '../types';
import { format } from 'date-fns';

const Polls: React.FC = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    groupId: '',
    multipleChoice: false,
    expiresAt: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupsResponse = await groupsAPI.getGroups();
      const groupsData = groupsResponse.data;
      setGroups(groupsData);

      const allPolls: Poll[] = [];
      for (const group of groupsData) {
        try {
          const pollsResponse = await pollsAPI.getPolls(group._id);
          allPolls.push(...pollsResponse.data);
        } catch (error) {
          console.error(`Error fetching polls for group ${group._id}:`, error);
        }
      }

      allPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPolls(allPolls);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const pollData = {
      ...newPoll,
      options: newPoll.options.filter(opt => opt.trim() !== ''),
    };

    try {
      await pollsAPI.createPoll(pollData);
      setShowCreateModal(false);
      setNewPoll({
        question: '',
        options: ['', ''],
        groupId: '',
        multipleChoice: false,
        expiresAt: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await pollsAPI.votePoll(pollId, optionIndex);
      fetchData();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, ''],
    });
  };

  const removeOption = (index: number) => {
    setNewPoll({
      ...newPoll,
      options: newPoll.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: updatedOptions,
    });
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.options.some(option =>
      option.votes.some(vote => vote.user._id === user?._id)
    );
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (poll: Poll, optionIndex: number) => {
    const totalVotes = getTotalVotes(poll);
    if (totalVotes === 0) return 0;
    return (poll.options[optionIndex].votes.length / totalVotes) * 100;
  };

  const isPollExpired = (poll: Poll) => {
    return poll.expiresAt && new Date(poll.expiresAt) < new Date();
  };

  const canCreatePolls = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';
  const canVote = user?.role === 'student';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
          {canCreatePolls && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Poll</span>
            </button>
          )}
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.map((poll) => {
            const totalVotes = getTotalVotes(poll);
            const userVoted = hasUserVoted(poll);
            const expired = isPollExpired(poll);

            return (
              <div key={poll._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.question}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Created by {poll.createdBy.name}</span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{totalVotes} votes</span>
                      </span>
                      {poll.expiresAt && (
                        <span className={`flex items-center space-x-1 ${expired ? 'text-red-600' : 'text-yellow-600'}`}>
                          <Clock className="w-4 h-4" />
                          <span>
                            {expired ? 'Expired' : `Expires ${format(new Date(poll.expiresAt), 'MMM dd, yyyy HH:mm')}`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    {poll.multipleChoice && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Multiple Choice
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const votes = option.votes.length;
                    const percentage = getVotePercentage(poll, index);
                    const userVotedForThis = option.votes.some(vote => vote.user._id === user?._id);

                    return (
                      <div key={index} className="relative">
                        <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          userVotedForThis ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}>
                          <div className="flex items-center space-x-3 flex-1">
                            {canVote && !userVoted && !expired && (
                              <button
                                onClick={() => handleVote(poll._id, index)}
                                className="w-5 h-5 border-2 border-gray-400 rounded-full hover:border-blue-500 flex-shrink-0 transition-colors"
                              />
                            )}
                            {userVotedForThis && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900 flex-1">{option.text}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{votes} votes</span>
                            <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        {totalVotes > 0 && (
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg transition-all duration-500"
                            style={{ width: `${percentage}%` }} 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Vote Details for Faculty */}
                {canCreatePolls && totalVotes > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Vote Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {poll.options.map((option, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-2">{option.text}</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {option.votes.map((vote, voteIndex) => (
                              <div key={voteIndex} className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">
                                    {vote.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600 truncate">{vote.user.name}</span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(vote.votedAt), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                            ))}
                            {option.votes.length === 0 && (
                              <span className="text-xs text-gray-500">No votes yet</span>
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

          {/* Empty State */}
          {polls.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-500 mb-4">
                {canCreatePolls ? 'Create your first poll to get student feedback.' : 'Polls will appear here when faculty creates them.'}
              </p>
              {canCreatePolls && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Poll</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Create Poll</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePoll} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    required
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your poll question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  <select
                    required
                    value={newPoll.groupId}
                    onChange={(e) => setNewPoll({ ...newPoll, groupId: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        {newPoll.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Add Option
                  </button>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPoll.multipleChoice}
                      onChange={(e) => setNewPoll({ ...newPoll, multipleChoice: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow multiple choices</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiration (optional)</label>
                  <input
                    type="datetime-local"
                    value={newPoll.expiresAt}
                    onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
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
                    Create Poll
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

export default Polls;