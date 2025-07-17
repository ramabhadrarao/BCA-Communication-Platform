import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Users, 
  Info, 
  ArrowLeft,
  Image,
  FileText,
  BarChart3,
  BookOpen,
  X,
  Camera,
  Mic,
  Smile,
  Youtube
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { messagesAPI, groupsAPI, assignmentsAPI, pollsAPI } from '../../services/api';
import { Message, Group } from '../../types';
import MessageBubble from './MessageBubble';

const ChatWindow: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // UI States
  const [showMenu, setShowMenu] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  
  // File handling
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Assignment state
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    maxMarks: 100,
  });
  
  // Poll state
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    multipleChoice: false,
    expiresAt: '',
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMessages();
      
      if (socket) {
        socket.emit('join-group', groupId);
        
        const handleNewMessage = (newMessage: Message) => {
          console.log('📨 Received new message:', newMessage);
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => msg._id === newMessage._id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        };

        socket.on('new-message', handleNewMessage);
        
        return () => {
          socket.emit('leave-group', groupId);
          socket.off('new-message', handleNewMessage);
        };
      }
    }
  }, [groupId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node)) {
        setShowAttachments(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroup = async () => {
    try {
      const response = await groupsAPI.getGroup(groupId!);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(groupId!);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, file?: File, type?: string, youtubeUrl?: string) => {
    if (!content.trim() && !file) return;

    const formData = new FormData();
    formData.append('groupId', groupId!);
    formData.append('content', content);
    formData.append('type', type || 'text');
    
    if (file) {
      formData.append('file', file);
    }
    
    if (youtubeUrl) {
      formData.append('youtubeUrl', youtubeUrl);
    }

    try {
      const response = await messagesAPI.sendMessage(formData);
      const newMessage = response.data;
      
      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage]);
      
      if (socket) {
        socket.emit('send-message', { groupId, message: newMessage });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (file: File, type: string) => {
    console.log('📎 Uploading file:', file.name, 'Type:', type);
    sendMessage(file.name, file, type);
    setShowAttachments(false);
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleYoutubeShare = () => {
    const url = prompt('Enter YouTube URL:');
    if (url && url.trim()) {
      // Validate YouTube URL
      const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (youtubeRegex.test(url)) {
        sendMessage(url, undefined, 'youtube', url);
      } else {
        alert('Please enter a valid YouTube URL');
      }
    }
    setShowAttachments(false);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newAssignment.title);
    formData.append('description', newAssignment.description);
    formData.append('groupId', groupId!);
    formData.append('deadline', newAssignment.deadline);
    formData.append('maxMarks', newAssignment.maxMarks.toString());

    try {
      await assignmentsAPI.createAssignment(formData);
      setShowAssignmentModal(false);
      setNewAssignment({ title: '', description: '', deadline: '', maxMarks: 100 });
      fetchMessages(); // Refresh messages to show new assignment
      alert('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const pollData = {
      ...newPoll,
      groupId: groupId!,
      options: newPoll.options.filter(opt => opt.trim() !== ''),
    };

    try {
      await pollsAPI.createPoll(pollData);
      setShowPollModal(false);
      setNewPoll({ question: '', options: ['', ''], multipleChoice: false, expiresAt: '' });
      fetchMessages(); // Refresh messages to show new poll
      alert('Poll created successfully!');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    }
  };

  const handleMessageClick = (message: Message) => {
    if (message.type === 'assignment' && message.assignment) {
      navigate('/assignments');
    } else if (message.type === 'poll' && message.poll) {
      navigate('/polls');
    }
  };

  const canCreateContent = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Group not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-100">
      {/* WhatsApp-like Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/groups')}
            className="lg:hidden p-1 hover:bg-green-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {group.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{group.name}</h2>
            <p className="text-xs text-green-100 truncate">
              {group.members.length} members
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMembersModal(true)}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-green-700 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMembersModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Members</span>
                  </button>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4" />
                    <span>Group Info</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f0f0f0'
        }}
      >
        {messages.map((message) => (
          <div 
            key={message._id}
            onClick={() => handleMessageClick(message)}
            className={message.type === 'assignment' || message.type === 'poll' ? 'cursor-pointer' : ''}
          >
            <MessageBubble
              message={message}
              isOwnMessage={message.sender._id === user?._id}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-like Input Area */}
      <div className="bg-white border-t p-3">
        {/* Attachment Options */}
        {showAttachments && (
          <div className="mb-3 bg-white rounded-lg shadow-lg border p-3" ref={attachmentRef}>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={handleImageUpload}
                className="flex flex-col items-center space-y-1 p-3 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Image className="w-6 h-6 text-purple-600" />
                <span className="text-xs text-purple-600">Image</span>
              </button>
              
              <button
                onClick={handleFileSelect}
                className="flex flex-col items-center space-y-1 p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-xs text-blue-600">File</span>
              </button>

              <button
                onClick={handleYoutubeShare}
                className="flex flex-col items-center space-y-1 p-3 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Youtube className="w-6 h-6 text-red-600" />
                <span className="text-xs text-red-600">YouTube</span>
              </button>
              
              {canCreateContent && (
                <>
                  <button
                    onClick={() => {
                      setShowPollModal(true);
                      setShowAttachments(false);
                    }}
                    className="flex flex-col items-center space-y-1 p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <span className="text-xs text-green-600">Poll</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAssignmentModal(true);
                      setShowAttachments(false);
                    }}
                    className="flex flex-col items-center space-y-1 p-3 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <BookOpen className="w-6 h-6 text-orange-600" />
                    <span className="text-xs text-orange-600">Assignment</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end space-x-2">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none max-h-20 min-h-[40px]"
              rows={1}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log('📁 File selected:', file);
            handleFileUpload(file, 'file');
          }
          // Reset input
          if (e.target) {
            e.target.value = '';
          }
        }}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log('🖼️ Image selected:', file);
            handleFileUpload(file, 'image');
          }
          // Reset input
          if (e.target) {
            e.target.value = '';
          }
        }}
      />

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Group Members</h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.user.role === 'student' 
                        ? `${member.user.regdno} • Student` 
                        : member.user.role.charAt(0).toUpperCase() + member.user.role.slice(1)
                      }
                    </p>
                  </div>
                  {member.user._id === group.createdBy._id && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Create Assignment</h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Create Poll</h2>
              <button
                onClick={() => setShowPollModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePoll} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your poll question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...newPoll.options];
                          updatedOptions[index] = e.target.value;
                          setNewPoll({ ...newPoll, options: updatedOptions });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions = newPoll.options.filter((_, i) => i !== index);
                            setNewPoll({ ...newPoll, options: updatedOptions });
                          }}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                  className="mt-2 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
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
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm text-gray-700">Allow multiple choices</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (optional)</label>
                <input
                  type="datetime-local"
                  value={newPoll.expiresAt}
                  onChange={(e) => setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;