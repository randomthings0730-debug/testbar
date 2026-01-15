
import React, { useMemo, useState } from 'react';
import { StudyTask, UserProfile, Subject, PracticeLog, ErrorEntry } from '../types';
import { Plus, CheckCircle2, Percent, Book, PenTool, Target, ChevronRight, AlertCircle } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';

interface DashboardProps {
  tasks: StudyTask[];
  profile: UserProfile;
  onToggleTask: (id: string) => void;
  practiceLogs: PracticeLog[];
  onLogMbe: (subject: Subject, total: number, wrong: number) => void;
  errors?: ErrorEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, profile, onToggleTask, practiceLogs, onLogMbe, errors = [] }) => {
  const SYSTEM_TODAY = new Date(2026, 0, 14);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      try {
        return isSameDay(parseISO(t.date), SYSTEM_TODAY);
      } catch (e) {
        return t.date === '2026-01-14';
      }
    });
  }, [tasks]);
  
  const focusTask = useMemo(() => {
    return todayTasks.find(t => t.type === 'Outline') || todayTasks.find(t => t.type === 'Review');
  }, [todayTasks]);

  const globalTotalDone = useMemo(() => {
    return practiceLogs.reduce((acc, log) => acc + (log.total || 0), 0);
  }, [practiceLogs]);

  const globalTotalCorrect = useMemo(() => {
    return practiceLogs.reduce((acc, log) => acc + ((log.total || 0) - (log.wrong || 0)), 0);
  }, [practiceLogs]);

  const overallAccuracy = globalTotalDone > 0 
    ? Math.round((globalTotalCorrect / globalTotalDone) * 100) 
    : 0;

  const totalCompletionPercent = profile.mbeGoal > 0
    ? Math.min(100, Math.round((globalTotalDone / profile.mbeGoal) * 100))
    : 0;

  const [session, setSession] = useState({ subject: Subject.TORTS, total: '', wrong: '' });

  const handleCommit = () => {
    const t = parseInt(session.total);
    const w = parseInt(session.wrong);
    if (isNaN(t) || isNaN(w) || t < 0 || w < 0 || w > t) {
      alert("正しい数値を入力してください。");
      return;
    }
    onLogMbe(session.subject, t, w);
    setSession({ ...session, total: '', wrong: '' });
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* 1. 頂部並排區塊：重點項目 + 平均正答率 */}
      <section className="grid grid-cols-2 gap-3">
        {/* 左側：今日重點內容 (縮小版) */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 border border-amurLilac shadow-sm flex flex-col justify-between hover:border-buttery transition-all">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-sunlight flex items-center justify-center text-ochre shadow-sm">
                <Book size={14} className="sm:hidden" />
                <Book size={20} className="hidden sm:block" />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-ochre uppercase tracking-widest">重点</p>
            </div>
            <h2 className="text-sm sm:text-xl font-black text-royalHigh leading-tight line-clamp-2">
              {focusTask ? focusTask.description : "演習集中"}
            </h2>
          </div>
          <p className="text-[7px] sm:text-[10px] font-bold text-royalDignity uppercase tracking-widest mt-2 flex items-center gap-1">
            <Target size={10} /> {focusTask?.subject || "All"}
          </p>
        </div>

        {/* 右側：平均正答率 (縮小版) */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 border border-amurLilac shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-bellOfLove flex items-center justify-center text-royalDignity shadow-sm">
                <Percent size={14} className="sm:hidden" />
                <Percent size={20} className="hidden sm:block" />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-grapeBottle/60 uppercase tracking-widest">正答率</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl sm:text-4xl font-[900] text-royalHigh tracking-tighter">{overallAccuracy}</p>
              <span className="text-[10px] sm:text-xl font-black text-buttery">%</span>
            </div>
          </div>
          <div className="w-full bg-sunlight h-1 sm:h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-royalDignity h-full transition-all duration-1000" style={{ width: `${overallAccuracy}%` }} />
          </div>
        </div>
      </section>

      {/* 2. MBE 總目標進度 (全寬) */}
      <section className="bg-royalHigh rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-white shadow-xl shadow-royalHigh/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <PenTool size={16} className="text-buttery" />
            <p className="text-[9px] sm:text-[10px] font-black text-buttery uppercase tracking-[0.2em]">MBE 全体目標達成度</p>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl sm:text-5xl font-[900] tracking-tighter">{globalTotalDone}</span>
            <span className="text-xl sm:text-2xl font-black text-white/20">/</span>
            <span className="text-xl sm:text-2xl font-[900] text-buttery">{profile.mbeGoal}</span>
            <span className="text-[8px] sm:text-[10px] font-black text-white/40 ml-2 uppercase tracking-widest">Total Qs</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-buttery h-full transition-all duration-1000" style={{ width: `${totalCompletionPercent}%` }} />
          </div>
        </div>
      </section>

      {/* 3. 複習提醒 */}
      {errors.length > 0 && (
        <div className="bg-sunlight p-4 sm:p-5 rounded-[28px] sm:rounded-[32px] border border-buttery/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-ochre" />
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-ochre uppercase tracking-widest">Error Log Review</p>
              <p className="text-xs sm:text-sm font-bold text-royalHigh">{errors.length}件の未解決ルール</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-ochre/30" />
        </div>
      )}

      {/* 4. 本日のミッション詳細 (主要大面積區塊) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-buttery"></div>
          <h3 className="text-[9px] sm:text-[10px] font-black text-grapeBottle/50 uppercase tracking-[0.2em]">本日のミッション詳細</h3>
        </div>
        <div className="space-y-3">
          {todayTasks.length > 0 ? todayTasks.map(task => (
            <div key={task.id} onClick={() => onToggleTask(task.id)} className={`p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-4 transition-all cursor-pointer ${task.completed ? 'bg-bellOfLove/50 opacity-40' : 'bg-white border border-amurLilac/40 shadow-sm'}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${task.completed ? 'bg-royalHigh text-white' : 'bg-sunlight text-ochre border border-buttery/20'}`}>
                {task.completed && <CheckCircle2 size={14} />}
              </div>
              <div className="flex-1">
                <p className="text-[8px] font-black text-royalDignity uppercase tracking-widest mb-0.5">{task.subject}</p>
                <p className={`text-sm font-bold leading-snug ${task.completed ? 'line-through' : 'text-royalHigh'}`}>{task.description}</p>
              </div>
            </div>
          )) : (
            <div className="py-12 bg-white/50 rounded-[32px] border border-dashed border-amurLilac/60 text-center">
               <p className="text-[10px] font-bold text-grapeBottle/30 uppercase tracking-[0.4em] italic">今日の予定はありません</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. 演習結果記錄 (底部區塊) */}
      <section className="bg-white p-6 sm:p-7 rounded-[32px] sm:rounded-[40px] border border-amurLilac shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={16} className="text-ochre" />
          <h3 className="text-[10px] font-black text-royalHigh uppercase tracking-widest">演習結果を記録</h3>
        </div>
        <div className="space-y-4">
          <select className="w-full bg-sunlight/50 border border-amurLilac/30 rounded-2xl p-4 text-xs font-black text-royalHigh outline-none appearance-none" value={session.subject} onChange={e => setSession({...session, subject: e.target.value as Subject})}>
            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-ochre uppercase ml-2 tracking-widest">總問題數</label>
              <input type="number" placeholder="0" className="w-full bg-sunlight border border-buttery/10 rounded-2xl p-4 text-lg font-black outline-none text-royalHigh" value={session.total} onChange={e => setSession({...session, total: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-grapeBottle/60 uppercase ml-2 tracking-widest">誤答數</label>
              <input type="number" placeholder="0" className="w-full bg-bellOfLove border border-amurLilac/30 rounded-2xl p-4 text-lg font-black outline-none text-royalDignity" value={session.wrong} onChange={e => setSession({...session, wrong: e.target.value})} />
            </div>
          </div>
          <button onClick={handleCommit} className="w-full bg-royalHigh text-white py-5 rounded-[24px] font-[900] text-[11px] uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl shadow-royalHigh/20 border-b-4 border-ochre/20">
            記錄を保存
          </button>
        </div>
      </section>
      
    </div>
  );
};

export default Dashboard;
