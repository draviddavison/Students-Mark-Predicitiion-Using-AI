/**
 * Student Academic Performance Predictor & Analytics System
 * Default Cohort Data & Local Storage Handler
 */

const STORAGE_KEY = 'edupredict_students_v1';

// Initial cohort of students with marks across the 5 exams:
// Model 1, Quarterly, Model 2, Half-Yearly, Model 3 (Marks out of 100 per exam)
const DEFAULT_STUDENTS = [
  {
    id: 'STU-1001',
    name: 'Aarav Sharma',
    rollNo: '24CS01',
    className: 'Class 12 - Sec A',
    email: 'aarav.sharma@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 84,
      quarterly: 88,
      model2: 86,
      halfYearly: 91,
      model3: 94
    },
    notes: 'Consistently exceptional performance. High conceptual grasp in analytical subjects.'
  },
  {
    id: 'STU-1002',
    name: 'Diya Patel',
    rollNo: '24CS02',
    className: 'Class 12 - Sec A',
    email: 'diya.patel@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 76,
      quarterly: 79,
      model2: 82,
      halfYearly: 85,
      model3: 88
    },
    notes: 'Steadily improving curve. Shows great discipline in self-study.'
  },
  {
    id: 'STU-1003',
    name: 'Rohan Verma',
    rollNo: '24CS03',
    className: 'Class 12 - Sec A',
    email: 'rohan.v@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 42,
      quarterly: 48,
      model2: 52,
      halfYearly: 58,
      model3: 63
    },
    notes: 'Positive trajectory. Improving after targeted practice in quarterly reviews.'
  },
  {
    id: 'STU-1004',
    name: 'Ananya Iyer',
    rollNo: '24CS04',
    className: 'Class 12 - Sec B',
    email: 'ananya.i@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 91,
      quarterly: 93,
      model2: 89,
      halfYearly: 95,
      model3: 96
    },
    notes: 'Top tier academic standing. Candidate for school rank holder.'
  },
  {
    id: 'STU-1005',
    name: 'Karthik Raja',
    rollNo: '24CS05',
    className: 'Class 12 - Sec B',
    email: 'karthik.r@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 32,
      quarterly: 35,
      model2: 28,
      halfYearly: 36,
      model3: 34
    },
    notes: 'Urgent intervention needed. Lacks foundational understanding in core chapters.'
  },
  {
    id: 'STU-1006',
    name: 'Sneha Krishnan',
    rollNo: '24CS06',
    className: 'Class 12 - Sec A',
    email: 'sneha.k@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 62,
      quarterly: 65,
      model2: 60,
      halfYearly: 68,
      model3: 66
    },
    notes: 'Solid average performer. Can break into 75%+ with test time management.'
  },
  {
    id: 'STU-1007',
    name: 'Vikram Sundaram',
    rollNo: '24CS07',
    className: 'Class 12 - Sec B',
    email: 'vikram.s@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 25,
      quarterly: 30,
      model2: 32,
      halfYearly: 29,
      model3: 38
    },
    notes: 'Requires remedial classes and one-on-one doubt clearing sessions.'
  },
  {
    id: 'STU-1008',
    name: 'Pooja Hegde',
    rollNo: '24CS08',
    className: 'Class 12 - Sec A',
    email: 'pooja.h@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 72,
      quarterly: 74,
      model2: 78,
      halfYearly: 80,
      model3: 82
    },
    notes: 'High consistency. Clear conceptual clarity and thorough homework records.'
  },
  {
    id: 'STU-1009',
    name: 'Mohammed Farhan',
    rollNo: '24CS09',
    className: 'Class 12 - Sec B',
    email: 'farhan.m@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 45,
      quarterly: 50,
      model2: 48,
      halfYearly: 54,
      model3: 56
    },
    notes: 'Capable of passing comfortably. Moderate study consistency observed.'
  },
  {
    id: 'STU-1010',
    name: 'Meera Nambiar',
    rollNo: '24CS10',
    className: 'Class 12 - Sec A',
    email: 'meera.n@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 35,
      quarterly: 38,
      model2: 39,
      halfYearly: 37,
      model3: 39
    },
    notes: 'Borderline critical zone. Needs extra care and motivational coaching.'
  },
  {
    id: 'STU-1011',
    name: 'Aditya Nair',
    rollNo: '24CS11',
    className: 'Class 12 - Sec B',
    email: 'aditya.n@school.edu',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 78,
      quarterly: 81,
      model2: 84,
      halfYearly: 86,
      model3: 89
    },
    notes: 'Eligible high performer. Strong aptitude in problem solving.'
  },
  {
    id: 'STU-1012',
    name: 'Lavanya Swaminathan',
    rollNo: '24CS12',
    className: 'Class 12 - Sec A',
    email: 'lavanya.s@school.edu',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    marks: {
      model1: 54,
      quarterly: 58,
      model2: 62,
      halfYearly: 65,
      model3: 69
    },
    notes: 'Impressive progressive rise. Close to crossing into 70%+ threshold.'
  }
];

class StorageManager {
  static getStudents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error, using default cohort', e);
    }
    // Set default if empty
    this.saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }

  static saveStudents(students) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  }

  static getStudentById(id) {
    const list = this.getStudents();
    return list.find(s => s.id === id) || null;
  }

  static updateStudentMarks(id, marks, notes = null, avatar = null) {
    const list = this.getStudents();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx].marks = { ...list[idx].marks, ...marks };
      if (notes !== null) {
        list[idx].notes = notes;
      }
      if (avatar) {
        list[idx].avatar = avatar;
      }
      this.saveStudents(list);
      return list[idx];
    }
    return null;
  }

  static addStudent(studentData) {
    const list = this.getStudents();
    const id = 'STU-' + (1000 + list.length + 1);
    const defaultAvatar = studentData.gender === 'female' 
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80';

    const newStudent = {
      id,
      name: studentData.name,
      rollNo: studentData.rollNo,
      className: studentData.className || 'Class 12 - Sec A',
      email: studentData.email || `${studentData.rollNo.toLowerCase()}@school.edu`,
      gender: studentData.gender || 'neutral',
      avatar: studentData.avatar || defaultAvatar,
      marks: {
        model1: Number(studentData.model1 || 0),
        quarterly: Number(studentData.quarterly || 0),
        model2: Number(studentData.model2 || 0),
        halfYearly: Number(studentData.halfYearly || 0),
        model3: Number(studentData.model3 || 0)
      },
      notes: studentData.notes || 'Newly registered student record.'
    };
    list.unshift(newStudent);
    this.saveStudents(list);
    return newStudent;
  }

  static deleteStudent(id) {
    const list = this.getStudents().filter(s => s.id !== id);
    this.saveStudents(list);
    return list;
  }

  static resetToDefault() {
    this.saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }
}

window.StorageManager = StorageManager;
window.DEFAULT_STUDENTS = DEFAULT_STUDENTS;
