import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [{
      fileName: {
        type: String,
        required: true
      },
      fileUrl: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      }
    }],
    grade: {
      type: Number,
      default: 0,
      min: 0
    },
    feedback: {
      type: String,
      default: '',
      trim: true
    },
    graded: {
      type: Boolean,
      default: false
    },
    gradedAt: {
      type: Date
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
assignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validate that grade doesn't exceed maxMarks
assignmentSchema.pre('save', function(next) {
  for (let submission of this.submissions) {
    if (submission.grade > this.maxMarks) {
      return next(new Error(`Grade ${submission.grade} exceeds maximum marks ${this.maxMarks}`));
    }
  }
  next();
});

// Add virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Add virtual for graded submission count
assignmentSchema.virtual('gradedCount').get(function() {
  return this.submissions.filter(sub => sub.graded).length;
});

// Add virtual for average grade
assignmentSchema.virtual('averageGrade').get(function() {
  const gradedSubmissions = this.submissions.filter(sub => sub.graded);
  if (gradedSubmissions.length === 0) return 0;
  
  const totalGrades = gradedSubmissions.reduce((sum, sub) => sum + sub.grade, 0);
  return Math.round((totalGrades / gradedSubmissions.length) * 100) / 100;
});

// Ensure virtuals are included in JSON output
assignmentSchema.set('toJSON', { virtuals: true });

// Index for better query performance
assignmentSchema.index({ group: 1, createdAt: -1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

export default mongoose.model('Assignment', assignmentSchema);