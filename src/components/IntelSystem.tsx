// src/components/IntelSystem.tsx
import React from 'react';
import { ListChecks, TrendingUp } from 'lucide-react';

interface IntelSystemProps {
  pool: { ratchets: string[]; bits: string[]; assists: string[] };
  wishlist: { ratchet: string[]; bit: string[]; assist: string[] };
  setWishlist: React.Dispatch<React.SetStateAction<any>>;
  recommendations: any[];
  lang: string;
  theme: string;
  ui: any;
  getDisplayName: (p: any, l: string) => string;
  onProductClick: (p: any) => void;
}

const IntelSystem: React.FC<IntelSystemProps> = ({ 
  pool, wishlist, setWishlist, recommendations, lang, theme, ui, getDisplayName, onProductClick 
}) => {
  const isLight = theme === 'light';

  const toggleWishlist = (type: string, val: string) => {
    setWishlist((prev: any) => ({
      ...prev,
      [type]: prev[type].includes(val) 
        ? prev[type].filter((x: string) => x !== val) 
        : [...prev[type], val]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* 左側：零件選擇池 */}
      <div className="lg:col-span-5 space-y-6">
        <div className={`p-6 border-2 ${isLight ? 'bg-gray-50 border-black' : 'bg-black border-cyan-900/50'}`}>
          <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-900/30 pb-3">
            <h4 className="font-black text-lg flex items-center gap-2 text-cyan-500">
              <ListChecks size={20}/> {ui.INTEL}
            </h4>
            <button 
              onClick={() => setWishlist({ ratchet: [], bit: [], assist: [] })}
              className="text-[10px] font-black text-red-500 border border-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all"
            >
              RESET
            </button>
          </div>
          
          <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-2 no-scrollbar">
            {[
              { id: 'ratchet', label: ui.R_POOL, data: pool.ratchets },
              { id: 'bit', label: ui.B_POOL, data: pool.bits },
              { id: 'assist', label: ui.A_POOL, data: pool.assists }
            ].map(sec => (
              <div key={sec.id}>
                <p className="text-[10px] font-black opacity-40 mb-3 uppercase tracking-widest">{sec.label}</p>
                <div className="flex flex-wrap gap-2">
                  {sec.data.map((val) => (
                    <button 
                      key={val} 
                      onClick={() => toggleWishlist(sec.id, val)}
                      className={`text-xs px-3 py-1.5 border-2 font-black transition-all ${
                        wishlist[sec.id].includes(val) 
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-glow scale-105' 
                          : 'border-gray-800 text-gray-500 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右側：推薦結果 */}
      <div className="lg:col-span-7 space-y-4">
        <h4 className="font-black text-lg italic text-cyan-400 border-b-2 border-cyan-900/50 pb-2 flex justify-between">
          <span>{ui.OPTIMAL}</span>
          <span className="text-sm opacity-40 font-mono">{recommendations.length} MATCHES</span>
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {recommendations.length > 0 ? recommendations.map((p) => (
            <div 
              key={p.model} 
              onClick={() => onProductClick(p)} 
              className={`group p-4 border-2 flex justify-between items-center cursor-pointer transition-all ${
                isLight ? 'bg-white border-black' : 'bg-cyan-950/10 border-cyan-900/50 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-xl font-black italic px-3 py-1 ${p.score >= 2 ? 'bg-cyan-600 text-white shadow-glow' : 'bg-gray-800 text-gray-400'}`}>
                  {p.score}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-black opacity-50">{p.model}</div>
                  <div className="text-md font-black uppercase">{getDisplayName(p, lang)}</div>
                  <div className="flex gap-2 mt-1">
                    {p.matched.map((m: string) => (
                      <span key={m} className="text-[9px] bg-cyan-600/20 text-cyan-400 px-1 font-black border border-cyan-400/30">
                        MATCH:{m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-xl font-black italic text-cyan-500 group-hover:scale-110 transition-transform">
                ¥{p.price || '---'}
              </div>
            </div>
          )) : (
            <div className="py-20 border-2 border-dashed border-gray-800 rounded-xl text-center opacity-30 italic text-sm">
              PLEASE SELECT TARGET COMPONENTS FROM THE LEFT POOL
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelSystem;