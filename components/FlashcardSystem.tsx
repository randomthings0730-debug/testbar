
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { Zap, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface FlashcardSystemProps {
  cards: Flashcard[];
  onRate: (id: string, performance: 'easy' | 'good' | 'again') => void;
}

const FlashcardSystem: React.FC<FlashcardSystemProps> = ({ cards, onRate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const dueCards = cards.filter(c => new Date(c.nextReviewDate) <= new Date());
  const currentCard = dueCards[currentIndex];

  const handleRate = (perf: 'easy' | 'good' | 'again') => {
    onRate(currentCard.id, perf);
    setFlipped(false);
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); 
    }
  };

  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded border border-charcoal/5 card-shadow animate-in fade-in zoom-in duration-700">
        <div className="bg-scholar p-8 rounded-full mb-10 shadow-xl shadow-scholar/10">
          <Check size={48} className="text-charcoal" strokeWidth={3} />
        </div>
        <h3 className="text-3xl font-bold text-charcoal tracking-tight">Mastery Complete</h3>
        <p className="text-charcoal/40 mt-3 font-medium italic">Active recall requirements are fully satisfied for this interval.</p>
        <div className="mt-12 flex gap-6">
           <button className="px-8 py-3 bg-panel border border-charcoal/5 rounded text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Review Metrics</button>
           <button className="px-8 py-3 bg-charcoal text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-charcoal/10">Study Library</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-charcoal/5 pb-6">
        <div>
          <h3 className="text-2xl font-bold text-charcoal tracking-tight">Active Recall Session</h3>
          <p className="text-[10px] font-bold text-scholar uppercase tracking-[0.2em] mt-2">Retention Batch: {currentIndex + 1} / {dueCards.length}</p>
        </div>
        <div className="w-64 bg-panel h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-scholar h-full transition-all duration-700" 
            style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div 
        onClick={() => setFlipped(!flipped)}
        className={`relative h-[500px] w-full perspective cursor-pointer transition-all duration-700 ${flipped ? 'flipped' : ''}`}
      >
        <div className="absolute inset-0 preserve-3d transition-transform duration-1000 w-full h-full">
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border border-charcoal/5 rounded card-shadow p-20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.3em] mb-12 bg-panel px-4 py-1.5 rounded">
              {currentCard.subject}
            </span>
            <p className="text-3xl font-bold text-charcoal leading-tight tracking-tight max-w-lg">
              {currentCard.front}
            </p>
            <div className="mt-16 text-scholar/30 text-[9px] font-bold uppercase tracking-[0.4em] flex items-center gap-4">
              <span className="w-10 h-[1px] bg-charcoal/5"></span>
              Reveal Legal Rule
              <span className="w-10 h-[1px] bg-charcoal/5"></span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-white border border-charcoal/10 rounded card-shadow p-20 flex flex-col items-center justify-center text-center rotate-y-180">
            <span className="bg-scholar text-charcoal px-5 py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] mb-12">
              Rule Statement
            </span>
            <div className="overflow-y-auto max-h-80 scrollbar-hide pr-4">
              <p className="text-2xl leading-relaxed font-medium text-charcoal italic font-serif">
                {currentCard.back}
              </p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-charcoal/20">
              <AlertCircle size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Spaced Repetition Active</span>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="grid grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          <button 
            onClick={(e) => { e.stopPropagation(); handleRate('again'); }}
            className="group flex flex-col items-center gap-4 p-8 bg-white border border-charcoal/5 rounded hover:border-terracotta/20 hover:bg-terracotta/5 transition-all card-shadow"
          >
            <RotateCcw size={20} className="text-charcoal/20 group-hover:text-terracotta transition-colors" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest block">Incomplete</span>
              <span className="text-[8px] font-bold text-terracotta/40 uppercase mt-1 block">Retry &lt; 10m</span>
            </div>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleRate('good'); }}
            className="group flex flex-col items-center gap-4 p-8 bg-white border border-charcoal/5 rounded hover:border-scholar/20 hover:bg-scholar/5 transition-all card-shadow"
          >
            <Check size={20} className="text-charcoal/20 group-hover:text-scholar transition-colors" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest block">Retained</span>
              <span className="text-[8px] font-bold text-scholar/40 uppercase mt-1 block">Consolidate 24h</span>
            </div>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
            className="group flex flex-col items-center gap-4 p-8 bg-white border border-charcoal/5 rounded hover:border-sage/20 hover:bg-sage/5 transition-all card-shadow"
          >
            <Sparkles size={20} className="text-charcoal/20 group-hover:text-sage transition-colors" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest block">Mastery</span>
              <span className="text-[8px] font-bold text-sage/40 uppercase mt-1 block">Archive 4d</span>
            </div>
          </button>
        </div>
      )}

      <style>{`
        .perspective { perspective: 2500px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .flipped .absolute.inset-0.preserve-3d { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardSystem;
