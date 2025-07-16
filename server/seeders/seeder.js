// server/seeders/seeder.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import Assignment from '../models/Assignment.js';
import Poll from '../models/Poll.js';

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bca-communication';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
    await Assignment.deleteMany({});
    await Poll.deleteMany({});
    console.log('🧹 Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Create default users
const createUsers = async () => {
  try {
    const users = [
      // Admin User
      {
        name: 'System Administrator',
        email: 'admin@bcacomm.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        approved: true,
      },
      
      // HOD User
      {
        name: 'Dr. Rajesh Kumar',
        email: 'hod@bcacomm.edu',
        password: await bcrypt.hash('hod123', 10),
        role: 'hod',
        approved: true,
      },
      
      // Faculty Users
      {
        name: 'Prof. Priya Sharma',
        email: 'priya.sharma@bcacomm.edu',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'Data Structures',
        batch: '2023-2026',
        semester: '3',
        approved: true,
      },
      {
        name: 'Dr. Amit Patel',
        email: 'amit.patel@bcacomm.edu',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'Database Management',
        batch: '2023-2026',
        semester: '3',
        approved: true,
      },
      {
        name: 'Prof. Sunita Verma',
        email: 'sunita.verma@bcacomm.edu',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'Web Development',
        batch: '2023-2026',
        semester: '4',
        approved: true,
      },
      {
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@bcacomm.edu',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'Computer Networks',
        batch: '2024-2027',
        semester: '2',
        approved: true,
      },
      
      // Student Users - 3rd Semester
      {
        regdno: 'BCA230001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '3',
        currentBatch: '2023-2026',
        approved: true,
      },
      {
        regdno: 'BCA230002',
        name: 'Priya Gupta',
        email: 'priya.gupta@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '3',
        currentBatch: '2023-2026',
        approved: true,
      },
      {
        regdno: 'BCA230003',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '3',
        currentBatch: '2023-2026',
        approved: true,
      },
      {
        regdno: 'BCA230004',
        name: 'Sneha Patel',
        email: 'sneha.patel@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '3',
        currentBatch: '2023-2026',
        approved: true,
      },
      {
        regdno: 'BCA230005',
        name: 'Karan Joshi',
        email: 'karan.joshi@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '3',
        currentBatch: '2023-2026',
        approved: true,
      },
      
      // Student Users - 4th Semester
      {
        regdno: 'BCA220001',
        name: 'Neha Singh',
        email: 'neha.singh@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '4',
        currentBatch: '2023-2026',
        approved: true,
      },
      {
        regdno: 'BCA220002',
        name: 'Rohit Kumar',
        email: 'rohit.kumar@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '4',
        currentBatch: '2023-2026',
        approved: true,
      },
      
      // Student Users - 2nd Semester
      {
        regdno: 'BCA240001',
        name: 'Ananya Desai',
        email: 'ananya.desai@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2027',
        approved: true,
      },
      {
        regdno: 'BCA240002',
        name: 'Siddharth Rao',
        email: 'siddharth.rao@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2027',
        approved: true,
      },
      
      // Pending Users (for testing admin approval)
      {
        regdno: 'BCA240003',
        name: 'Ravi Agarwal',
        email: 'ravi.agarwal@student.bcacomm.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2027',
        approved: false,
      },
      {
        name: 'Dr. Meera Jain',
        email: 'meera.jain@bcacomm.edu',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'Software Engineering',
        batch: '2023-2026',
        semester: '5',
        approved: false,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

// Create groups and assign members
const createGroups = async (users) => {
  try {
    const faculty = users.filter(u => u.role === 'faculty');
    const students = users.filter(u => u.role === 'student' && u.approved);
    
    const groups = [];
    
    // Data Structures Group (3rd Semester)
    const dsStudents = students.filter(s => s.currentSemester === '3');
    const dsGroup = new Group({
      name: 'Data Structures - Sem 3',
      description: 'Learn about arrays, linked lists, stacks, queues, and trees',
      subject: 'Data Structures',
      batch: '2023-2026',
      semester: '3',
      createdBy: faculty.find(f => f.subject === 'Data Structures')._id,
      members: [
        { user: faculty.find(f => f.subject === 'Data Structures')._id },
        ...dsStudents.map(s => ({ user: s._id }))
      ]
    });
    groups.push(dsGroup);
    
    // Database Management Group (3rd Semester)
    const dbGroup = new Group({
      name: 'Database Management - Sem 3',
      description: 'Database design, SQL, and database administration',
      subject: 'Database Management',
      batch: '2023-2026',
      semester: '3',
      createdBy: faculty.find(f => f.subject === 'Database Management')._id,
      members: [
        { user: faculty.find(f => f.subject === 'Database Management')._id },
        ...dsStudents.map(s => ({ user: s._id }))
      ]
    });
    groups.push(dbGroup);
    
    // Web Development Group (4th Semester)
    const webStudents = students.filter(s => s.currentSemester === '4');
    const webGroup = new Group({
      name: 'Web Development - Sem 4',
      description: 'HTML, CSS, JavaScript, and modern web frameworks',
      subject: 'Web Development',
      batch: '2023-2026',
      semester: '4',
      createdBy: faculty.find(f => f.subject === 'Web Development')._id,
      members: [
        { user: faculty.find(f => f.subject === 'Web Development')._id },
        ...webStudents.map(s => ({ user: s._id }))
      ]
    });
    groups.push(webGroup);
    
    // Computer Networks Group (2nd Semester)
    const networkStudents = students.filter(s => s.currentSemester === '2');
    const networkGroup = new Group({
      name: 'Computer Networks - Sem 2',
      description: 'Network protocols, TCP/IP, and network security',
      subject: 'Computer Networks',
      batch: '2024-2027',
      semester: '2',
      createdBy: faculty.find(f => f.subject === 'Computer Networks')._id,
      members: [
        { user: faculty.find(f => f.subject === 'Computer Networks')._id },
        ...networkStudents.map(s => ({ user: s._id }))
      ]
    });
    groups.push(networkGroup);
    
    const createdGroups = await Group.insertMany(groups);
    
    // Update users' groups
    for (const group of createdGroups) {
      const memberIds = group.members.map(m => m.user);
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $push: { groups: group._id } }
      );
    }
    
    console.log(`✅ Created ${createdGroups.length} groups`);
    return createdGroups;
  } catch (error) {
    console.error('❌ Error creating groups:', error);
    throw error;
  }
};

// Create sample messages
const createMessages = async (users, groups) => {
  try {
    const messages = [];
    const faculty = users.filter(u => u.role === 'faculty');
    const students = users.filter(u => u.role === 'student' && u.approved);
    
    for (const group of groups) {
      const groupFaculty = faculty.find(f => f._id.equals(group.createdBy));
      const groupStudents = students.filter(s => 
        group.members.some(m => m.user.equals(s._id))
      );
      
      // Welcome message from faculty
      const welcomeMessage = new Message({
        sender: groupFaculty._id,
        group: group._id,
        content: `Welcome to ${group.name}! This is where we'll share updates, resources, and have discussions about ${group.subject}.`,
        type: 'text'
      });
      messages.push(welcomeMessage);
      
      // Sample student messages
      if (groupStudents.length > 0) {
        const studentMessage1 = new Message({
          sender: groupStudents[0]._id,
          group: group._id,
          content: 'Thank you for the welcome! Looking forward to learning.',
          type: 'text'
        });
        messages.push(studentMessage1);
        
        if (groupStudents.length > 1) {
          const studentMessage2 = new Message({
            sender: groupStudents[1]._id,
            group: group._id,
            content: 'Could you please share the syllabus for this subject?',
            type: 'text'
          });
          messages.push(studentMessage2);
        }
      }
      
      // Faculty response
      const syllabusMessage = new Message({
        sender: groupFaculty._id,
        group: group._id,
        content: `I'll upload the syllabus and course outline shortly. Please check the assignments section for upcoming tasks.`,
        type: 'text'
      });
      messages.push(syllabusMessage);
    }
    
    const createdMessages = await Message.insertMany(messages);
    
    // Update groups with messages
    for (const message of createdMessages) {
      await Group.findByIdAndUpdate(
        message.group,
        { $push: { messages: message._id } }
      );
    }
    
    console.log(`✅ Created ${createdMessages.length} messages`);
    return createdMessages;
  } catch (error) {
    console.error('❌ Error creating messages:', error);
    throw error;
  }
};

// Create sample assignments
const createAssignments = async (users, groups) => {
  try {
    const assignments = [];
    const faculty = users.filter(u => u.role === 'faculty');
    
    for (const group of groups) {
      const groupFaculty = faculty.find(f => f._id.equals(group.createdBy));
      
      // Create assignment based on subject
      let assignmentData;
      switch (group.subject) {
        case 'Data Structures':
          assignmentData = {
            title: 'Implement Stack and Queue',
            description: 'Write programs to implement stack and queue data structures using arrays and linked lists. Include all basic operations like push, pop, enqueue, dequeue.',
            maxMarks: 50
          };
          break;
        case 'Database Management':
          assignmentData = {
            title: 'Database Design Project',
            description: 'Design a database for a library management system. Create ER diagram, normalize tables, and write SQL queries for common operations.',
            maxMarks: 60
          };
          break;
        case 'Web Development':
          assignmentData = {
            title: 'Responsive Website Development',
            description: 'Create a responsive website for a restaurant using HTML, CSS, and JavaScript. Include menu display, contact form, and mobile-friendly design.',
            maxMarks: 70
          };
          break;
        case 'Computer Networks':
          assignmentData = {
            title: 'Network Protocol Analysis',
            description: 'Analyze different network protocols (TCP, UDP, HTTP, FTP). Compare their features, use cases, and provide examples of implementation.',
            maxMarks: 45
          };
          break;
        default:
          assignmentData = {
            title: 'Subject Assignment',
            description: 'Complete the assigned tasks and submit your solutions.',
            maxMarks: 50
          };
      }
      
      const assignment = new Assignment({
        ...assignmentData,
        group: group._id,
        createdBy: groupFaculty._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        attachments: []
      });
      assignments.push(assignment);
    }
    
    const createdAssignments = await Assignment.insertMany(assignments);
    
    // Update groups with assignments
    for (const assignment of createdAssignments) {
      await Group.findByIdAndUpdate(
        assignment.group,
        { $push: { assignments: assignment._id } }
      );
    }
    
    console.log(`✅ Created ${createdAssignments.length} assignments`);
    return createdAssignments;
  } catch (error) {
    console.error('❌ Error creating assignments:', error);
    throw error;
  }
};

// Create sample polls
const createPolls = async (users, groups) => {
  try {
    const polls = [];
    const faculty = users.filter(u => u.role === 'faculty');
    
    for (const group of groups) {
      const groupFaculty = faculty.find(f => f._id.equals(group.createdBy));
      
      // Create subject-specific poll
      let pollData;
      switch (group.subject) {
        case 'Data Structures':
          pollData = {
            question: 'Which data structure do you find most challenging?',
            options: [
              { text: 'Arrays and Linked Lists', votes: [] },
              { text: 'Stacks and Queues', votes: [] },
              { text: 'Trees and Graphs', votes: [] },
              { text: 'Hash Tables', votes: [] }
            ]
          };
          break;
        case 'Database Management':
          pollData = {
            question: 'What aspect of databases interests you most?',
            options: [
              { text: 'Database Design', votes: [] },
              { text: 'SQL Queries', votes: [] },
              { text: 'Database Administration', votes: [] },
              { text: 'Performance Optimization', votes: [] }
            ]
          };
          break;
        case 'Web Development':
          pollData = {
            question: 'Which web technology would you like to learn more about?',
            options: [
              { text: 'React.js', votes: [] },
              { text: 'Node.js', votes: [] },
              { text: 'Vue.js', votes: [] },
              { text: 'Angular', votes: [] }
            ]
          };
          break;
        case 'Computer Networks':
          pollData = {
            question: 'Which network concept is most important for your career?',
            options: [
              { text: 'Network Security', votes: [] },
              { text: 'Network Protocols', votes: [] },
              { text: 'Network Administration', votes: [] },
              { text: 'Cloud Networking', votes: [] }
            ]
          };
          break;
        default:
          pollData = {
            question: 'How would you rate this course so far?',
            options: [
              { text: 'Excellent', votes: [] },
              { text: 'Good', votes: [] },
              { text: 'Average', votes: [] },
              { text: 'Needs Improvement', votes: [] }
            ]
          };
      }
      
      const poll = new Poll({
        ...pollData,
        group: group._id,
        createdBy: groupFaculty._id,
        multipleChoice: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      polls.push(poll);
    }
    
    const createdPolls = await Poll.insertMany(polls);
    
    // Update groups with polls
    for (const poll of createdPolls) {
      await Group.findByIdAndUpdate(
        poll.group,
        { $push: { polls: poll._id } }
      );
    }
    
    console.log(`✅ Created ${createdPolls.length} polls`);
    return createdPolls;
  } catch (error) {
    console.error('❌ Error creating polls:', error);
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  console.log('=====================================');
  
  try {
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Create users
    const users = await createUsers();
    
    // Create groups
    const groups = await createGroups(users);
    
    // Create messages
    await createMessages(users, groups);
    
    // Create assignments
    await createAssignments(users, groups);
    
    // Create polls
    await createPolls(users, groups);
    
    console.log('=====================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Default Login Credentials:');
    console.log('=====================================');
    console.log('👤 Admin:');
    console.log('   Email: admin@bcacomm.edu');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍💼 HOD:');
    console.log('   Email: hod@bcacomm.edu');
    console.log('   Password: hod123');
    console.log('');
    console.log('👨‍🏫 Faculty:');
    console.log('   Email: priya.sharma@bcacomm.edu');
    console.log('   Password: faculty123');
    console.log('');
    console.log('👨‍🎓 Student:');
    console.log('   Email: rahul.sharma@student.bcacomm.edu');
    console.log('   Password: student123');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Groups: ${groups.length}`);
    console.log(`   💬 Messages: Sample messages created`);
    console.log(`   📝 Assignments: ${groups.length} assignments`);
    console.log(`   📊 Polls: ${groups.length} polls`);
    console.log('');
    console.log('✅ You can now start using the application!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
};

// Run seeder
seedDatabase();