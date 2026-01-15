
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings,
  Quote
} from 'lucide-react';
import { 
  Subject, 
  StudyTask, 
  UserProfile,
  PracticeLog,
  ErrorEntry
} from './types';
import { 
  INITIAL_PROFILE,
  MOCK_TASKS
} from './constants';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Analytics from './components/Analytics';
import ExamSettings from './components/ExamSettings';
import { loadAppData, saveAppData } from './services/firebaseService';
import { format, isBefore, parseISO, differenceInDays } from 'date-fns';

type View = 'dashboard' | 'planner' | 'analytics' | 'settings';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [systemToday, setSystemToday] = useState<Date>(new Date());
  
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]); 
  const [errors, setErrors] = useState<ErrorEntry[]>([]);

  const isInitialLoad = useRef(true);

  // 初始化時從系統獲得今天的日期
  useEffect(() => {
    setSystemToday(new Date());
  }, []);

  const rolloverIncompleteTasks = (taskList: StudyTask[]): StudyTask[] => {
    const todayStr = format(systemToday, 'yyyy-MM-dd');
    return taskList.map(task => {
      try {
        const taskDate = parseISO(task.date);
        if (!task.completed && isBefore(taskDate, systemToday)) {
          return { ...task, date: todayStr };
        }
      } catch (e) {}
      return task;
    });
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const data = await loadAppData();
      let finalTasks = MOCK_TASKS;
      if (data) {
        setProfile(data.profile || INITIAL_PROFILE);
        if (data.tasks && data.tasks.length > 0) finalTasks = data.tasks;
        setPracticeLogs(data.practiceLogs || []);
        setErrors((data as any).errors || []);
      }
      setTasks(rolloverIncompleteTasks(finalTasks));
      setIsLoading(false);
      isInitialLoad.current = false;
    }
    init();
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) return;
    saveAppData({ profile, tasks, cards: [], mbePracticed: {}, practiceLogs, errors } as any);
  }, [profile, tasks, practiceLogs, errors]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleLogMbe = (subject: Subject, total: number, wrong: number) => {
    const newLog: PracticeLog = {
      id: `log-${Date.now()}`,
      date: format(systemToday, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      subject,
      total,
      wrong
    };
    setPracticeLogs(prev => [newLog, ...prev]);
  };

  const daysLeft = differenceInDays(new Date(profile.examDate), systemToday);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-bgMain">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bgMain max-w-lg mx-auto shadow-2xl relative overflow-hidden border-x border-warmPeach/20 font-sans">
      <header className="px-5 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-10 bg-white border-b border-warmPeach/30">
        <div className="flex justify-between items-center">
          <div className="flex-1 pr-4 sm:pr-6 border-r border-warmPeach mr-4 sm:mr-6">
             <Quote size={16} className="text-accent mb-2 sm:mb-3" />
             <p className="text-[12px] sm:text-[13px] font-bold text-plumDeep leading-snug italic">
               "1インチ、コツコツと前に進もう。"
             </p>
             <p className="text-[8px] sm:text-[9px] font-black text-slateBlue uppercase tracking-[0.2em] mt-1.5 sm:mt-2">— チャールズ・マンガー</p>
          </div>
          <div className="text-right whitespace-nowrap">
            <p className="text-[8px] sm:text-[9px] font-black text-slateBlue uppercase tracking-[0.2em]">試験まで</p>
            <div className="flex flex-col items-end">
               <p className="text-3xl sm:text-4xl font-[900] text-primary tracking-tighter leading-none mt-1">{daysLeft}</p>
               <p className="text-[9px] sm:text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1">残り日数</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 pt-5 sm:pt-6 pb-28 overflow-y-auto scroll-smooth">
        {view === 'dashboard' && (
          <Dashboard 
            tasks={tasks} 
            profile={profile} 
            onToggleTask={toggleTask} 
            practiceLogs={practiceLogs} 
            onLogMbe={handleLogMbe}
            errors={errors}
          />
        )}
        {view === 'planner' && (
          <Planner tasks={tasks} setTasks={setTasks} deleteTask={deleteTask} toggleTask={toggleTask} examDate={profile.examDate} />
        )}
        {view === 'analytics' && (
          <Analytics practiceLogs={practiceLogs} onDeleteLog={(id) => setPracticeLogs(prev => prev.filter(l => l.id !== id))} />
        )}
        {view === 'settings' && (
          <ExamSettings profile={profile} setProfile={setProfile} />
        )}
      </main>

      {/* 加大尺寸後的導覽列 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-24 sm:h-28 bg-white/95 backdrop-blur-xl border-t border-warmPeach/20 flex items-center justify-around px-4 sm:px-8 pb-5 sm:pb-6 z-50 shadow-[0_-10px_30px_-15px_rgba(113,93,119,0.1)]">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-2 pt-3 transition-all active:scale-90 ${view === 'dashboard' ? 'text-primary' : 'text-slateBlue/40'}`}>
          <Target size={28} strokeWidth={view === 'dashboard' ? 3 : 2.5} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'dashboard' ? 'opacity-100' : 'opacity-60'}`}>ダッシュボード</span>
        </button>
        <button onClick={() => setView('planner')} className={`flex flex-col items-center gap-2 pt-3 transition-all active:scale-90 ${view === 'planner' ? 'text-primary' : 'text-slateBlue/40'}`}>
          <CalendarIcon size={28} strokeWidth={view === 'planner' ? 3 : 2.5} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'planner' ? 'opacity-100' : 'opacity-60'}`}>計画</span>
        </button>
        <button onClick={() => setView('analytics')} className={`flex flex-col items-center gap-2 pt-3 transition-all active:scale-90 ${view === 'analytics' ? 'text-primary' : 'text-slateBlue/40'}`}>
          <BarChart3 size={28} strokeWidth={view === 'analytics' ? 3 : 2.5} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'analytics' ? 'opacity-100' : 'opacity-60'}`}>分析</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-2 pt-3 transition-all active:scale-90 ${view === 'settings' ? 'text-primary' : 'text-slateBlue/40'}`}>
          <Settings size={28} strokeWidth={view === 'settings' ? 3 : 2.5} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'settings' ? 'opacity-100' : 'opacity-60'}`}>設定</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
