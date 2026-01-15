
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, LabelList
} from 'recharts';
import { PracticeLog } from '../types';
import { format, parseISO } from 'date-fns';
import { Trash2, Activity, BarChart2, Layers, Award } from 'lucide-react';

interface AnalyticsProps { practiceLogs: PracticeLog[]; onDeleteLog: (id: string) => void; }

const Analytics: React.FC<AnalyticsProps> = ({ practiceLogs, onDeleteLog }) => {
  const globalStats = useMemo(() => {
    return practiceLogs.reduce((acc, log) => ({
      total: acc.total + (log.total || 0),
      correct: acc.correct + ((log.total || 0) - (log.wrong || 0))
    }), { total: 0, correct: 0 });
  }, [practiceLogs]);

  const overallAccuracy = globalStats.total > 0 
    ? Math.round((globalStats.correct / globalStats.total) * 100) 
    : 0;

  const accuracyData = useMemo(() => {
    const stats: Record<string, { total: number, correct: number }> = {};
    practiceLogs.forEach(log => {
      if (!stats[log.subject]) stats[log.subject] = { total: 0, correct: 0 };
      stats[log.subject].total += log.total;
      stats[log.subject].correct += (log.total - log.wrong);
    });
    return Object.keys(stats).map(subj => ({
      name: subj,
      accuracy: Math.round((stats[subj].correct / stats[subj].total) * 100),
      total: stats[subj].total,
      label: `${Math.round((stats[subj].correct / stats[subj].total) * 100)}%`
    })).sort((a, b) => b.total - a.total);
  }, [practiceLogs]);

  return (
    <div className="space-y-7 pb-20">
      <div className="grid grid-cols-2 gap-5">
         {/* 累計問題數：加入黃色點綴 */}
         <div className="p-9 bg-royalHigh text-white rounded-[48px] shadow-xl shadow-royalHigh/15 relative overflow-hidden group border-b-4 border-buttery/20">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-buttery/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            <Layers size={22} className="text-buttery mb-5" />
            <p className="text-[11px] font-[900] uppercase opacity-50 tracking-[0.25em]">累計問題数</p>
            <p className="text-6xl font-[900] text-white mt-2 leading-none tracking-tighter">{globalStats.total}</p>
         </div>

         {/* 平均正答率：背景微調黃色 */}
         <div className="p-9 bg-white border border-amurLilac rounded-[48px] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-sunlight rounded-bl-full pointer-events-none opacity-50"></div>
            <Award size={22} className="text-buttery fill-buttery/10 mb-5" />
            <p className="text-[11px] font-[900] text-grapeBottle/60 uppercase tracking-[0.25em]">平均正答率</p>
            <div className="flex items-baseline gap-1 mt-2">
              <p className="text-6xl font-[900] text-royalHigh leading-none tracking-tighter">{overallAccuracy}</p>
              <span className="text-2xl font-black text-buttery">%</span>
            </div>
         </div>
      </div>

      {/* 科目別圖表：使用黃色強調優秀表現 */}
      <div className="bg-white p-9 rounded-[48px] border border-amurLilac shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xs font-black text-royalHigh uppercase tracking-[0.2em]">科目別パフォーマンス</h3>
            <p className="text-[9px] font-bold text-ochre mt-1 uppercase tracking-widest">Accuracy Ranking</p>
          </div>
        </div>
        <div className="h-80">
          {accuracyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} layout="vertical" margin={{ left: -10, right: 45 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={85} tick={{fontSize: 9, fontWeight: '900', fill: '#8D7694'}} />
                <Tooltip 
                  cursor={{fill: '#FFF9E6'}}
                  contentStyle={{ borderRadius: '20px', border: '1px solid #FFD97D', boxShadow: '0 10px 25px rgba(184, 138, 78, 0.08)', fontWeight: 'bold' }}
                />
                <Bar dataKey="accuracy" radius={[0, 15, 15, 0]} barSize={28}>
                   {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.accuracy > 75 ? '#FFD97D' : (entry.accuracy > 60 ? '#AC92B6' : '#C6AFCE')} />
                   ))}
                   <LabelList dataKey="label" position="right" style={{ fontSize: '11px', fontWeight: '900', fill: '#8D7694' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <BarChart2 size={48} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Data Yet</p>
            </div>
          )}
        </div>
      </div>

      {/* 演習履歷 */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-3">
          <div className="w-1 h-1 rounded-full bg-buttery"></div>
          <h3 className="text-xs font-black text-royalHigh uppercase tracking-[0.2em]">演習履歴</h3>
        </div>
        <div className="space-y-4">
          {practiceLogs.slice(0, 10).map(log => (
            <div key={log.id} className="bg-white p-6 rounded-[36px] border border-amurLilac/40 flex items-center justify-between hover:bg-sunlight transition-all group">
               <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2 border ${((log.total - log.wrong)/log.total) > 0.8 ? 'bg-sunlight text-ochre border-buttery/30' : 'bg-bellOfLove text-viviola border-amurLilac/20'}`}>
                    {log.subject}
                  </span>
                  <p className="text-[11px] font-bold text-grapeBottle/60">{format(parseISO(log.date), 'M月d日 HH:mm')}</p>
               </div>
               <div className="flex items-center gap-7">
                  <div className="text-right">
                    <p className="text-lg font-[900] text-royalHigh tracking-tighter">
                      {log.total - log.wrong} <span className="opacity-20 mx-0.5">/</span> {log.total}
                    </p>
                    <p className="text-[9px] font-black text-royalDignity uppercase tracking-widest mt-0.5">Correct</p>
                  </div>
                  <button onClick={() => onDeleteLog(log.id)} className="p-3 text-grapeBottle/20 hover:text-red-400 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Analytics;
