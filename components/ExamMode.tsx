
import React, { useState, useEffect, useMemo } from 'react';
import { Question, ExamResult } from '../types';
import { SAMPLE_QUESTIONS } from '../constants';
import { Clock, Trophy, Activity, ChevronRight, Star } from 'lucide-react';

const ExamMode: React.FC = () => {
  const [setupMode, setSetupMode] = useState(true);
  const [config, setConfig] = useState({ questionCount: 25, timeLimitMinutes: 45 });
  const [examStarted, setExamStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const sessionQuestions = useMemo(() => {
    const pool = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    return pool.slice(0, Math.min(pool.length, config.questionCount));
  }, [config.questionCount, examStarted]);

  useEffect(() => {
    let interval: any;
    if (examStarted && !completed && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && examStarted && !completed) {
      finishExam();
    }
    return () => clearInterval(interval);
  }, [examStarted, completed, timeLeft]);

  const startExam = () => {
    setStartTime(Date.now());
    setExamStarted(true);
    setSetupMode(false);
    setCompleted(false);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeLeft(config.timeLimitMinutes * 60);
  };

  const finishExam = () => {
    setEndTime(Date.now());
    setCompleted(true);
  };

  const stopExam = () => {
    if (confirm("Stop this session and return to setup? No data will be saved.")) {
      setExamStarted(false);
      setSetupMode(true);
      setCompleted(false);
      setCurrentIdx(0);
      setUserAnswers({});
      setTimeLeft(0);
      setStartTime(0);
      setEndTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const results = useMemo((): ExamResult | null => {
    if (!completed) return null;
    let correct = 0;
    sessionQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    const duration = Math.floor((endTime - startTime) / 1000);
    const accuracy = (correct / sessionQuestions.length) * 100;
    const scaledScore = Math.min(200, Math.round((accuracy / 100 * 200) + 12.5));
    return {
      totalQuestions: sessionQuestions.length,
      correctAnswers: correct,
      timeTakenSeconds: duration,
      accuracy,
      scaledScore
    };
  }, [completed, userAnswers, sessionQuestions, startTime, endTime]);

  if (setupMode) {
    return (
      <div className="max-w-2xl mx-auto bubbly-card p-12 text-center bg-white animate-fade-in-up">
        <div className="bg-brand/10 p-10 rounded-[48px] inline-block mb-10 border-4 border-brand/20">
          <Activity size={80} className="text-brand" />
        </div>
        <h2 className="text-5xl font-black text-charcoal mb-4">MBE Arena</h2>
        <p className="text-charcoal/40 font-black mb-12 italic text-lg">Timed training for peak performance!</p>
        
        <div className="space-y-12 text-left mb-12">
          <div>
            <div className="flex justify-between items-center mb-6">
              <label className="text-[11px] font-black uppercase text-charcoal/30 tracking-widest">Question Count</label>
              <span className="bg-charcoal text-white px-5 py-2 rounded-2xl font-black text-sm">{config.questionCount} Qs</span>
            </div>
            <input 
              type="range" min="5" max="100" step="5"
              className="w-full accent-brand h-3 bg-softGray rounded-full appearance-none cursor-pointer"
              value={config.questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setConfig({ ...config, questionCount: val, timeLimitMinutes: Math.round(val * 1.8) });
              }}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <label className="text-[11px] font-black uppercase text-charcoal/30 tracking-widest">Time Budget (Min)</label>
              <span className="bg-charcoal text-white px-5 py-2 rounded-2xl font-black text-sm">{config.timeLimitMinutes}m</span>
            </div>
            <input 
              type="range" min="5" max="200" step="5"
              className="w-full accent-brand h-3 bg-softGray rounded-full appearance-none cursor-pointer"
              value={config.timeLimitMinutes}
              onChange={(e) => setConfig({ ...config, timeLimitMinutes: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <button onClick={startExam} className="w-full bg-brand text-white py-8 rounded-[40px] font-black uppercase tracking-[0.2em] text-lg bubbly-button border-b-8 border-blue-600 shadow-2xl shadow-brand/20">
          Enter Arena
        </button>
      </div>
    );
  }

  if (completed && results) {
    return (
      <div className="max-w-3xl mx-auto bubbly-card p-12 bg-white animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="bg-sunny p-8 rounded-full inline-block border-8 border-white shadow-2xl mb-8 scale-110">
            <Trophy className="text-charcoal" size={64} fill="currentColor" />
          </div>
          <h2 className="text-5xl font-black text-charcoal">Victory!</h2>
          <p className="text-charcoal/30 font-black mt-2 uppercase tracking-widest">Training complete</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="bg-charcoal p-12 rounded-[48px] text-white text-center border-b-8 border-black shadow-2xl">
            <p className="text-[11px] font-black uppercase opacity-60 mb-2 tracking-[0.3em]">Projected Scaled Score</p>
            <p className="text-8xl font-black text-sunny">{results.scaledScore}</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-10 bg-mint/20 rounded-[40px] border-4 border-mint text-center">
              <p className="text-[11px] font-black uppercase text-mint-700 tracking-widest mb-1">Accuracy</p>
              <p className="text-5xl font-black text-charcoal">{Math.round(results.accuracy)}%</p>
            </div>
            <div className="p-10 bg-coral/10 rounded-[40px] border-4 border-coral text-center">
              <p className="text-[11px] font-black uppercase text-coral tracking-widest mb-1">Raw Success</p>
              <p className="text-5xl font-black text-charcoal">{results.correctAnswers}/{results.totalQuestions}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setSetupMode(true)} className="w-full bg-brand text-white py-7 rounded-[32px] font-black uppercase tracking-widest text-lg bubbly-button border-b-8 border-blue-600">
          Finish Quest
        </button>
      </div>
    );
  }

  const q = sessionQuestions[currentIdx];
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border-4 border-softGray sticky top-4 z-50 shadow-2xl">
        <div className="flex items-center gap-6 bg-charcoal text-white px-8 py-4 rounded-[28px] shadow-xl">
          <Clock size={24} className="text-sunny" strokeWidth={3} />
          <span className="text-4xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="text-[12px] font-black uppercase text-charcoal/20 tracking-widest">Progress: {currentIdx + 1}/{sessionQuestions.length}</div>
           <button 
             onClick={stopExam}
             className="px-8 py-4 bg-red-50 text-red-500 rounded-[24px] hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest border-2 border-red-100"
           >
             End Quest
           </button>
        </div>
      </div>

      <div className="bubbly-card p-14 bg-white space-y-12">
        <div className="bg-softGray/30 p-10 rounded-[40px] italic text-2xl font-black text-charcoal/60 leading-relaxed border-4 border-softGray relative">
           <div className="absolute -top-6 -left-6 bg-brand text-white p-3 rounded-2xl border-4 border-white shadow-xl"><Star size={24} fill="white" /></div>
           {q.factPattern}
        </div>
        
        <h3 className="text-4xl font-black text-charcoal tracking-tight leading-snug">{q.questionText}</h3>
        
        <div className="grid grid-cols-1 gap-6">
          {q.options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => setUserAnswers({...userAnswers, [q.id]: opt})} 
              className={`w-full text-left p-8 rounded-[36px] border-4 transition-all flex items-center gap-8 group 
                ${userAnswers[q.id] === opt 
                  ? 'bg-brand/10 border-brand shadow-xl scale-[1.01]' 
                  : 'bg-white border-softGray hover:border-brand/30'}`}
            >
              <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black text-2xl transition-all
                ${userAnswers[q.id] === opt ? 'bg-brand text-white' : 'bg-softGray text-charcoal/20 group-hover:bg-brand/10'}`}>
                {String.fromCharCode(65+i)}
              </div>
              <span className="font-black text-xl text-charcoal">{opt}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-12 pt-10 border-t-8 border-softGray">
          <button 
            disabled={currentIdx === 0} 
            onClick={() => setCurrentIdx(prev => prev - 1)} 
            className="px-10 py-5 text-charcoal/20 font-black uppercase tracking-widest disabled:opacity-0 hover:text-charcoal"
          >
            Go Back
          </button>
          <button 
            onClick={() => currentIdx === sessionQuestions.length - 1 ? finishExam() : setCurrentIdx(prev => prev + 1)} 
            className="bg-charcoal text-white px-16 py-6 rounded-[32px] font-black uppercase tracking-widest flex items-center gap-4 bubbly-button border-b-8 border-black text-lg"
          >
            {currentIdx === sessionQuestions.length - 1 ? 'Finish Challenge' : 'Next Question'} <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamMode;
