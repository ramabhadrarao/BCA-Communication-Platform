import React, { useState, useEffect } from 'react';
import { Plus, Users, Book, Calendar, Search, MoreVertical, UserPlus, UserMinus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupsAPI, authAPI } from '../services/api';
import { Group, User } from '../types';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    batch: '',
    semester: '',
  });

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupsAPI.createGroup(newGroup);
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        batch: '',
        semester: '',
      });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleManageMembers = async (group: Group) => {
    console.log('📋 Managing members for group:', group.name);
    setSelectedGroup(group);
    
    try {
      console.log('🔍 Fetching available students...');
      const response = await groupsAPI.getAvailableStudents(group._id);
      console.log('✅ Available students:', response.data);
      setAvailableStudents(response.data);
      setShowMembersModal(true);
    } catch (error) {
      console.error('❌ Error fetching available students:', error);
      // Still show the modal even if we can't fetch available students
      setAvailableStudents([]);
      setShowMembersModal(true);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      console.log('➕ Adding member:', userId, 'to group:', selectedGroup._id);
      await groupsAPI.addMember(selectedGroup._id, userId);
      
      // Remove from available students
      setAvailableStudents(prev => prev.filter(student => student._id !== userId));
      
      // Refresh groups to update member count
      fetchGroups();
      
      // Update the selected group members
      const updatedGroup = await groupsAPI.getGroup(selectedGroup._id);
      setSelectedGroup(updatedGroup.data);
      
      console.log('✅ Member added successfully');
    } catch (error) {
      console.error('❌ Error adding member:', error);
      alert('Failed to add member. Please try again.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;

    // Don't allow removing the group creator
    if (userId === selectedGroup.createdBy._id) {
      alert('Cannot remove the group creator');
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      console.log('➖ Removing member:', userId, 'from group:', selectedGroup._id);
      await groupsAPI.removeMember(selectedGroup._id, userId);
      
      // Refresh groups to update member count
      fetchGroups();
      
      // Update the selected group members
      const updatedGroup = await groupsAPI.getGroup(selectedGroup._id);
      setSelectedGroup(updatedGroup.data);
      
      // Refresh available students
      const availableResponse = await groupsAPI.getAvailableStudents(selectedGroup._id);
      setAvailableStudents(availableResponse.data);
      
      console.log('✅ Member removed successfully');
    } catch (error) {
      console.error('❌ Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const canManageGroups = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    student.regdno?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const filteredCurrentMembers = selectedGroup ? 
    selectedGroup.members.filter(member =>
      member.user.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      (member.user.regdno && member.user.regdno.toLowerCase().includes(memberSearchTerm.toLowerCase()))
    ) : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        {canManageGroups && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.description}</p>
                </div>
                {canManageGroups && (
                  <div className="relative">
                    <button
                      onClick={() => handleManageMembers(group)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Manage Members"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Book className="w-4 h-4" />
                  <span>{group.subject}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{group.batch} • Semester {group.semester}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{group.members.length} members</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member) => (
                    <div
                      key={member.user._id}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                      title={member.user.name}
                    >
                      <span className="text-white text-xs font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-gray-600 text-xs">+{group.members.length - 4}</span>
                    </div>
                  )}
                </div>
                <a
                  href={`/chat/${group._id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Chat
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.subject}
                  onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroup.batch}
                    onChange={(e) => setNewGroup({ ...newGroup, batch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2023-2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    required
                    value={newGroup.semester}
                    onChange={(e) => setNewGroup({ ...newGroup, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                    <option value="5">5th</option>
                    <option value="6">6th</option>
                  </select>
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
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Members - {selectedGroup.name}
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search for members */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search members and students..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Current Members ({selectedGroup.members.length})
                </h3>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {filteredCurrentMembers.length > 0 ? (
                    <div className="divide-y">
                      {filteredCurrentMembers.map((member) => (
                        <div
                          key={member.user._id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {member.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                              <p className="text-xs text-gray-500">
                                {member.user.role === 'student' 
                                  ? `${member.user.regdno} • Student` 
                                  : member.user.role.charAt(0).toUpperCase() + member.user.role.slice(1)
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {member.user._id === selectedGroup.createdBy._id && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Creator
                              </span>
                            )}
                            {member.user._id !== selectedGroup.createdBy._id && canManageGroups && (
                              <button
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <UserMinus className="w-4 h-4" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No members found matching your search.
                    </div>
                  )}
                </div>
              </div>

              {/* Available Students */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Available Students ({filteredAvailableStudents.length})
                </h3>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {filteredAvailableStudents.length > 0 ? (
                    <div className="divide-y">
                      {filteredAvailableStudents.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">
                                {student.regdno} • {student.currentBatch} • Sem {student.currentSemester}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddMember(student._id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {availableStudents.length === 0 
                        ? "No eligible students found for this group."
                        : "No students found matching your search."
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;