import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { groupsAPI } from '../../services/api';
import { Group } from '../../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const menuItems = [
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: BookOpen, label: 'Assignments', path: '/assignments' },
    { icon: BarChart3, label: 'Polls', path: '/polls' },
  ];

  if (user?.role === 'admin' || user?.role === 'hod') {
    menuItems.push({ icon: Settings, label: 'Admin', path: '/admin' });
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessage = (group: Group) => {
    // This would typically show the last message preview
    return `${group.members.length} members`;
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">BCA Communication</h1>
          <button className="p-1 hover:bg-green-700 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-green-100 capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b bg-gray-50">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex items-center justify-center py-3 text-xs font-medium transition-colors ${
              location.pathname === item.path
                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-4 h-4 mr-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredGroups.map((group) => (
              <Link
                key={group._id}
                to={`/chat/${group._id}`}
                className={`flex items-center p-3 hover:bg-gray-50 transition-colors ${
                  location.pathname === `/chat/${group._id}` ? 'bg-green-50 border-r-4 border-green-600' : ''
                }`}
              >
                {/* Group Avatar */}
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {group.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(group.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {formatLastMessage(group)}
                    </p>
                    
                    {/* Unread badge (placeholder) */}
                    {/* You can add unread message count here */}
                    {false && (
                      <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                        3
                      </span>
                    )}
                  </div>
                  
                  {/* Subject tag */}
                  <div className="mt-1">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {group.subject}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No chats found' : 'No groups joined yet'}
            </p>
            {!searchTerm && (
              <Link 
                to="/groups" 
                className="text-xs text-green-600 hover:text-green-700 mt-1 inline-block"
              >
                Browse groups
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t bg-gray-50">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;