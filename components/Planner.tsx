
import React, { useState, useMemo, useEffect } from 'react';
import { StudyTask, Subject } from '../types';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2,
  Plus, Edit2, X, Clock, Book, CalendarDays, Brain, Trash2
} from 'lucide-react';
import { 
  format, eachDayOfInterval, isSameDay, addMonths, getDay, 
  parseISO, addDays, isWeekend, differenceInDays, isBefore 
} from 'date-fns';
import { ScheduleService } from '../services/scheduleService';

interface PlannerProps {
  tasks: StudyTask[];
  setTasks: React.Dispatch<React.SetStateAction<StudyTask[]>>;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  examDate: string;
}

const Planner: React.FC<PlannerProps> = ({ tasks, setTasks, deleteTask, toggleTask, examDate }) => {
  // 使用系統時間而非固定日期 - 初始化為當前日期以避免 null 錯誤
  const today = new Date();
  const [systemToday, setSystemToday] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(true);
  
  const [editForm, setEditForm] = useState<StudyTask>({
    id: '', date: '', type: 'Outline', subject: Subject.TORTS, 
    description: '', completed: false, estimatedMinutes: 30
  });

  // Helper functions to replace missing date-fns exports
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

  /**
   * 教練計畫生成邏輯 - 使用 ScheduleService 的記憶機制
   * 1. 從選定日期 (selectedDate) 開始排程直到考試日。
   * 2. 刪除選定日期及之後的未完成任務。
   * 3. 核心功能：內建間隔重複、主動回想、記憶曲線等機制。
   */
  const generateCoachSchedule = () => {
    if (!selectedDate || !systemToday) return;
    
    const startDateStr = format(selectedDate, 'yyyy/MM/dd');
    if (!confirm(`${startDateStr} 以降のスケジュールを「高度な記憶戦略」で自動生成しますか？\n\n✓ 間隔重複 (1日、3日、1週、2週)\n✓ 主動回想 (ルール記述、問題解法)\n✓ タスク多様性 (読む→書く→解く のサイクル)\n\n既存の未完了予定は削除されます。`)) return;
    
    const start = new Date(selectedDate);
    // 考試日解析，若無則預設今天後 180 天
    const end = examDate ? parseISO(examDate) : addDays(systemToday, 180);
    
    // 保留選定日期之前的所有任務
    const preservedTasks = tasks.filter(t => {
      const tDate = parseISO(t.date);
      return isBefore(tDate, start);
    });

    // 刪除選定日期及之後的所有未完成任務
    const incompleteTasks = tasks.filter(t => {
      const tDate = parseISO(t.date);
      return !isBefore(tDate, start) && !t.completed;
    });

    // 使用 ScheduleService 生成完整的記憶系統計畫
    const newGeneratedTasks = ScheduleService.generateCompletePlan(start, end, preservedTasks);

    // 如果有未完成的任務，添加到計畫的最後
    const rescheduledIncompleteTasks = incompleteTasks.map(task => ({
      ...task,
      date: format(end, 'yyyy-MM-dd')
    }));
    
    setTasks([...preservedTasks, ...newGeneratedTasks, ...rescheduledIncompleteTasks]);
    alert(`✓ Schedule rebuilt from ${startDateStr}!\n\n📊 Generated ${newGeneratedTasks.length} tasks with memory mechanisms:\n\n• Spaced repetition intervals (1, 3, 7, 14 days)\n• Active recall blocks (rule writing, outlining)\n• Task variety (read → write → solve)\n• Error analysis and targeted review\n\nStart your intensive study plan today!`);
  };

  const monthStart = startOfMonth(currentMonth!);
  const monthEnd = endOfMonth(currentMonth!);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const firstDayIndex = getDay(monthStart);
  const paddings = Array.from({ length: firstDayIndex });

  const dateTasks = useMemo(() => {
    return selectedDate ? tasks.filter(t => isSameDay(parseISO(t.date), selectedDate)) : [];
  }, [tasks, selectedDate]);

  const openAdd = () => {
    if (!selectedDate) return;
    setIsNewTask(true);
    setEditForm({ 
      id: `task-${Date.now()}`, 
      date: format(selectedDate, 'yyyy-MM-dd'), 
      type: 'Outline', 
      subject: Subject.TORTS, 
      description: '', 
      completed: false, 
      estimatedMinutes: 30 
    });
    setIsEditorOpen(true);
  };

  const openEdit = (task: StudyTask) => {
    setIsNewTask(false);
    setEditForm({ ...task });
    setIsEditorOpen(true);
  };

  const saveTask = () => {
    if (!editForm.description.trim()) return;
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === editForm.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = editForm;
        return next;
      } else return [...prev, editForm];
    });
    setIsEditorOpen(false);
  };

  const handleDeleteInModal = () => {
    if (confirm("このタスクを削除しますか？")) {
      deleteTask(editForm.id);
      setIsEditorOpen(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 頂部標題與生成按鈕 */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-[900] text-royalHigh tracking-tight">{currentMonth ? format(currentMonth, 'yyyy年 M月') : ''}</h2>
          <p className="text-[9px] font-black text-ochre uppercase tracking-widest mt-1">学習計画表</p>
        </div>
        <div className="flex gap-2">
          {/* 生成計畫按鈕 - 根據當前選擇日期 */}
          <button 
            onClick={generateCoachSchedule} 
            className="px-4 py-2 bg-buttery text-ochre text-[10px] font-black rounded-xl border border-ochre/20 hover:bg-ochre hover:text-white transition-all shadow-sm flex items-center gap-2"
          >
            <Brain size={14} /> Generate Plan
          </button>
          <button onClick={() => currentMonth && setCurrentMonth(addMonths(currentMonth, -1))} className="p-3 bg-white text-royalHigh rounded-2xl shadow-sm hover:bg-sunlight"><ChevronLeft size={18} /></button>
          <button onClick={() => currentMonth && setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-white text-royalHigh rounded-2xl shadow-sm hover:bg-sunlight"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* 日曆區塊 */}
      <div className="bg-white p-7 rounded-[48px] border border-amurLilac shadow-sm">
        <div className="grid grid-cols-7 gap-y-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d} className="text-[10px] font-black text-grapeBottle/30 uppercase mb-2">{d}</span>)}
          {paddings.map((_, i) => <div key={`pad-${i}`} className="w-10 h-10" />)}
          {daysInMonth.map((day, idx) => {
             const isSelected = selectedDate && isSameDay(day, selectedDate);
             const isToday = systemToday && isSameDay(day, systemToday);
             const hasTasks = tasks.some(t => isSameDay(parseISO(t.date), day));
             return (
              <button key={idx} onClick={() => setSelectedDate(day)} className={`w-10 h-10 rounded-2xl text-xs font-black relative flex items-center justify-center mx-auto transition-all ${isSelected ? 'bg-royalHigh text-white shadow-lg' : 'text-royalHigh hover:bg-sunlight'} ${isToday && !isSelected ? 'border-b-2 border-ochre text-ochre' : ''}`}>
                {format(day, 'd')}
                {hasTasks && !isSelected && <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-buttery'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 選定日期的任務列表 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-4">
           <div>
             {selectedDate && (
               <>
                 <h3 className="text-xl font-black text-royalHigh tracking-tight">{format(selectedDate, 'MMM dd')} | {format(selectedDate, 'EEEE')}</h3>
                 <p className="text-[9px] font-black text-ochre uppercase tracking-[0.2em] mt-0.5">{format(selectedDate, 'yyyy-MM-dd')}</p>
               </>
             )}
           </div>
           <button onClick={openAdd} className="bg-royalHigh text-white p-4 rounded-[24px] shadow-lg active:scale-95 transition-all"><Plus size={22} /></button>
        </div>

        <div className="space-y-4">
          {dateTasks.length > 0 ? dateTasks.map((task) => (
            <div key={task.id} className="group bg-white p-6 rounded-[36px] border border-amurLilac/30 shadow-sm flex items-center gap-5 transition-all hover:border-buttery/40">
               <div onClick={() => toggleTask(task.id)} className={`w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer transition-all border ${task.completed ? 'bg-royalDignity text-white border-transparent' : 'bg-sunlight text-ochre border-buttery/20'}`}>
                   {task.completed && <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1 min-w-0" onClick={() => openEdit(task)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[9px] font-black text-royalDignity uppercase tracking-widest">{task.subject}</p>
                    {task.description.includes('Spaced Repetition') && (
                      <span className="flex items-center gap-1 text-[8px] font-black bg-buttery/20 text-ochre px-2 py-0.5 rounded-full">
                        <Brain size={8} /> Spaced Rep
                      </span>
                    )}
                  </div>
                  <h4 className={`text-[15px] font-bold leading-snug ${task.completed ? 'line-through text-grapeBottle/40' : 'text-royalHigh'}`}>{task.description}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={10} className="text-ochre" />
                      <span className="text-[9px] font-black text-grapeBottle uppercase tracking-widest">{task.estimatedMinutes} mins</span>
                    </div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEdit(task); }} className="p-2.5 text-grapeBottle/40 hover:text-ochre"><Edit2 size={16} /></button>
            </div>
          )) : (
            <div className="py-24 text-center flex flex-col items-center">
               <div className="w-18 h-18 bg-sunlight rounded-[32px] flex items-center justify-center mb-5 border border-buttery/20">
                 <CalendarIcon size={28} className="text-buttery" />
               </div>
               <p className="font-black text-[11px] text-grapeBottle/20 uppercase tracking-[0.4em] italic">No tasks planned</p>
               <p className="text-[9px] text-grapeBottle/40 mt-1">Click "Generate Plan" to create a study schedule</p>
            </div>
          )}
        </div>
      </section>

      {/* 編輯對話框 */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-royalHigh/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-sm rounded-[48px] p-8 shadow-2xl border border-amurLilac animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-[900] text-royalHigh">{isNewTask ? 'Add New Task' : 'Edit Task'}</h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-sunlight text-ochre rounded-2xl"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-ochre uppercase tracking-widest flex items-center gap-2 mb-3 px-1">
                  <CalendarDays size={12} /> Date
                </label>
                <input 
                  type="date"
                  className="w-full bg-sunlight border border-buttery/20 rounded-[24px] p-4 font-bold text-royalHigh outline-none"
                  value={editForm.date}
                  onChange={e => setEditForm({...editForm, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-ochre uppercase tracking-widest flex items-center gap-2 mb-3 px-1">
                  <Book size={12} /> Subject
                </label>
                <select 
                  className="w-full bg-sunlight border border-buttery/20 rounded-[24px] p-4 font-black text-xs text-royalHigh outline-none cursor-pointer" 
                  value={editForm.subject} 
                  onChange={e => setEditForm({...editForm, subject: e.target.value as Subject})}
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-ochre uppercase tracking-widest flex items-center gap-2 mb-3 px-1">
                  <Clock size={12} /> Estimated Time (minutes)
                </label>
                <input 
                  type="number"
                  className="w-full bg-sunlight border border-buttery/20 rounded-[24px] p-4 font-bold text-royalHigh outline-none"
                  value={editForm.estimatedMinutes}
                  onChange={e => setEditForm({...editForm, estimatedMinutes: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-ochre uppercase tracking-widest block mb-3 px-1">Task Description</label>
                <textarea 
                  rows={3}
                  className="w-full bg-sunlight border border-buttery/20 rounded-[24px] p-5 font-bold text-royalHigh outline-none resize-none" 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                />
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={saveTask} className="w-full bg-royalHigh text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest shadow-xl border-b-4 border-buttery/20">
                  {isNewTask ? 'Add Task' : 'Save Changes'}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditorOpen(false)} className="flex-1 bg-white text-grapeBottle py-4 rounded-[24px] font-black uppercase text-[9px] border border-amurLilac">Cancel</button>
                  {!isNewTask && (
                    <button onClick={handleDeleteInModal} className="flex-1 bg-red-50 text-red-400 py-4 rounded-[24px] font-black uppercase text-[9px] border border-red-100"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
