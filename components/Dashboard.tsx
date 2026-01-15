
import React, { useMemo, useState } from 'react';
import { StudyTask, UserProfile, Subject, PracticeLog, ErrorEntry } from '../types';
import { CheckCircle2, BookOpen, Target, AlertTriangle, ChevronRight, Plus, Trophy } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

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
  const todayStr = format(SYSTEM_TODAY, 'yyyy-MM-dd');

  // 1. 今日任務過濾
  const todayTasks = useMemo(() => tasks.filter(t => t.date === todayStr), [tasks, todayStr]);
  
  // 【讀什麼】：抓取今日的 Outline 或 Review 任務
  const readingTask = useMemo(() => 
    todayTasks.find(t => t.type === 'Outline' || t.type === 'Review'), 
    [todayTasks]
  );

  // 【做幾題】：計算今日已完成的題數 vs 今日任務設定的總題數
  const todayDoneCount = useMemo(() => {
    return practiceLogs
      .filter(log => isSameDay(parseISO(log.date), SYSTEM_TODAY))
      .reduce((acc, log) => acc + log.total, 0);
  }, [practiceLogs]);

  const todayTargetCount = useMemo(() => {
    const mbeTask = todayTasks.find(t => t.type === 'MBE');
    return mbeTask?.count || 20; // 預設 20 題
  }, [todayTasks]);

  const mbeProgressPercent = Math.min(100, (todayDoneCount / todayTargetCount) * 100);

  // 2. 數據統計
  const overallAccuracy = useMemo(() => {
    const total = practiceLogs.reduce((acc, l) => acc + l.total, 0);
    const wrong = practiceLogs.reduce((acc, l) => acc + l.wrong, 0);
    return total > 0 ? Math.round(((total - wrong) / total) * 100) : 0;
  }, [practiceLogs]);

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
    <div className="space-y-6 pb-12">
      
      {/* 核心三要素：讀什麼、做幾題、複習什麼 */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* 【讀什麼】 */}
        <div className="bg-white rounded-[32px] p-6 border-2 border-amurLilac shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-ochre">
                <BookOpen size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">今日讀什麼</span>
              </div>
              <h2 className="text-xl font-[900] text-royalHigh leading-tight">
                {readingTask ? readingTask.description : "今日の読書予定はありません"}
              </h2>
              <p className="text-[10px] font-bold text-royalDignity uppercase tracking-widest">
                {readingTask?.subject || "REST DAY"}
              </p>
            </div>
            {readingTask?.completed && (
              <div className="bg-green-100 text-green-600 p-2 rounded-full">
                <CheckCircle2 size={24} />
              </div>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <BookOpen size={120} />
          </div>
        </div>

        {/* 【做幾題】 */}
        <div className="bg-royalHigh rounded-[32px] p-6 text-white shadow-xl shadow-royalHigh/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-buttery">
              <Target size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">今日該做幾題</span>
            </div>
            <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">目標: {todayTargetCount} 題</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-[900] tracking-tighter">{todayDoneCount}</span>
            <span className="text-2xl font-black text-white/30">/ {todayTargetCount}</span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-buttery h-full transition-all duration-1000 ease-out" 
              style={{ width: `${mbeProgressPercent}%` }} 
            />
          </div>
        </div>

        {/* 【複習哪些錯誤】 */}
        <div className="bg-sunlight rounded-[32px] p-6 border border-buttery/30 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-ochre shadow-sm border border-buttery/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-ochre">
                <span className="text-[10px] font-black uppercase tracking-widest">要複習哪些錯誤</span>
              </div>
              <p className="text-lg font-[900] text-royalHigh">待解決問題：{errors.length} 件</p>
              {errors.length > 0 && (
                <p className="text-[10px] font-bold text-ochre/60 line-clamp-1">最新：{errors[0].rule}</p>
              )}
            </div>
          </div>
          <ChevronRight className="text-ochre/40 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 輔助資訊：總體正答率與記錄功能 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[28px] p-5 border border-amurLilac/50 flex flex-col justify-between">
          <p className="text-[9px] font-black text-grapeBottle/40 uppercase tracking-widest mb-2">平均正答率</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-[900] text-royalHigh">{overallAccuracy}</span>
            <span className="text-sm font-black text-buttery">%</span>
          </div>
        </div>
        <div className="bg-white rounded-[28px] p-5 border border-amurLilac/50 flex flex-col justify-between">
          <p className="text-[9px] font-black text-grapeBottle/40 uppercase tracking-widest mb-2">MBE 累計</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-[900] text-royalHigh">{practiceLogs.reduce((acc, l) => acc + l.total, 0)}</span>
            <span className="text-[9px] font-black text-grapeBottle/40">/ {profile.mbeGoal}</span>
          </div>
        </div>
      </div>

      {/* 快速記錄區塊 */}
      <section className="bg-white p-6 rounded-[32px] border border-amurLilac shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={16} className="text-ochre" />
          <h3 className="text-[10px] font-black text-royalHigh uppercase tracking-widest">演習結果を記録</h3>
        </div>
        <div className="space-y-4">
          <select className="w-full bg-sunlight/50 border border-amurLilac/30 rounded-2xl p-4 text-xs font-black text-royalHigh outline-none appearance-none" value={session.subject} onChange={e => setSession({...session, subject: e.target.value as Subject})}>
            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Total" className="w-full bg-sunlight border border-buttery/10 rounded-2xl p-4 text-lg font-black outline-none text-royalHigh" value={session.total} onChange={e => setSession({...session, total: e.target.value})} />
            <input type="number" placeholder="Wrong" className="w-full bg-bellOfLove border border-amurLilac/30 rounded-2xl p-4 text-lg font-black outline-none text-royalDignity" value={session.wrong} onChange={e => setSession({...session, wrong: e.target.value})} />
          </div>
          <button onClick={handleCommit} className="w-full bg-royalHigh text-white py-5 rounded-[24px] font-[900] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-royalHigh/10">
            記錄を保存
          </button>
        </div>
      </section>
      
    </div>
  );
};

export default Dashboard;
