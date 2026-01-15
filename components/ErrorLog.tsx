
import React, { useState } from 'react';
import { Subject, ErrorEntry } from '../types';
import { Search, Plus, Brain, FileText, Archive, X, Trash2, PlusCircle, Zap } from 'lucide-react';
import { getStudyInsights } from '../services/geminiService';

interface ErrorLogProps {
  errors: ErrorEntry[];
  onAddError: (entry: ErrorEntry) => void;
  onDeleteError: (id: string) => void;
}

const ErrorLog: React.FC<ErrorLogProps> = ({ errors, onAddError, onDeleteError }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const filteredErrors = errors.filter(e => {
    const matchesSearch = e.subtopic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.rule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || e.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    const insights = await getStudyInsights(errors);
    setAiInsights(insights);
    setLoadingAI(false);
  };

  const [newError, setNewError] = useState({
    subject: Subject.TORTS,
    subtopic: '',
    source: '',
    reason: '',
    rule: '',
    keyFacts: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddError({
      id: `e-${Date.now()}`,
      ...newError,
      createdAt: new Date().toISOString()
    });
    setIsAdding(false);
    setNewError({
      subject: Subject.TORTS,
      subtopic: '',
      source: '',
      reason: '',
      rule: '',
      keyFacts: ''
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20" size={16} />
          <input 
            type="text" 
            placeholder="Search rules or topics..." 
            className="pl-12 pr-6 py-4 w-full border-2 border-softGray rounded-2xl bg-white focus:border-brand/30 focus:ring-0 outline-none transition-all font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="border-2 border-softGray bg-white rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest outline-none shadow-sm focus:border-brand/30"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-brand text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.05] transition-all"
          >
            <PlusCircle size={18} /> New Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          {filteredErrors.length === 0 ? (
            <div className="bg-white rounded-planifly border-2 border-softGray border-dashed py-32 text-center flex flex-col items-center">
              <Archive className="text-muted/20 mb-6" size={64} />
              <p className="text-[12px] font-black text-muted uppercase tracking-[0.3em]">No Rules Found</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-6 text-brand font-bold text-sm hover:underline"
              >
                Log your first missed rule
              </button>
            </div>
          ) : (
            filteredErrors.map(error => (
              <div key={error.id} className="soft-card overflow-hidden group border-2 border-transparent hover:border-brand/10 transition-all">
                <div className="px-8 py-5 border-b border-softGray flex justify-between items-center bg-lavender/10">
                  <div className="flex items-center gap-4">
                    <span className="bg-brand/10 text-brand text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-brand/20">
                      {error.subject}
                    </span>
                    <h4 className="font-bold text-charcoal text-lg tracking-tight">{error.subtopic}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{error.source}</span>
                    <button 
                      onClick={() => onDeleteError(error.id)}
                      className="p-2 text-muted/30 hover:text-red-500 transition-colors bg-softGray rounded-full"
                      title="Remove Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-10 space-y-10">
                  <div>
                    <label className="text-[10px] font-black text-brand uppercase tracking-[0.2em] block mb-4 flex items-center gap-2">
                      <FileText size={14} className="text-brand" /> Black Letter Law
                    </label>
                    <div className="bg-lavender/20 p-8 rounded-3xl border border-brand/5 shadow-inner">
                      <p className="text-charcoal text-xl leading-relaxed font-bold font-serif italic">
                        "{error.rule}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-3">Distinguishing Facts</label>
                      <div className="bg-softGray/50 p-6 rounded-2xl text-charcoal/70 text-sm italic leading-relaxed">
                        {error.keyFacts || 'No specific facts recorded.'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-3">Cognitive Trap</label>
                      <div className="bg-red-50 p-6 rounded-2xl text-red-700 text-sm font-bold leading-relaxed border border-red-100">
                        {error.reason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-charcoal rounded-planifly p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand p-3 rounded-2xl shadow-lg shadow-brand/20">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl">Strategy AI</h3>
                  <p className="text-[10px] text-brand font-black uppercase tracking-widest">Synthesis Engine</p>
                </div>
              </div>
              
              {aiInsights ? (
                <div className="text-sm text-white/70 space-y-6 leading-relaxed">
                  {aiInsights.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-brand font-bold">•</span>
                      <p>{line.replace(/^[•\-\d\.]+\s?/, '')}</p>
                    </div>
                  ))}
                  <button 
                    onClick={handleGenerateAI}
                    className="w-full mt-10 bg-white/5 hover:bg-white/10 text-brand py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    Refresh Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-xs text-white/50 leading-relaxed italic">
                    "Analyzing your missed rules identifies systemic gaps in your understanding of legal standards."
                  </p>
                  <button 
                    onClick={handleGenerateAI}
                    disabled={loadingAI}
                    className="w-full bg-brand text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand/20 disabled:opacity-50"
                  >
                    {loadingAI ? 'Synthesizing...' : 'Start Analysis'}
                  </button>
                </div>
              )}
            </div>
            <Zap size={120} className="absolute -bottom-10 -right-10 text-white opacity-[0.03]" />
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-planifly w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-softGray flex justify-between items-center bg-lavender/10">
              <h3 className="text-2xl font-black text-charcoal tracking-tight">New Rule Entry</h3>
              <button onClick={() => setIsAdding(false)} className="text-muted hover:text-charcoal bg-softGray p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Subject</label>
                  <select 
                    className="w-full border-2 border-softGray rounded-2xl p-4 text-sm font-bold focus:border-brand/30 outline-none bg-softGray/30"
                    value={newError.subject}
                    onChange={e => setNewError({...newError, subject: e.target.value as Subject})}
                  >
                    {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Topic</label>
                  <input 
                    type="text" required
                    className="w-full border-2 border-softGray rounded-2xl p-4 text-sm font-bold focus:border-brand/30 outline-none"
                    placeholder="e.g. Diversity SMJ"
                    value={newError.subtopic}
                    onChange={e => setNewError({...newError, subtopic: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Black Letter Rule</label>
                <textarea 
                  required className="w-full border-2 border-softGray rounded-2xl p-6 h-32 text-sm font-bold focus:border-brand/30 outline-none resize-none bg-lavender/5"
                  placeholder="State the definitive legal rule..."
                  value={newError.rule}
                  onChange={e => setNewError({...newError, rule: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Trap/Reason</label>
                  <input 
                    type="text" required
                    className="w-full border-2 border-softGray rounded-2xl p-4 text-sm font-bold focus:border-brand/30 outline-none"
                    placeholder="Why did you miss it?"
                    value={newError.reason}
                    onChange={e => setNewError({...newError, reason: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Source</label>
                  <input 
                    type="text"
                    className="w-full border-2 border-softGray rounded-2xl p-4 text-sm font-bold focus:border-brand/30 outline-none"
                    placeholder="e.g. AdaptiBar 421"
                    value={newError.source}
                    onChange={e => setNewError({...newError, source: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.01] transition-all">
                Commit to Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorLog;