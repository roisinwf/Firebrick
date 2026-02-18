
import React, { useState, useEffect } from 'react';
import Character from './components/Character';
import { ActivityLog, AnalysisResult, Outfit, AVAILABLE_OUTFITS, UserStats, Achievement } from './types';
import { analyzeAIUsage } from './services/geminiService';

const MedalIcon: React.FC<{ level: 'none' | 'bronze' | 'silver' | 'gold', size?: string }> = ({ level, size = "w-16 h-16" }) => {
  const colors = {
    none: 'grayscale opacity-30',
    bronze: 'drop-shadow-[0_4px_8px_rgba(205,127,50,0.5)]',
    silver: 'drop-shadow-[0_4px_8px_rgba(192,192,192,0.5)]',
    gold: 'drop-shadow-[0_4px_8px_rgba(255,215,0,0.5)]'
  };

  const fill = {
    none: '#d1d5db',
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700'
  };

  return (
    <div className={`relative ${size} flex items-center justify-center transition-all duration-500`}>
      <svg viewBox="0 0 100 100" className={colors[level]}>
        <circle cx="50" cy="50" r="40" fill={fill[level]} stroke="white" strokeWidth="4" />
        <path d="M50 25 L55 40 L75 40 L60 50 L65 70 L50 60 L35 70 L40 50 L25 40 L45 40 Z" fill="white" fillOpacity="0.8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={fill[level]} strokeWidth="2" strokeDasharray="4 2" />
      </svg>
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const getLevel = () => {
    if (achievement.currentValue >= achievement.gold) return 'gold';
    if (achievement.currentValue >= achievement.silver) return 'silver';
    if (achievement.currentValue >= achievement.bronze) return 'bronze';
    return 'none';
  };

  const getNextGoal = () => {
    if (achievement.currentValue < achievement.bronze) return achievement.bronze;
    if (achievement.currentValue < achievement.silver) return achievement.silver;
    if (achievement.currentValue < achievement.gold) return achievement.gold;
    return achievement.gold;
  };

  const level = getLevel();
  const nextGoal = getNextGoal();
  const progress = Math.min(100, (achievement.currentValue / nextGoal) * 100);

  return (
    <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-4 mb-3">
      <MedalIcon level={level} />
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm leading-tight">{achievement.title}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{achievement.description}</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${level === 'gold' ? 'bg-yellow-400' : level === 'silver' ? 'bg-gray-300' : level === 'bronze' ? 'bg-orange-400' : 'bg-blue-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-bold text-gray-400">{achievement.currentValue} {level === 'gold' ? 'MAX' : ''}</span>
          <span className="text-[10px] font-bold text-gray-400">Target: {nextGoal}</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'store' | 'stats' | 'medals'>('home');
  const [health, setHealth] = useState<number>(80);
  const [coins, setCoins] = useState<number>(0);
  const [ownedOutfits, setOwnedOutfits] = useState<string[]>([]);
  const [activeOutfitId, setActiveOutfitId] = useState<string | null>(null);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<UserStats>({
    parasocialCount: 0,
    learningCount: 0,
    collaborativeCount: 0,
    quizCount: 0
  });
  
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputResponse, setInputResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>("Paste your last session below!");
  const [dayRewardClaimed, setDayRewardClaimed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('starfish_buddy_v3');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setHealth(data.health ?? 80);
        setCoins(data.coins ?? 0);
        setOwnedOutfits(data.ownedOutfits ?? []);
        setActiveOutfitId(data.activeOutfitId ?? null);
        setHistory(data.history ?? []);
        setStats(data.stats ?? { parasocialCount: 0, learningCount: 0, collaborativeCount: 0, quizCount: 0 });
        setDayRewardClaimed(data.dayRewardClaimed ?? false);
      } catch (e) { console.error("Restore state failed", e); }
    }
  }, []);

  useEffect(() => {
    const state = { health, coins, ownedOutfits, activeOutfitId, history, stats, dayRewardClaimed };
    localStorage.setItem('starfish_buddy_v3', JSON.stringify(state));
  }, [health, coins, ownedOutfits, activeOutfitId, history, stats, dayRewardClaimed]);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setFeedback("Auditing session...");

    const result = await analyzeAIUsage(inputPrompt, inputResponse);
    
    const newEntry: ActivityLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      prompt: inputPrompt,
      response: inputResponse,
      score: result.score,
      feedback: result.feedback,
      category: result.category,
      isQuiz: result.isQuiz
    };

    setHistory(prev => [newEntry, ...prev]);
    setHealth(prev => Math.min(100, Math.max(0, prev + result.score)));
    
    setStats(prev => ({
      ...prev,
      learningCount: result.category === 'learning' ? prev.learningCount + 1 : prev.learningCount,
      collaborativeCount: result.category === 'collaborative' ? prev.collaborativeCount + 1 : prev.collaborativeCount,
      parasocialCount: result.category === 'parasocial' ? prev.parasocialCount + 1 : prev.parasocialCount,
      quizCount: result.isQuiz ? prev.quizCount + 1 : prev.quizCount
    }));

    setFeedback(result.feedback);
    setInputPrompt('');
    setInputResponse('');
    setIsAnalyzing(false);
    setActiveTab('home');
  };

  const claimDailyReward = () => {
    if (dayRewardClaimed) return;
    let reward = health >= 90 ? 2 : (health >= 75 ? 1 : 0);
    if (reward > 0) {
      setCoins(prev => prev + reward);
      setFeedback(`Great session! Earned ${reward} coin${reward > 1 ? 's' : ''}.`);
    } else {
      setFeedback("No reward this time. Aim for 75%+ health!");
    }
    setDayRewardClaimed(true);
  };

  const resetDay = () => {
    setDayRewardClaimed(false);
    setFeedback("New session started! Keep it clean.");
  };

  const achievements: Achievement[] = [
    { id: 'quizmaster', title: 'Quiz-master', description: 'Complete quiz and practice sessions', bronze: 10, silver: 25, gold: 50, currentValue: stats.quizCount },
    { id: 'scholar', title: 'Grand Scholar', description: 'Focus on learning and deep questions', bronze: 20, silver: 50, gold: 100, currentValue: stats.learningCount },
    { id: 'architect', title: 'The Architect', description: 'Co-plan and collaborate with AI', bronze: 15, silver: 40, gold: 80, currentValue: stats.collaborativeCount },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">VITALITY</span>
          <div className="w-24 h-2.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${health > 50 ? 'bg-[#58cc02]' : (health > 20 ? 'bg-[#ffc800]' : 'bg-[#ff4b4b]')}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
             <span className="text-sm">🪙</span>
             <span className="font-bold text-yellow-700 text-sm">{coins}</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {activeTab === 'home' && (
          <div className="flex flex-col pb-24">
            <Character health={health} activeOutfitId={activeOutfitId} />
            
            <div className="px-6 mb-4">
              <div className="bg-gray-50 p-4 rounded-2xl relative border-2 border-gray-100">
                <div className="absolute -top-2 left-10 w-4 h-4 bg-gray-50 border-t-2 border-l-2 border-gray-100 transform rotate-45"></div>
                <p className="text-gray-600 text-center italic font-medium">"{feedback}"</p>
              </div>
            </div>

            {/* Restored 3-column Toll Counter (Removed Quiz) */}
            <div className="px-6 grid grid-cols-3 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center shadow-sm">
                <div className="text-blue-600 font-bold text-xl">{stats.learningCount}</div>
                <div className="text-[8px] font-bold text-blue-400 uppercase tracking-wider">Learning</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center shadow-sm">
                <div className="text-purple-600 font-bold text-xl">{stats.collaborativeCount}</div>
                <div className="text-[8px] font-bold text-purple-400 uppercase tracking-wider">Collab</div>
              </div>
              <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100 text-center shadow-sm">
                <div className="text-pink-600 font-bold text-xl">{stats.parasocialCount}</div>
                <div className="text-[8px] font-bold text-pink-400 uppercase tracking-wider">Parasocial</div>
              </div>
            </div>

            {/* Prominent End Day / Session Button */}
            <div className="px-6 flex flex-col gap-3 mb-6">
              {!dayRewardClaimed ? (
                <button 
                  onClick={claimDailyReward}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                  <span>🌙</span> End Day & Claim Rewards
                </button>
              ) : (
                <button 
                  onClick={resetDay}
                  className="w-full py-4 bg-white border-2 border-gray-100 text-gray-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-base"
                >
                  <span>☀️</span> Start New Session
                </button>
              )}
              
              <button 
                onClick={() => setActiveTab('medals')} 
                className="w-full py-3 bg-white border-2 border-[#B22222] text-[#B22222] font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                <span>🏆</span> View My Medals
              </button>
            </div>
          </div>
        )}

        {activeTab === 'medals' && (
          <div className="p-6 pb-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span> Achievements
            </h2>
            <div className="space-y-4">
              {achievements.map(ach => (
                <AchievementCard key={ach.id} achievement={ach} />
              ))}
            </div>
            <p className="mt-6 text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
              Quiz interactions still count toward your medals!
            </p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6 pb-24">
            <h2 className="text-xl font-bold mb-4">Activity Log</h2>
            <div className="space-y-4">
              {history.length === 0 ? <p className="text-gray-400 italic">No activity yet. Sync your first prompt!</p> : history.map(item => (
                <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1 items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.category === 'learning' ? 'bg-green-100 text-green-700' :
                        item.category === 'collaborative' ? 'bg-blue-100 text-blue-700' :
                        item.category === 'parasocial' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.category}
                      </span>
                      {item.isQuiz && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">QUIZ</span>}
                    </div>
                    <span className={`font-bold text-xs ${item.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.score > 0 ? `+${item.score}` : item.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-1 mb-1 font-bold italic">"{item.prompt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="p-6 pb-24">
            <h2 className="text-xl font-bold mb-4">Store</h2>
            <div className="grid grid-cols-2 gap-4">
              {AVAILABLE_OUTFITS.map(outfit => {
                const isOwned = ownedOutfits.includes(outfit.id);
                const isActive = activeOutfitId === outfit.id;
                return (
                  <div key={outfit.id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isActive ? 'border-[#B22222] bg-red-50' : 'border-gray-50'}`}>
                    <span className="text-3xl mb-1">{outfit.id === 'sunglasses' ? '🕶️' : outfit.id === 'partyhat' ? '🥳' : outfit.id === 'bowtie' ? '🎀' : outfit.id === 'crown' ? '👑' : '🧐'}</span>
                    <span className="text-xs font-bold text-center">{outfit.name}</span>
                    {isOwned ? (
                      <button onClick={() => setActiveOutfitId(isActive ? null : outfit.id)} className={`w-full py-2 rounded-xl text-xs font-bold ${isActive ? 'bg-[#B22222] text-white' : 'bg-gray-100'}`}>
                        {isActive ? 'UNEQUIP' : 'WEAR'}
                      </button>
                    ) : (
                      <button onClick={() => { if(coins >= outfit.price) { setCoins(c => c - outfit.price); setOwnedOutfits(o => [...o, outfit.id]); } }} disabled={coins < outfit.price} className={`w-full py-2 rounded-xl text-xs font-bold ${coins >= outfit.price ? 'bg-yellow-400 text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}>
                        🪙 {outfit.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav & Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="px-4 py-3">
          <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
            <input 
              className="w-full bg-transparent border-none text-xs p-2 focus:ring-0" 
              placeholder="Paste AI Prompt..." 
              value={inputPrompt} 
              onChange={e => setInputPrompt(e.target.value)}
            />
            <hr className="border-gray-200" />
            <div className="flex items-center gap-2 pt-1">
              <input 
                className="flex-1 bg-transparent border-none text-xs p-2 focus:ring-0" 
                placeholder="Paste AI Response..." 
                value={inputResponse} 
                onChange={e => setInputResponse(e.target.value)}
              />
              <button 
                onClick={handleLogActivity}
                disabled={isAnalyzing || !inputPrompt.trim()}
                className="bg-[#B22222] text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? '...' : 'SYNC'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-gray-50 h-16">
          <button onClick={() => setActiveTab('home')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[#B22222]' : 'text-gray-300 hover:text-gray-500'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold">HOME</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'stats' ? 'text-[#B22222]' : 'text-gray-300 hover:text-gray-500'}`}>
            <span className="text-xl">📊</span>
            <span className="text-[10px] font-bold">LOGS</span>
          </button>
          <button onClick={() => setActiveTab('medals')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'medals' ? 'text-[#B22222]' : 'text-gray-300 hover:text-gray-500'}`}>
            <span className="text-xl">🏆</span>
            <span className="text-[10px] font-bold">MEDALS</span>
          </button>
          <button onClick={() => setActiveTab('store')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'store' ? 'text-[#B22222]' : 'text-gray-300 hover:text-gray-500'}`}>
            <span className="text-xl">🛒</span>
            <span className="text-[10px] font-bold">STORE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
