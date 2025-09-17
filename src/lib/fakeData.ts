import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays, subMonths, subYears, subMinutes } from 'date-fns'; // Added subMinutes

const algerianMaleFirstNames = [
  "لقمان", "ياسين", "سفيان", "رشيد", "وليد", "مهدي", "كريم", "عبد القادر", "سمير", "أمين", "فارس", "رياض", "حمزة", "بلال", "شمس الدين"
];
const algerianFemaleFirstNames = [
  "أمل", "سميرة", "أمينة", "نادية", "إيناس", "ليلى", "هدى", "مريم", "كهينة", "سارة", "فاطمة", "خديجة", "زينب", "شيماء", "ريم"
];
const algerianLastNames = [
  "بوزيد", "بن صالح", "شريت", "حداد", "خليفة", "مزهود", "تومي", "زياني", "منصوري", "شارف", "عمارة", "بن عمار", "قادري", "بوشارب", "بن يوسف"
];
const algerianCities = [
  "الجزائر", "وهران", "قسنطينة", "تيزي وزو", "عنابة", "البليدة", "بجاية", "سطيف", "غرداية", "تلمسان", "بومرداس", "جيجل", "سكيكدة", "باتنة", "بسكرة"
];

const subjectsList = [
  "الرياضيات", "العلوم", "اللغة العربية", "اللغة الإنجليزية", "التاريخ", "الجغرافيا", "التربية الإسلامية", "الفنون", "التربية البدنية", "الحاسوب"
];
const roomNumbers = ["101", "102", "103", "201", "202", "203", "301", "302"];
const attendanceStatuses = ["Present", "Absent", "Late", "Excused"];
const assignmentNames = ["اختبار قصير", "واجب منزلي", "مشروع", "اختبار نهائي"];
const transactionTypes = ["رسوم دراسية", "راتب", "مستلزمات", "صيانة", "تبرعات"];
const contractTypes = ["دائم", "مؤقت", "ساعة"];
const staffRoles = ["معلم", "إداري", "مشرف", "حارس", "عامل نظافة"];
const announcementTitles = ["تذكير باجتماع", "إجازة رسمية", "تغيير جدول", "نشاط مدرسي"];
const targetRoles = ["الجميع", "الطلاب", "المعلمين", "الإدارة"];

// Helper to get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a random date within a range
const getRandomDate = (start: Date, end: Date) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd');
};

// Generate Students
export const generateFakeStudents = (count: number) => {
  const students = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomItem(algerianMaleFirstNames) : getRandomItem(algerianFemaleFirstNames);
    const lastName = getRandomItem(algerianLastNames);
    const dob = getRandomDate(subYears(new Date(), 18), subYears(new Date(), 6)); // Age 6-18
    const gradeLevel = Math.floor(Math.random() * 12) + 1; // 1 to 12
    const attendance = Math.floor(Math.random() * 20) + 80; // 80-100%
    const avgGrade = Math.floor(Math.random() * 40) + 60; // 60-100
    const studentId = `S${Math.floor(10000 + Math.random() * 90000)}`;
    const city = getRandomItem(algerianCities);

    students.push({
      id: uuidv4(),
      first_name: firstName,
      last_name: lastName,
      student_id: studentId,
      date_of_birth: dob,
      grade_level: gradeLevel,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@student.local`,
      attendance: attendance,
      avgGrade: avgGrade,
      parent_name: `${getRandomItem(algerianMaleFirstNames)} ${getRandomItem(algerianLastNames)}`,
      parent_contact: `+213${Math.floor(500000000 + Math.random() * 500000000)}`, // Algerian phone number prefix
      emergency_contact: `+213${Math.floor(500000000 + Math.random() * 500000000)}`,
      gpa: (Math.random() * (4.0 - 2.0) + 2.0).toFixed(2),
      city: city,
      created_at: new Date().toISOString(),
    });
  }
  return students;
};

// Generate Teachers
export const generateFakeTeachers = (count: number) => {
  const teachers = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomItem(algerianMaleFirstNames) : getRandomItem(algerianFemaleFirstNames);
    const lastName = getRandomItem(algerianLastNames);
    const subjectSpecialty = getRandomItem(subjectsList);
    const teacherId = `T${Math.floor(10000 + Math.random() * 90000)}`;
    const salary = Math.floor(Math.random() * 5000) + 3000; // 3000-8000 DZD

    teachers.push({
      id: uuidv4(),
      first_name: firstName,
      last_name: lastName,
      teacher_id: teacherId,
      subject_specialty: subjectSpecialty,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@school.local`,
      salary: `${salary} د.ج`,
      contact: `+213${Math.floor(500000000 + Math.random() * 500000000)}`, // Algerian phone number prefix
      created_at: new Date().toISOString(),
    });
  }
  return teachers;
};

// Generate Subjects
export const generateFakeSubjects = (count: number) => {
  const subjects = [];
  for (let i = 0; i < count; i++) {
    const name = subjectsList[i % subjectsList.length];
    subjects.push({
      id: uuidv4(),
      name: name,
      description: `مادة ${name} لجميع المستويات.`,
      created_at: new Date().toISOString(),
    });
  }
  return subjects;
};

// Generate Classes
export const generateFakeClasses = (subjects: any[], teachers: any[], count: number) => {
  const classes = [];
  for (let i = 0; i < count; i++) {
    const subject = getRandomItem(subjects);
    const teacher = getRandomItem(teachers);
    const gradeLevel = Math.floor(Math.random() * 12) + 1;
    classes.push({
      id: uuidv4(),
      name: `${subject.name} - الصف ${gradeLevel} - قسم ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, // e.g., "الرياضيات - الصف 7 - قسم A"
      subject_id: subject.id,
      teacher_id: teacher.id,
      grade_level: gradeLevel,
      room_number: getRandomItem(roomNumbers),
      created_at: new Date().toISOString(),
      subjects: { name: subject.name }, // For joined data simulation
      teachers: { first_name: teacher.first_name, last_name: teacher.last_name }, // For joined data simulation
    });
  }
  return classes;
};

// Generate Schedules
export const generateFakeSchedules = (classes: any[], count: number) => {
  const schedules = [];
  const daysOfWeek = [0, 1, 2, 3, 4, 5]; // Sunday to Friday
  const startTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  const endTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

  for (let i = 0; i < count; i++) {
    const cls = getRandomItem(classes);
    const day = getRandomItem(daysOfWeek);
    const startTime = getRandomItem(startTimes);
    const endTime = endTimes[startTimes.indexOf(startTime) + 1] || "16:00"; // Ensure end time is after start time

    schedules.push({
      id: uuidv4(),
      class_id: cls.id,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      created_at: new Date().toISOString(),
      classes: { name: cls.name }, // For joined data simulation
    });
  }
  return schedules;
};

// Generate Attendance Records
export const generateFakeAttendance = (students: any[], classes: any[], teachers: any[], count: number) => {
  const attendanceRecords = [];
  for (let i = 0; i < count; i++) {
    const student = getRandomItem(students);
    const cls = getRandomItem(classes);
    const teacher = getRandomItem(teachers);
    const date = getRandomDate(subMonths(new Date(), 1), new Date());

    attendanceRecords.push({
      id: uuidv4(),
      student_id: student.id,
      class_id: cls.id,
      date: date,
      status: getRandomItem(attendanceStatuses),
      recorded_by: teacher.id, // Assuming teacher records attendance
      created_at: new Date().toISOString(),
      students: { first_name: student.first_name, last_name: student.last_name, student_id: student.student_id },
      classes: { name: cls.name },
      profiles: { first_name: teacher.first_name, last_name: teacher.last_name },
    });
  }
  return attendanceRecords;
};

// Generate Grades
export const generateFakeGrades = (students: any[], classes: any[], teachers: any[], count: number) => {
  const grades = [];
  for (let i = 0; i < count; i++) {
    const student = getRandomItem(students);
    const cls = getRandomItem(classes);
    const teacher = getRandomItem(teachers);
    const score = Math.floor(Math.random() * 50) + 50; // 50-100
    const maxScore = 100;

    grades.push({
      id: uuidv4(),
      student_id: student.id,
      class_id: cls.id,
      assignment_name: getRandomItem(assignmentNames),
      score: score,
      max_score: maxScore,
      graded_by: teacher.id,
      created_at: new Date().toISOString(),
      students: { first_name: student.first_name, last_name: student.last_name, student_id: student.student_id },
      classes: { name: cls.name },
      profiles: { first_name: teacher.first_name, last_name: teacher.last_name },
    });
  }
  return grades;
};

// Generate Finance Transactions
export const generateFakeFinanceTransactions = (count: number) => {
  const transactions = [];
  for (let i = 0; i < count; i++) {
    const type = getRandomItem(transactionTypes);
    const amount = Math.floor(Math.random() * 10000) + 100; // 100-10100 DZD
    const date = getRandomDate(subMonths(new Date(), 3), new Date());
    const status = Math.random() > 0.8 ? "معلق" : "مدفوع";

    transactions.push({
      id: uuidv4(),
      type: type,
      amount: `${amount} د.ج`,
      date: date,
      status: status,
      description: `وصف لـ ${type} بتاريخ ${date}`,
      created_at: new Date().toISOString(),
    });
  }
  return transactions;
};

// Generate HR Staff
export const generateFakeHRStaff = (teachers: any[], count: number) => {
  const staff = [];
  // Add existing teachers to staff
  teachers.forEach(teacher => {
    staff.push({
      id: teacher.id,
      name: `${teacher.first_name} ${teacher.last_name}`,
      role: "معلم",
      contract: getRandomItem(contractTypes),
      salary: teacher.salary,
      contact: teacher.contact,
      email: teacher.email,
      created_at: teacher.created_at,
    });
  });

  // Add additional staff members
  for (let i = 0; i < count - teachers.length; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomItem(algerianMaleFirstNames) : getRandomItem(algerianFemaleFirstNames);
    const lastName = getRandomItem(algerianLastNames);
    const role = getRandomItem(staffRoles.filter(r => r !== "معلم")); // Exclude 'معلم'
    const salary = Math.floor(Math.random() * 4000) + 2000; // 2000-6000 DZD
    staff.push({
      id: uuidv4(),
      name: `${firstName} ${lastName}`,
      role: role,
      contract: getRandomItem(contractTypes),
      salary: `${salary} د.ج`,
      contact: `+213${Math.floor(500000000 + Math.random() * 500000000)}`, // Algerian phone number prefix
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@school.local`,
      created_at: new Date().toISOString(),
    });
  }
  return staff;
};

// Generate Chat Messages
export const generateFakeChatMessages = (users: any[], count: number) => {
  const messages = [];
  const chatUsers = [
    { id: 'admin', name: 'Admin', role: 'Admin' },
    ...users.map((u: any) => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, role: 'Teacher' }))
  ];

  const chatContent = [
    "مرحباً بالجميع، تذكير باجتماع الغد الساعة 10 صباحاً.",
    "تم استلام التذكير، شكراً.",
    "هل يمكنني إرسال الواجب متأخراً؟",
    "بالتأكيد، ولكن سيتم خصم نقاط.",
    "شكراً لك يا أستاذ.",
    "تذكير بموعد تسليم مشروع العلوم يوم الأحد.",
    "هل هناك أي تحديثات بخصوص الرحلة المدرسية؟",
    "الرحلة المدرسية مؤكدة الأسبوع القادم، التفاصيل سترسل قريباً.",
    "ممتاز! شكراً للإدارة.",
    "هل يمكنني الحصول على نسخة من جدول الحصص؟",
    "الجدول متاح في قسم الحصص والجدول.",
  ];

  for (let i = 0; i < count; i++) {
    const sender = getRandomItem(chatUsers);
    const text = getRandomItem(chatContent);
    const timestamp = subMinutes(new Date(), Math.floor(Math.random() * 120)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messages.push({
      id: uuidv4(),
      sender: sender.name,
      text: text,
      timestamp: timestamp,
      senderRole: sender.role,
    });
  }
  return messages.sort((a, b) => new Date(`2000/01/01 ${a.timestamp}`).getTime() - new Date(`2000/01/01 ${b.timestamp}`).getTime());
};

// Generate Notifications
export const generateFakeNotifications = (count: number) => {
  const notifications = [];
  for (let i = 0; i < count; i++) {
    const title = getRandomItem(announcementTitles);
    const content = `تفاصيل الإعلان عن ${title}. يرجى الانتباه.`;
    const date = getRandomDate(subDays(new Date(), 7), addDays(new Date(), 7));
    const target = getRandomItem(targetRoles);

    notifications.push({
      id: uuidv4(),
      title: title,
      content: content,
      date: date,
      target: target,
      type: Math.random() > 0.7 ? "AI Alert" : "Announcement",
      created_at: new Date().toISOString(),
    });
  }
  return notifications;
};

// Generate Reports (placeholder structure)
export const generateFakeReports = (count: number) => {
  const reports = [];
  const reportNames = ["تقرير الحضور الشهري", "تحليل اتجاهات الدرجات", "ملخص مالي سنوي", "تقرير أداء المعلمين"];
  const reportDescriptions = [
    "ملخص مفصل لحضور الطلاب خلال الشهر.",
    "تحليل لدرجات الطلاب وتحديد الاتجاهات.",
    "نظرة عامة على الإيرادات والمصروفات السنوية.",
    "تقييم أداء المعلمين بناءً على معايير محددة."
  ];
  const reportTypes = ["attendance", "grades", "finance", "hr"];

  for (let i = 0; i < count; i++) {
    const name = getRandomItem(reportNames);
    const description = getRandomItem(reportDescriptions);
    const type = getRandomItem(reportTypes);
    reports.push({
      id: uuidv4(),
      name: name,
      description: description,
      type: type,
      generated_at: new Date().toISOString(),
    });
  }
  return reports;
};

// Generate Online Classes
export const generateFakeOnlineClasses = (classes: any[], teachers: any[], count: number) => {
  const onlineClasses = [];
  const meetingPlatforms = ["Jitsi Meet", "Google Meet", "Zoom"];
  for (let i = 0; i < count; i++) {
    const cls = getRandomItem(classes);
    const teacher = getRandomItem(teachers);
    const startTime = addDays(new Date(), Math.floor(Math.random() * 7));
    startTime.setHours(Math.floor(Math.random() * 4) + 9, Math.floor(Math.random() * 60), 0); // 9 AM to 1 PM
    const endTime = addMinutes(startTime, 60 + Math.floor(Math.random() * 60)); // 60-120 minutes
    const platform = getRandomItem(meetingPlatforms);

    onlineClasses.push({
      id: uuidv4(),
      class_id: cls.id,
      teacher_id: teacher.id,
      title: `حصة مباشرة: ${cls.name}`,
      description: `فصل دراسي مباشر عبر الإنترنت لمادة ${cls.name}.`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      platform: platform,
      meeting_link: `https://meet.jit.si/AlibanaSchool_${cls.name.replace(/\s/g, '')}_${format(startTime, 'ddMMyyHHmm')}`,
      recorded: Math.random() > 0.5,
      recording_link: Math.random() > 0.5 ? `https://example.com/recordings/${uuidv4()}.mp4` : null,
      created_at: new Date().toISOString(),
      classes: { name: cls.name },
      teachers: { first_name: teacher.first_name, last_name: teacher.last_name },
    });
  }
  return onlineClasses;
};

// Generate Library Items
export const generateFakeLibraryItems = (subjects: any[], count: number) => {
  const libraryItems = [];
  const itemTypes = ["PDF", "E-Book", "Video", "Notes", "Homework"];
  const fileExtensions = {
    "PDF": ".pdf",
    "E-Book": ".epub",
    "Video": ".mp4",
    "Notes": ".docx",
    "Homework": ".pdf",
  };

  for (let i = 0; i < count; i++) {
    const subject = getRandomItem(subjects);
    const type = getRandomItem(itemTypes);
    const title = `مادة ${subject.name} - ${type} ${i + 1}`;
    const gradeLevel = Math.floor(Math.random() * 12) + 1;
    const uploadDate = getRandomDate(subYears(new Date(), 1), new Date());

    libraryItems.push({
      id: uuidv4(),
      title: title,
      description: `وصف لـ ${title}.`,
      type: type,
      subject_id: subject.id,
      grade_level: gradeLevel,
      file_url: `https://example.com/library/${title.replace(/\s/g, '_')}${fileExtensions[type as keyof typeof fileExtensions]}`,
      uploaded_by: getRandomItem(algerianMaleFirstNames), // Simplified for demo
      upload_date: uploadDate,
      created_at: new Date().toISOString(),
      subjects: { name: subject.name },
    });
  }
  return libraryItems;
};

// Generate Leaderboard (simplified)
export const generateFakeLeaderboard = (students: any[], count: number) => {
  const leaderboard = [...students]
    .sort((a, b) => b.avgGrade - a.avgGrade) // Sort by average grade
    .slice(0, count)
    .map((student, index) => ({
      id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      rank: index + 1,
      score: student.avgGrade,
      grade_level: student.grade_level,
      badges: Math.random() > 0.7 ? ["المتفوق", "المواظب"] : ["المجتهد"], // Simplified badges
    }));
  return leaderboard;
};


// Combined data generation for easy access
export const generateAllFakeData = () => {
  const students = generateFakeStudents(50); // Adjusted to 50 students
  const teachers = generateFakeTeachers(15); // Adjusted to 15 teachers
  const subjects = generateFakeSubjects(subjectsList.length);
  const classes = generateFakeClasses(subjects, teachers, 20); // Adjusted to 20 classes
  const schedules = generateFakeSchedules(classes, 40);
  const attendanceRecords = generateFakeAttendance(students, classes, teachers, 100);
  const grades = generateFakeGrades(students, classes, teachers, 200);
  const financeTransactions = generateFakeFinanceTransactions(50);
  const hrStaff = generateFakeHRStaff(teachers, 20); // 20 total staff including teachers
  const chatMessages = generateFakeChatMessages(teachers, 50);
  const notifications = generateFakeNotifications(10);
  const reports = generateFakeReports(5);
  const onlineClasses = generateFakeOnlineClasses(classes, teachers, 10);
  const libraryItems = generateFakeLibraryItems(subjects, 30);
  const leaderboard = generateFakeLeaderboard(students, 10);

  return {
    students,
    teachers,
    subjects,
    classes,
    schedules,
    attendanceRecords,
    grades,
    financeTransactions,
    hrStaff,
    chatMessages,
    notifications,
    reports,
    onlineClasses,
    libraryItems,
    leaderboard,
  };
};

// Export the generated data
export const demoData = generateAllFakeData();