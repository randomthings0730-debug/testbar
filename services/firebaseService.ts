import { UserProfile, StudyTask, Flashcard, PracticeLog } from '../types';

export interface AppData {
  profile: UserProfile;
  tasks: StudyTask[];
  cards: Flashcard[];
  mbePracticed: Record<string, number>;
  practiceLogs: PracticeLog[];
}

// 簡單的本地存儲實現，無需 Firebase
const STORAGE_KEY = 'barExamData';

export async function saveAppData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Data saved to local storage');
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export async function loadAppData(): Promise<AppData | null> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      console.log('Data loaded from local storage');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return null;
}
