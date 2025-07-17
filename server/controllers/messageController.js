import Message from '../models/Message.js';
import Group from '../models/Group.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMessage = async (req, res) => {
  try {
    const { groupId, content, type = 'text', youtubeUrl } = req.body;
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    console.log('📨 Sending message:', { groupId, content, type, youtubeUrl });
    console.log('📎 File received:', req.file ? req.file.originalname : 'No file');

    // Handle file upload
    if (req.file) {
      const user = req.user;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      const fileExtension = path.extname(req.file.originalname);
      const purpose = type === 'assignment' ? 'assignment' : 'message';
      
      // Use the actual stored filename from multer
      fileName = req.file.originalname; // Keep original name for display
      fileUrl = `/uploads/${req.file.filename}`; // Use multer's generated filename
      fileSize = req.file.size;

      console.log('✅ File processed:', { fileName, fileUrl, fileSize });
    }

    // Determine message type based on file or content
    let messageType = type;
    if (req.file && !type) {
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
      const audioExtensions = ['.mp3', '.wav', '.ogg'];
      
      if (imageExtensions.includes(fileExtension)) {
        messageType = 'image';
      } else if (videoExtensions.includes(fileExtension)) {
        messageType = 'video';
      } else if (audioExtensions.includes(fileExtension)) {
        messageType = 'audio';
      } else {
        messageType = 'file';
      }
    }

    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content: content || fileName || youtubeUrl || '',
      type: messageType,
      fileUrl,
      fileName,
      fileSize,
      youtubeUrl
    });

    await message.save();

    // Add message to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role regdno photo');

    console.log('✅ Message sent successfully:', populatedMessage._id);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email role regdno photo')
      .populate('poll')
      .populate('assignment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already read
    const alreadyRead = message.readBy.some(read => 
      read.user.toString() === req.user.userId
    );

    if (!alreadyRead) {
      message.readBy.push({ user: req.user.userId });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or faculty
    if (message.sender.toString() !== req.user.userId && 
        req.user.role !== 'faculty' && 
        req.user.role !== 'admin' && 
        req.user.role !== 'hod') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};