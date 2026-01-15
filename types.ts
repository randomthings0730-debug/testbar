
export enum Subject {
  TORTS = 'Torts',
  CONTRACTS = 'Contracts',
  EVIDENCE = 'Evidence',
  CRIMINAL_LAW = 'Crim Law & Pro',
  CON_LAW = 'Con Law',
  REAL_PROPERTY = 'Real Property',
  CIV_PRO = 'Civ Pro',
  BUSINESS_ASSOCIATIONS = 'Business Associations (Agency, Partnership, Corp, LLC)'
}

export type TaskType = 'MBE' | 'MEE' | 'Review' | 'Flashcard' | 'Outline';

export interface StudyTask {
  id: string;
  date: string;
  type: TaskType;
  subject: Subject;
  description: string;
  count?: number; 
  completed: boolean;
  estimatedMinutes: number;
}

export interface Flashcard {
  id: string;
  subject: Subject;
  front: string;
  back: string;
  interval: number;
  ease: number;
  repetitions: number;
  nextReviewDate: string;
}

export interface UserProfile {
  examDate: string;
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  mbeGoal: number;
  targetScore: number;
}

export interface PracticeLog {
  id: string;
  date: string;
  subject: Subject;
  total: number;
  wrong: number;
}

export interface SubjectStat {
  total: number;
  wrong: number;
}

export interface Question {
  id: number;
  subject: Subject;
  subTopic: string;
  factPattern: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  accuracy: number;
  scaledScore: number;
}

// Added ErrorEntry interface as it was missing and caused errors in several files.
// This interface tracks incorrect answers and legal rules missed during study sessions.
export interface ErrorEntry {
  id: string;
  subject: Subject;
  subtopic: string;
  source: string;
  reason: string;
  rule: string;
  keyFacts: string;
  createdAt: string;
}
