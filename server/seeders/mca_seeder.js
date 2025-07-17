// server/seeders/mca_seeder.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import Assignment from '../models/Assignment.js';
import Poll from '../models/Poll.js';

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bca-communication';

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

// Generate email from name
const generateEmail = (name, regId) => {
  const cleanName = name.toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove special characters
    .split(' ')
    .join('.');
  return `${cleanName}@mcacomm.edu`;
};

// Create users
const createUsers = async () => {
  try {
    const users = [
      // Admin User (assuming already exists, but including for completeness)
      {
        name: 'System Administrator',
        email: 'admin@mcacomm.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        approved: true,
      },
      
      // HOD User
      {
        name: 'Dr. MCA Head',
        email: 'hod@mcacomm.edu',
        password: await bcrypt.hash('hod123', 10),
        role: 'hod',
        approved: true,
      },
      
      // Faculty User - Rama Bhadra Rao Maddu
      {
        name: 'Rama Bhadra Rao Maddu',
        email: 'maddu.ramabhadrarao@gmail.com',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        subject: 'OBJECT ORIENTED PROGRAMMING USING JAVA',
        batch: '2024-2026',
        semester: '2',
        approved: true,
      },
      
      // MCA Students - Section A (All 64 students)
      {
        regdno: '24A21F0001',
        name: 'Achanta Ramasri Devi',
        email: generateEmail('Achanta Ramasri Devi', '24A21F0001'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0002',
        name: 'Achyutha Jeevan Kumar',
        email: generateEmail('Achyutha Jeevan Kumar', '24A21F0002'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0003',
        name: 'Achyutha Srinivas',
        email: generateEmail('Achyutha Srinivas', '24A21F0003'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0004',
        name: 'Adabala Satya Sai',
        email: generateEmail('Adabala Satya Sai', '24A21F0004'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0005',
        name: 'Adada Anji Naga Ram Charan',
        email: generateEmail('Adada Anji Naga Ram Charan', '24A21F0005'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0006',
        name: 'Addala Pavani Bhargavi',
        email: generateEmail('Addala Pavani Bhargavi', '24A21F0006'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0007',
        name: 'Addala Siva',
        email: generateEmail('Addala Siva', '24A21F0007'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0008',
        name: 'Ajjada Pavan Durga Dhanush',
        email: generateEmail('Ajjada Pavan Durga Dhanush', '24A21F0008'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0009',
        name: 'Akana Jahnavi Gowri',
        email: generateEmail('Akana Jahnavi Gowri', '24A21F0009'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0010',
        name: 'Akula Geetha Lavanya',
        email: generateEmail('Akula Geetha Lavanya', '24A21F0010'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0011',
        name: 'Ande Naresh',
        email: generateEmail('Ande Naresh', '24A21F0011'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0012',
        name: 'Andey Narendra',
        email: generateEmail('Andey Narendra', '24A21F0012'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0014',
        name: 'Athikala Mahesh',
        email: generateEmail('Athikala Mahesh', '24A21F0014'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0015',
        name: 'Avala Sai Prasanna',
        email: generateEmail('Avala Sai Prasanna', '24A21F0015'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0016',
        name: 'Bandi Bobby',
        email: generateEmail('Bandi Bobby', '24A21F0016'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0018',
        name: 'Bangaru Rambabu',
        email: generateEmail('Bangaru Rambabu', '24A21F0018'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0019',
        name: 'Barri Maha Lakshmi',
        email: generateEmail('Barri Maha Lakshmi', '24A21F0019'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0020',
        name: 'Bhimanadham Geetha Mani',
        email: generateEmail('Bhimanadham Geetha Mani', '24A21F0020'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0021',
        name: 'Boddu Divya',
        email: generateEmail('Boddu Divya', '24A21F0021'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0022',
        name: 'Bokka Harshini',
        email: generateEmail('Bokka Harshini', '24A21F0022'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0023',
        name: 'Bokka Naga Sai',
        email: generateEmail('Bokka Naga Sai', '24A21F0023'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0024',
        name: 'Bommidi Sindhu Priya',
        email: generateEmail('Bommidi Sindhu Priya', '24A21F0024'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0025',
        name: 'Bonagiri Devikavya',
        email: generateEmail('Bonagiri Devikavya', '24A21F0025'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0026',
        name: 'Borusu Geeta Saraswathi',
        email: generateEmail('Borusu Geeta Saraswathi', '24A21F0026'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0028',
        name: 'Chandu Sri Naga Veera Venkata Sai Ganesh',
        email: generateEmail('Chandu Sri Naga Veera Venkata Sai Ganesh', '24A21F0028'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0029',
        name: 'Cheede Valli Sri Satya',
        email: generateEmail('Cheede Valli Sri Satya', '24A21F0029'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0030',
        name: 'Chegondi Syamala Madhuri',
        email: generateEmail('Chegondi Syamala Madhuri', '24A21F0030'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0031',
        name: 'Chegondi Teja Sri',
        email: generateEmail('Chegondi Teja Sri', '24A21F0031'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0032',
        name: 'Chelluboina Sai Sushma',
        email: generateEmail('Chelluboina Sai Sushma', '24A21F0032'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0033',
        name: 'Chennu Jyothirmai',
        email: generateEmail('Chennu Jyothirmai', '24A21F0033'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0034',
        name: 'Chikkala Sai Durga Malleswari',
        email: generateEmail('Chikkala Sai Durga Malleswari', '24A21F0034'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0035',
        name: 'Chinimilli Revathi',
        email: generateEmail('Chinimilli Revathi', '24A21F0035'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0036',
        name: 'Chintapalli Venkata Sai Santosh',
        email: generateEmail('Chintapalli Venkata Sai Santosh', '24A21F0036'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0037',
        name: 'Darabathula Devi Meena Amruthavalli',
        email: generateEmail('Darabathula Devi Meena Amruthavalli', '24A21F0037'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0038',
        name: 'Dasam Sai Manikanta',
        email: generateEmail('Dasam Sai Manikanta', '24A21F0038'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0039',
        name: 'Dasari Ravi Teja Sri Venkata Shyam',
        email: generateEmail('Dasari Ravi Teja Sri Venkata Shyam', '24A21F0039'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0040',
        name: 'Donga China Sairam',
        email: generateEmail('Donga China Sairam', '24A21F0040'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0041',
        name: 'Donga Lavakumar',
        email: generateEmail('Donga Lavakumar', '24A21F0041'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0042',
        name: 'Dosuri Leela Ganesh',
        email: generateEmail('Dosuri Leela Ganesh', '24A21F0042'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0043',
        name: 'Dude Likhitha Sai',
        email: generateEmail('Dude Likhitha Sai', '24A21F0043'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0044',
        name: 'Dusanapudi Bala Rajeswari',
        email: generateEmail('Dusanapudi Bala Rajeswari', '24A21F0044'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0045',
        name: 'Dusanapudi Deepthi',
        email: generateEmail('Dusanapudi Deepthi', '24A21F0045'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0046',
        name: 'Eepi Naga Saranya',
        email: generateEmail('Eepi Naga Saranya', '24A21F0046'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0047',
        name: 'Eepi Yeswanth Sai Babu',
        email: generateEmail('Eepi Yeswanth Sai Babu', '24A21F0047'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0048',
        name: 'Gadi Jnanendra Kumar',
        email: generateEmail('Gadi Jnanendra Kumar', '24A21F0048'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0050',
        name: 'Gandham Uma Prasanna',
        email: generateEmail('Gandham Uma Prasanna', '24A21F0050'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0052',
        name: 'Gundabathula Naga Durga',
        email: generateEmail('Gundabathula Naga Durga', '24A21F0052'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0053',
        name: 'Gunturi Lokesh',
        email: generateEmail('Gunturi Lokesh', '24A21F0053'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0054',
        name: 'Jetti Kavya Naga Rama Sri',
        email: generateEmail('Jetti Kavya Naga Rama Sri', '24A21F0054'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0055',
        name: 'Juttika Bindhusahitya',
        email: generateEmail('Juttika Bindhusahitya', '24A21F0055'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0056',
        name: 'Kadali Lakshmi Bhavani',
        email: generateEmail('Kadali Lakshmi Bhavani', '24A21F0056'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0057',
        name: 'Kancharla Mahesh Srihari',
        email: generateEmail('Kancharla Mahesh Srihari', '24A21F0057'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0058',
        name: 'Kankatala Pavani Priya',
        email: generateEmail('Kankatala Pavani Priya', '24A21F0058'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0059',
        name: 'Kanukolanu Lohita',
        email: generateEmail('Kanukolanu Lohita', '24A21F0059'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0060',
        name: 'Kommireddy Krishnaveni',
        email: generateEmail('Kommireddy Krishnaveni', '24A21F0060'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0061',
        name: 'Kopparthi Sai',
        email: generateEmail('Kopparthi Sai', '24A21F0061'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0062',
        name: 'Kunapareddy Kaveri',
        email: generateEmail('Kunapareddy Kaveri', '24A21F0062'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0063',
        name: 'Male Lakshmi Narayana',
        email: generateEmail('Male Lakshmi Narayana', '24A21F0063'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0065',
        name: 'Mutyala Nandini',
        email: generateEmail('Mutyala Nandini', '24A21F0065'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0066',
        name: 'Nagireddy Sri Durga Raja Mahesh',
        email: generateEmail('Nagireddy Sri Durga Raja Mahesh', '24A21F0066'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0067',
        name: 'Pedasingu Bala Bhavani',
        email: generateEmail('Pedasingu Bala Bhavani', '24A21F0067'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0068',
        name: 'Polisetti Teja Mounika',
        email: generateEmail('Polisetti Teja Mounika', '24A21F0068'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0069',
        name: 'Tirumani Neeraj Kumer',
        email: generateEmail('Tirumani Neeraj Kumer', '24A21F0069'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
        approved: false,
      },
      {
        regdno: '24A21F0070',
        name: 'Tirumani Vamsi',
        email: generateEmail('Tirumani Vamsi', '24A21F0070'),
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        currentSemester: '2',
        currentBatch: '2024-2026',
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

// Create groups
const createGroups = async (users) => {
  try {
    const faculty = users.filter(u => u.role === 'faculty');
    const javaFaculty = faculty.find(f => f.subject === 'OBJECT ORIENTED PROGRAMMING USING JAVA');
    
    const groups = [];
    
    // Java OOP Group 1 - Section A (First 32 students)
    const javaGroup1 = new Group({
      name: 'Java OOP - MCA Section A1',
      description: 'Object Oriented Programming using Java for MCA students - Section A (Group 1)',
      subject: 'OBJECT ORIENTED PROGRAMMING USING JAVA',
      batch: '2024-2026',
      semester: '2',
      createdBy: javaFaculty._id,
      members: [{ user: javaFaculty._id }]
    });
    groups.push(javaGroup1);
    
    // Java OOP Group 2 - Section A (Remaining 32 students)
    const javaGroup2 = new Group({
      name: 'Java OOP - MCA Section A2',
      description: 'Object Oriented Programming using Java for MCA students - Section A (Group 2)',
      subject: 'OBJECT ORIENTED PROGRAMMING USING JAVA',
      batch: '2024-2026',
      semester: '2',
      createdBy: javaFaculty._id,
      members: [{ user: javaFaculty._id }]
    });
    groups.push(javaGroup2);
    
    const createdGroups = await Group.insertMany(groups);
    
    // Update faculty's groups
    await User.findByIdAndUpdate(javaFaculty._id, {
      $push: { groups: { $each: createdGroups.map(g => g._id) } }
    });
    
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
    const javaFaculty = users.find(u => u.subject === 'OBJECT ORIENTED PROGRAMMING USING JAVA');
    
    for (const group of groups) {
      // Welcome message from faculty
      const welcomeMessage = new Message({
        sender: javaFaculty._id,
        group: group._id,
        content: `Welcome to ${group.name}! This is where we'll learn Object Oriented Programming using Java. Please introduce yourselves and let me know if you have any questions about the course.`,
        type: 'text'
      });
      messages.push(welcomeMessage);
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
    const javaFaculty = users.find(u => u.subject === 'OBJECT ORIENTED PROGRAMMING USING JAVA');
    
    for (const group of groups) {
      const assignment = new Assignment({
        title: 'Java Basics - Classes and Objects',
        description: 'Create a Java program demonstrating the concepts of classes, objects, constructors, and methods. Include proper documentation and comments.',
        group: group._id,
        createdBy: javaFaculty._id,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxMarks: 100,
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
    const javaFaculty = users.find(u => u.subject === 'OBJECT ORIENTED PROGRAMMING USING JAVA');
    
    for (const group of groups) {
      const poll = new Poll({
        question: 'What programming languages have you worked with before?',
        options: [
          { text: 'C/C++', votes: [] },
          { text: 'Python', votes: [] },
          { text: 'JavaScript', votes: [] },
          { text: 'None - Java is my first', votes: [] }
        ],
        group: group._id,
        createdBy: javaFaculty._id,
        multipleChoice: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
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
  console.log('🌱 Starting MCA Database Seeding...');
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
    console.log('🎉 MCA Database seeding completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('=====================================');
    console.log('👤 Admin:');
    console.log('   Email: admin@mcacomm.edu');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍💼 HOD:');
    console.log('   Email: hod@mcacomm.edu');
    console.log('   Password: hod123');
    console.log('');
    console.log('👨‍🏫 Faculty (Rama Bhadra Rao):');
    console.log('   Email: maddu.ramabhadrarao@gmail.com');
    console.log('   Password: faculty123');
    console.log('   Subject: OBJECT ORIENTED PROGRAMMING USING JAVA');
    console.log('');
    console.log('👨‍🎓 Sample Student:');
    console.log('   Email: achanta.ramasri.devi@mcacomm.edu');
    console.log('   Password: student123');
    console.log('   Reg No: 24A21F0001');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 Total Users: ${users.length}`);
    console.log(`   👨‍🏫 Faculty: 1 (Rama Bhadra Rao)`);
    console.log(`   👨‍🎓 Students: 64 (All from MCA Section A)`);
    console.log(`   📚 Groups: 2 (Java OOP Section A1 & A2)`);
    console.log(`   📝 Assignments: 2 (One per group)`);
    console.log(`   📊 Polls: 2 (One per group)`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Login as Admin and approve the 64 students');
    console.log('2. Login as Faculty (Rama Bhadra Rao) and manage groups');
    console.log('3. Add students to groups using "Manage Members"');
    console.log('4. Students will see groups after being approved and added');
    console.log('');
    console.log('✅ Ready to use!');
    
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