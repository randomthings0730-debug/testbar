
import React from 'react';
import { UserProfile } from '../types';
import { Calendar, Info } from 'lucide-react';

interface ExamSettingsProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const ExamSettings: React.FC<ExamSettingsProps> = ({ profile, setProfile }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-2 px-2">
         <div className="w-12 h-12 bg-royalHigh rounded-2xl flex items-center justify-center text-white shadow-lg shadow-royalHigh/20">
           <Calendar size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-[900] text-royalHigh tracking-tight">試験目標設定</h2>
            <p className="text-[10px] font-black text-grapeBottle/40 uppercase tracking-widest">Configuration</p>
         </div>
      </div>

      <div className="bg-white p-7 sm:p-8 rounded-[48px] border border-amurLilac shadow-sm space-y-8 overflow-hidden">
        <div className="relative">
          <label className="text-[10px] font-black text-grapeBottle/60 uppercase tracking-[0.2em] block mb-3 px-1">
            試験日 (Exam Date)
          </label>
          {/* 使用相對容器確保輸入框不超出界線 */}
          <div className="relative w-full overflow-hidden rounded-[28px] border border-amurLilac/30 bg-bellOfLove">
            <input 
              type="date"
              className="w-full bg-transparent px-6 py-5 font-black text-lg text-royalHigh outline-none focus:ring-4 focus:ring-buttery/20 transition-all box-border appearance-none"
              style={{ minHeight: '64px' }}
              value={profile.examDate}
              onChange={(e) => setProfile({ ...profile, examDate: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-sunlight p-6 rounded-[32px] flex gap-4 border border-buttery/20">
          <Info size={20} className="text-ochre flex-shrink-0 mt-0.5" />
          <p className="text-[12px] font-bold text-royalHigh/70 leading-relaxed">
            この日付を変更すると、ダッシュボードのカウントダウンと学習プランのマイルストーンが自動的に再計算されます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-bellOfLove/30 rounded-[32px] border border-amurLilac/30">
              <p className="text-[9px] font-black text-grapeBottle/40 uppercase tracking-widest mb-1">目標スコア</p>
              <input 
                type="number" 
                className="bg-transparent font-black text-2xl text-royalHigh outline-none w-full"
                value={profile.targetScore}
                onChange={e => setProfile({...profile, targetScore: parseInt(e.target.value) || 0})}
              />
           </div>
           <div className="p-6 bg-sunlight/30 rounded-[32px] border border-buttery/20">
              <p className="text-[9px] font-black text-ochre uppercase tracking-widest mb-1">目標問題數</p>
              <input 
                type="number" 
                className="bg-transparent font-black text-2xl text-royalHigh outline-none w-full"
                value={profile.mbeGoal}
                onChange={e => setProfile({...profile, mbeGoal: parseInt(e.target.value) || 0})}
              />
           </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] font-bold text-grapeBottle/20 uppercase tracking-[0.3em] py-4">
        Resilience & Mastery • 2026
      </p>
    </div>
  );
};

export default ExamSettings;
