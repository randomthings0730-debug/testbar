
import { Subject, StudyTask, ErrorEntry, Flashcard, UserProfile, Question, TaskType } from './types';
import { addDays, format, isWeekend, getDay, differenceInDays } from 'date-fns';

export const INITIAL_PROFILE: UserProfile = {
  examDate: '2026-07-28', 
  dailyHoursWeekday: 2,
  dailyHoursWeekend: 5,
  mbeGoal: 2000,
  targetScore: 270
};

const generateDailyTasks = (): StudyTask[] => {
  const allTasks: StudyTask[] = [];
  const startDate = new Date(2026, 0, 14); // Jan 14, 2026
  const endDate = new Date(2026, 6, 28);   // July 28, 2026
  
  for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const isWknd = isWeekend(d);
    const month = d.getMonth(); // 0: Jan, 1: Feb, 2: Mar...
    const dayOfMonth = d.getDate();

    // PHASE 1: JANUARY (1/14 - 1/31) - Foundations
    if (month === 0) {
      const dayIndex = differenceInDays(d, startDate);
      const weekNum = Math.floor(dayIndex / 7) + 1;
      let subjects: Subject[] = [];
      
      if (dayIndex <= 2) subjects = [Subject.TORTS, Subject.CONTRACTS]; // 1/14-1/16
      else if (dayIndex <= 9) subjects = [Subject.EVIDENCE, Subject.CRIMINAL_LAW]; // 1/17-1/23
      else subjects = [Subject.CIV_PRO, Subject.CON_LAW]; // 1/24-1/31

      const dailySubject = subjects[dayIndex % subjects.length];

      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-outline`, date: dateStr, type: 'Outline', subject: dailySubject, description: `Read ${dailySubject} High-Yield Outline & Simplify Elements`, completed: false, estimatedMinutes: 40 });
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: dailySubject, description: `UWorld: 10-15 ${dailySubject} Qs + Review`, count: 15, completed: false, estimatedMinutes: 50 });
        allTasks.push({ id: `${dateStr}-recall`, date: dateStr, type: 'Review', subject: dailySubject, description: `Active Recall: Write out ${dailySubject} rule elements on blank paper`, completed: false, estimatedMinutes: 30 });
      } else if (dayOfMonth >= 24) { // Only last weekend of Jan has Mock
        allTasks.push({ id: `${dateStr}-mock`, date: dateStr, type: 'MBE', subject: dailySubject, description: `50-Question Mini Mock (Mixed)`, count: 50, completed: false, estimatedMinutes: 90 });
        allTasks.push({ id: `${dateStr}-rev`, date: dateStr, type: 'Review', subject: dailySubject, description: `Review Mock Errors & Patch Outline`, completed: false, estimatedMinutes: 210 });
      } else {
        allTasks.push({ id: `${dateStr}-catchup`, date: dateStr, type: 'Outline', subject: dailySubject, description: `Catch up on missed Outlines & Extra 10 Qs`, completed: false, estimatedMinutes: 240 });
        allTasks.push({ id: `${dateStr}-recall-wknd`, date: dateStr, type: 'Review', subject: dailySubject, description: `High-level oral review of subject structure`, completed: false, estimatedMinutes: 60 });
      }
    }
    // PHASE 2: FEBRUARY - Second Round & Weekly Mocks
    else if (month === 1) {
      const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);
      const subjectsMap = [
        [Subject.TORTS, Subject.CONTRACTS],
        [Subject.EVIDENCE, Subject.CRIMINAL_LAW],
        [Subject.CIV_PRO, Subject.CON_LAW],
        [Subject.REAL_PROPERTY]
      ];
      const weekSubjects = subjectsMap[Math.min(weekOfMonth, 3)];
      const dailySubject = weekSubjects[dayOfMonth % weekSubjects.length];

      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-outline`, date: dateStr, type: 'Outline', subject: dailySubject, description: `Compress ${dailySubject} Outline (Color-code high-freq)`, completed: false, estimatedMinutes: 30 });
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: dailySubject, description: `UWorld: 15-20 ${dailySubject} Qs (Tag Concept)`, count: 18, completed: false, estimatedMinutes: 60 });
        allTasks.push({ id: `${dateStr}-recall`, date: dateStr, type: 'Review', subject: dailySubject, description: `Spaced Repetition: Recall Today's + Old Subject`, completed: false, estimatedMinutes: 30 });
      } else {
        allTasks.push({ id: `${dateStr}-mock`, date: dateStr, type: 'MBE', subject: dailySubject, description: `50-Question Mixed Mini Mock`, count: 50, completed: false, estimatedMinutes: 90 });
        allTasks.push({ id: `${dateStr}-rev`, date: dateStr, type: 'Review', subject: dailySubject, description: `Review Worst 2 Subjects & Recall Rules`, completed: false, estimatedMinutes: 90 });
        allTasks.push({ id: `${dateStr}-spec`, date: dateStr, type: 'MBE', subject: dailySubject, description: `Target Practice: 15 Qs on Weakest Sub-topic`, count: 15, completed: false, estimatedMinutes: 120 });
      }
    }
    // PHASE 3: MARCH - Second Round Deepening + MEE/MPT Intro
    else if (month === 2) {
      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: Subject.TORTS, description: `UWorld: 20 Qs Mixed (Aim for 1000 total)`, count: 20, completed: false, estimatedMinutes: 60 });
        allTasks.push({ id: `${dateStr}-mee`, date: dateStr, type: 'MEE', subject: Subject.CIV_PRO, description: `MEE Bullet Outline Practice (Issue Spotting)`, completed: false, estimatedMinutes: 30 });
        allTasks.push({ id: `${dateStr}-recall`, date: dateStr, type: 'Review', subject: Subject.CIV_PRO, description: `Active Recall: Key Rules by heart`, completed: false, estimatedMinutes: 30 });
      } else {
        allTasks.push({ id: `${dateStr}-mpt`, date: dateStr, type: 'Review', subject: Subject.CIV_PRO, description: `MPT 90m Timed + Review Format`, completed: false, estimatedMinutes: 180 });
        allTasks.push({ id: `${dateStr}-mock`, date: dateStr, type: 'MBE', subject: Subject.CIV_PRO, description: `50 Q Mixed Mock`, count: 50, completed: false, estimatedMinutes: 120 });
      }
    }
    // PHASE 4: APRIL - Mixed Integration & Endurance
    else if (month === 3) {
      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: Subject.EVIDENCE, description: `20 Qs Mixed Subjects (No Notes)`, count: 20, completed: false, estimatedMinutes: 80 });
        allTasks.push({ id: `${dateStr}-outline`, date: dateStr, type: 'Outline', subject: Subject.CIV_PRO, description: `Rapid Outline Warm-up (2 Subjects)`, completed: false, estimatedMinutes: 25 });
        allTasks.push({ id: `${dateStr}-mee`, date: dateStr, type: 'MEE', subject: Subject.EVIDENCE, description: `MEE Bullet Outline + Point Sheet Check`, completed: false, estimatedMinutes: 15 });
      } else {
        allTasks.push({ id: `${dateStr}-100mock`, date: dateStr, type: 'MBE', subject: Subject.TORTS, description: `100-Question Endurance Mock (2.5h)`, count: 100, completed: false, estimatedMinutes: 180 });
        allTasks.push({ id: `${dateStr}-mpt`, date: dateStr, type: 'Review', subject: Subject.TORTS, description: `MPT 90m Timed Task`, completed: false, estimatedMinutes: 120 });
      }
    }
    // PHASE 5: MAY - High Intensity Simulation
    else if (month === 4) {
      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: Subject.CON_LAW, description: `20 Q Mixed MBE (Timed/Exam Mode)`, count: 20, completed: false, estimatedMinutes: 80 });
        allTasks.push({ id: `${dateStr}-recall`, date: dateStr, type: 'Review', subject: Subject.CON_LAW, description: `Recall High-Freq Rules (Blank Paper)`, completed: false, estimatedMinutes: 30 });
      } else {
        allTasks.push({ id: `${dateStr}-mock-mee`, date: dateStr, type: 'MEE', subject: Subject.CIV_PRO, description: `Full 6-Question MEE Mock (3 Hours)`, completed: false, estimatedMinutes: 180 });
        allTasks.push({ id: `${dateStr}-mock-mbe`, date: dateStr, type: 'MBE', subject: Subject.CIV_PRO, description: `100 Q MBE Mock`, count: 100, completed: false, estimatedMinutes: 120 });
      }
    }
    // PHASE 6: JUNE - Final Polish
    else if (month === 5) {
      if (!isWknd) {
        allTasks.push({ id: `${dateStr}-mbe`, date: dateStr, type: 'MBE', subject: Subject.TORTS, description: `20 Q Mixed MC (Fully Closed Book)`, count: 20, completed: false, estimatedMinutes: 70 });
        allTasks.push({ id: `${dateStr}-list`, date: dateStr, type: 'Outline', subject: Subject.TORTS, description: `Review 'Final 2-Week' Rule Cheat Sheet`, completed: false, estimatedMinutes: 30 });
      } else {
        allTasks.push({ id: `${dateStr}-100mock`, date: dateStr, type: 'MBE', subject: Subject.REAL_PROPERTY, description: `100-Question Final Mock`, count: 100, completed: false, estimatedMinutes: 180 });
        allTasks.push({ id: `${dateStr}-weak`, date: dateStr, type: 'Review', subject: Subject.REAL_PROPERTY, description: `Focus: Target Weakest Subject Rules`, completed: false, estimatedMinutes: 120 });
      }
    }
  }

  return allTasks;
};

export const MOCK_TASKS: StudyTask[] = generateDailyTasks();

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1, subject: Subject.CIV_PRO, subTopic: "Removal", factPattern: "Defendant is a citizen of State B. Plaintiff is citizen of State A. Action filed in State B state court.", questionText: "Can the defendant remove?", options: ["Yes", "No", "Only if $75k", "Only if Federal Question"], correctAnswer: "No", explanation: "Forum-defendant rule prohibits removal in diversity-only cases if a defendant is a citizen of the forum state."
  }
];

export const MOCK_ERRORS: ErrorEntry[] = [];
export const MOCK_CARDS: Flashcard[] = [];
