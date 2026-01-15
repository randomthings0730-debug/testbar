
import React, { useMemo, useState, useEffect } from 'react';
import { StudyTask, UserProfile, Subject, PracticeLog, ErrorEntry } from '../types';
import { CheckCircle2, BookOpen, ChevronRight, Plus, Trophy, Target, ListChecks, Clock, Brain, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { RuleDeckManager } from '../services/ruleDeckService';

interface DashboardProps {
  tasks: StudyTask[];
  profile: UserProfile;
  onToggleTask: (id: string) => void;
  practiceLogs: PracticeLog[];
  onLogMbe: (subject: Subject, total: number, wrong: number) => void;
  errors?: ErrorEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, profile, onToggleTask, practiceLogs, onLogMbe }) => {
  const [systemToday, setSystemToday] = useState<Date>(new Date());
  
  // 初始化時從系統獲得今天的日期
  useEffect(() => {
    setSystemToday(new Date());
  }, []);

  const todayStr = format(systemToday, 'yyyy-MM-dd');

  // 1. 今日任務 (與 Planner 同步)
  const todayTasks = useMemo(() => 
    tasks.filter(t => t.date === todayStr), 
    [tasks, todayStr]
  );

  // 2. 今日閱讀任務 (縮小版顯示)
  const readingTask = useMemo(() => 
    todayTasks.find(t => t.type === 'Outline' || t.type === 'Review'), 
    [todayTasks]
  );

  // 3. 累計問題數與達成率 (Cumulative)
  const totalDoneCount = useMemo(() => {
    return practiceLogs.reduce((acc, log) => acc + log.total, 0);
  }, [practiceLogs]);

  const mbeGoal = profile.mbeGoal || 2000;
  const totalProgressPercent = Math.min(100, (totalDoneCount / mbeGoal) * 100);

  // 4. 正答率統計 (縮小版顯示)
  const overallAccuracy = useMemo(() => {
    const total = practiceLogs.reduce((acc, l) => acc + l.total, 0);
    const wrong = practiceLogs.reduce((acc, l) => acc + l.wrong, 0);
    return total > 0 ? Math.round(((total - wrong) / total) * 100) : 0;
  }, [practiceLogs]);

  // Memory System Metrics
  const activeRecallTasks = useMemo(() => {
    return tasks.filter(t =>
      t.memoryTag?.includes('active-recall') ||
      t.memoryTag?.includes('recall') ||
      t.type === 'ActiveRecall' ||
      t.type === 'RuleWriting'
    );
  }, [tasks]);

  const totalStudyMinutes = useMemo(() => {
    return tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  }, [tasks]);

  const activeRecallTimePercent = useMemo(() => {
    const activeRecallMinutes = activeRecallTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    return totalStudyMinutes > 0 ? Math.round((activeRecallMinutes / totalStudyMinutes) * 100) : 0;
  }, [activeRecallTasks, totalStudyMinutes]);

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* 頂部小區塊：閱讀任務 & 正確率 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 小區塊：今日閱讀任務 */}
        <div className="bg-white rounded-[28px] p-4 border border-amurLilac/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-ochre mb-1">
            <BookOpen size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Today's Reading</span>
          </div>
          <p className="text-[11px] font-[900] text-royalHigh leading-tight line-clamp-2">
            {readingTask ? readingTask.description : "No tasks"}
          </p>
          <p className="text-[7px] font-black text-grapeBottle/40 mt-1.5">{format(systemToday, 'MMM dd, EEEE')}</p>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03]">
            <BookOpen size={40} />
          </div>
        </div>

        {/* 小區塊：現在的平均正答率 */}
        <div className="bg-white rounded-[28px] p-4 border border-amurLilac/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-royalDignity mb-1">
            <Target size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Accuracy Rate</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-[900] text-royalHigh">{overallAccuracy}</span>
            <span className="text-[10px] font-black text-buttery">%</span>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03]">
            <Target size={40} />
          </div>
        </div>
      </div>

      {/* 累計演習進捗 (MBE 累計 vs 總目標) */}
      <div className="bg-royalHigh rounded-[32px] p-6 text-white shadow-xl shadow-royalHigh/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-buttery">
            <Trophy size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Overall Progress (MBE)</span>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {totalProgressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-4 relative z-10">
          <span className="text-5xl font-[900] tracking-tighter">{totalDoneCount}</span>
          <span className="text-2xl font-black text-white/30">/ {mbeGoal}</span>
        </div>
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative z-10">
          <div 
            className="bg-buttery h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,217,125,0.5)]" 
            style={{ width: `${totalProgressPercent}%` }} 
          />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Memory System Indicators */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Recall Time */}
        <div className="bg-white rounded-[28px] p-4 border border-amurLilac/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-royalDignity mb-1">
            <Brain size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Active Recall</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-[900] text-royalHigh">{activeRecallTimePercent}</span>
            <span className="text-[10px] font-black text-buttery">%</span>
          </div>
          <p className="text-[7px] font-black text-grapeBottle/40 mt-1">Target: 25-35%</p>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03]">
            <Brain size={40} />
          </div>
        </div>

        {/* Spaced Repetition Status */}
        <div className="bg-white rounded-[28px] p-4 border border-amurLilac/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-ochre mb-1">
            <Zap size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Memory Tasks</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-[900] text-royalHigh">{activeRecallTasks.length}</span>
            <span className="text-[10px] font-black text-buttery">planned</span>
          </div>
          <p className="text-[7px] font-black text-grapeBottle/40 mt-1">With spaced rep</p>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03]">
            <Zap size={40} />
          </div>
        </div>
      </div>

      {/* 今日のミッション (與 Planner 連動的主區塊) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ListChecks size={16} className="text-ochre" />
          <h3 className="text-[11px] font-black text-royalHigh uppercase tracking-[0.2em]">Today's Missions</h3>
        </div>
        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => onToggleTask(task.id)}
                className="group bg-white p-5 rounded-[28px] border border-amurLilac/30 shadow-sm flex items-center gap-4 transition-all hover:border-buttery/40 cursor-pointer active:scale-[0.98]"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${task.completed ? 'bg-royalDignity text-white border-transparent' : 'bg-sunlight text-ochre border-buttery/20'}`}>
                  {task.completed && <CheckCircle2 size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black text-royalDignity uppercase tracking-widest mb-0.5">{task.subject}</p>
                  <h4 className={`text-sm font-bold leading-snug ${task.completed ? 'line-through text-grapeBottle/40' : 'text-royalHigh'}`}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 opacity-60">
                    <Clock size={8} className="text-ochre" />
                    <span className="text-[8px] font-black text-grapeBottle uppercase tracking-widest">{task.estimatedMinutes} mins</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-amurLilac/40 rounded-[28px] py-10 text-center">
              <p className="text-[10px] font-bold text-grapeBottle/30 uppercase tracking-widest italic">No tasks for today</p>
            </div>
          )}
        </div>
      </section>

      {/* 演習結果を記録 */}
      <section className="bg-white p-6 rounded-[32px] border border-amurLilac shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={16} className="text-ochre" />
          <h3 className="text-[10px] font-black text-royalHigh uppercase tracking-widest">Log Practice Result</h3>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <select className="w-full bg-sunlight/50 border border-amurLilac/30 rounded-2xl p-4 text-xs font-black text-royalHigh outline-none appearance-none cursor-pointer" value={session.subject} onChange={e => setSession({...session, subject: e.target.value as Subject})}>
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-royalHigh">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[8px] font-black text-royalHigh/40 uppercase ml-2 mb-1 block">TOTAL</label>
              <input type="number" placeholder="20" className="w-full bg-sunlight border border-buttery/10 rounded-2xl p-4 text-lg font-black outline-none text-royalHigh" value={session.total} onChange={e => setSession({...session, total: e.target.value})} />
            </div>
            <div>
              <label className="text-[8px] font-black text-royalHigh/40 uppercase ml-2 mb-1 block">WRONG</label>
              <input type="number" placeholder="5" className="w-full bg-bellOfLove border border-amurLilac/30 rounded-2xl p-4 text-lg font-black outline-none text-royalDignity" value={session.wrong} onChange={e => setSession({...session, wrong: e.target.value})} />
            </div>
          </div>
            <button onClick={handleCommit} className="w-full bg-royalHigh text-white py-5 rounded-[24px] font-[900] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-royalHigh/10 active:scale-[0.98] transition-all">
            Save Result
          </button>
        </div>
      </section>
      
    </div>
  );
};

export default Dashboard;
