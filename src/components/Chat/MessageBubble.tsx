import React from 'react';
import { format } from 'date-fns';
import { Download, Play, ExternalLink, FileText, BarChart3, BookOpen, Check, CheckCheck } from 'lucide-react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'file':
        return (
          <div className="bg-white border rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-3">
              {getFileIcon(message.fileName!)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {message.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {(message.fileSize! / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <a
                href={`http://localhost:3001${message.fileUrl}`}
                download
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </a>
            </div>
            {message.content && (
              <p className="text-sm text-gray-800">{message.content}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="bg-white border rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 text-blue-500" />
              <audio controls className="flex-1">
                <source src={`http://localhost:3001${message.fileUrl}`} />
              </audio>
            </div>
            {message.content && (
              <p className="text-sm text-gray-800 mt-2">{message.content}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2 max-w-xs">
            <video controls className="rounded-lg w-full h-auto" style={{ maxHeight: '300px' }}>
              <source src={`http://localhost:3001${message.fileUrl}`} />
            </video>
            {message.content && (
              <p className="text-sm text-gray-800">{message.content}</p>
            )}
          </div>
        );

      case 'youtube':
        return (
          <div className="bg-white border rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">YouTube Video</span>
            </div>
            <a
              href={message.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {message.youtubeUrl}
            </a>
            {message.content && (
              <p className="text-sm text-gray-800 mt-2">{message.content}</p>
            )}
          </div>
        );

      case 'poll':
        return (
          <div className="bg-white border rounded-lg p-4 max-w-sm">
            <div className="flex items-center space-x-2 text-purple-600 mb-3">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Poll Created</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">{message.content}</p>
            <p className="text-xs text-gray-500">Tap to view and vote</p>
          </div>
        );

      case 'assignment':
        return (
          <div className="bg-white border rounded-lg p-4 max-w-sm">
            <div className="flex items-center space-x-2 text-orange-600 mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Assignment Posted</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">{message.content}</p>
            <p className="text-xs text-gray-500">Tap to view details and submit</p>
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        );
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="max-w-[75%] sm:max-w-[60%]">
        {/* Sender name for group messages (only for others' messages) */}
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {message.sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {message.sender.name}
            </span>
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`relative px-3 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-green-500 text-white rounded-br-none'
              : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
          }`}
        >
          {/* Message content */}
          <div className={isOwnMessage ? 'text-white' : 'text-gray-800'}>
            {renderMessageContent()}
          </div>
          
          {/* Time and status */}
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isOwnMessage ? 'text-green-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {formatTime(message.createdAt)}
            </span>
            {isOwnMessage && (
              <div className="flex items-center">
                {message.readBy && message.readBy.length > 0 ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;