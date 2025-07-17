import Assignment from '../models/Assignment.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createAssignment = async (req, res) => {
  try {
    const { title, description, groupId, deadline, maxMarks } = req.body;
    
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size
      }));
    }

    const assignment = new Assignment({
      title,
      description,
      group: groupId,
      createdBy: req.user.userId,
      deadline: new Date(deadline),
      maxMarks: maxMarks || 100,
      attachments
    });

    await assignment.save();

    // Add assignment to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { assignments: assignment._id }
    });

    // Create a message for the assignment
    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content: `Assignment: ${title}`,
      type: 'assignment',
      assignment: assignment._id
    });

    await message.save();

    // Add message to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id }
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('createdBy', 'name email role')
      .populate('group', 'name');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const assignments = await Assignment.find({ group: groupId })
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('group', 'name')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    console.log('📝 Submitting assignment:', assignmentId);
    console.log('👤 User:', req.user.userId);
    console.log('📎 Files received:', req.files?.length || 0);

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.log('❌ Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if deadline has passed
    if (new Date() > assignment.deadline) {
      console.log('⏰ Assignment deadline has passed');
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.userId
    );

    if (existingSubmission) {
      console.log('⚠️ Assignment already submitted');
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Get user details for file naming
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let files = [];
    if (req.files && req.files.length > 0) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      files = req.files.map((file, index) => {
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension);
        
        // Create a more descriptive filename
        const fileName = `${user.regdno || user._id}_${user.name.replace(/\s+/g, '_')}_${assignment.title.replace(/\s+/g, '_')}_${dateStr}_${timeStr}_${index + 1}${fileExtension}`;
        
        return {
          fileName: file.originalname, // Keep original name for display
          fileUrl: `/uploads/${file.filename}`, // Server stored filename
          fileSize: file.size
        };
      });

      console.log('✅ Files processed:', files.length);
    } else {
      console.log('❌ No files provided');
      return res.status(400).json({ message: 'No files provided for submission' });
    }

    // Create submission
    const newSubmission = {
      student: req.user.userId,
      files,
      submittedAt: new Date(),
      grade: 0,
      feedback: '',
      graded: false
    };

    assignment.submissions.push(newSubmission);
    await assignment.save();

    console.log('✅ Assignment submitted successfully');

    // Populate and return updated assignment
    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    res.status(200).json({
      message: 'Assignment submitted successfully',
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('❌ Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    console.log('📊 Grading assignment:', { assignmentId, submissionId, grade, feedback });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Validate grade
    if (grade < 0 || grade > assignment.maxMarks) {
      return res.status(400).json({ 
        message: `Grade must be between 0 and ${assignment.maxMarks}` 
      });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.graded = true;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.userId;

    await assignment.save();

    console.log('✅ Assignment graded successfully');

    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    res.json({
      message: 'Assignment graded successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('❌ Error grading assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGradeSheet = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('group', 'name subject batch semester')
      .populate('submissions.student', 'name email regdno')
      .populate('submissions.gradedBy', 'name email role');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const gradeSheet = {
      assignmentTitle: assignment.title,
      subject: assignment.group.subject,
      batch: assignment.group.batch,
      semester: assignment.group.semester,
      maxMarks: assignment.maxMarks,
      totalSubmissions: assignment.submissions.length,
      gradedSubmissions: assignment.submissions.filter(sub => sub.graded).length,
      deadline: assignment.deadline,
      createdAt: assignment.createdAt,
      submissions: assignment.submissions.map(sub => ({
        studentName: sub.student.name,
        regdno: sub.student.regdno,
        email: sub.student.email,
        submittedAt: sub.submittedAt,
        grade: sub.grade,
        feedback: sub.feedback,
        graded: sub.graded,
        gradedAt: sub.gradedAt,
        filesCount: sub.files.length
      }))
    };

    res.json(gradeSheet);
  } catch (error) {
    console.error('Error generating grade sheet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};