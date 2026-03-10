import React, { useState, useMemo } from 'react';
import { ListChecks, TrendingUp } from 'lucide-react';

interface IntelSystemProps {
  products: any[];
  lang: string;
  theme: string;
  ui: any; 
  getDisplayName: (p: any, l: string) => string;
  onProductClick: (p: any) => void;
}

const IntelSystem: React.FC<IntelSystemProps> = ({ 
  products = [], 
  lang, 
  theme, 
  ui, 
  getDisplayName, 
  onProductClick 
}) => {
  const isLight = theme === 'light';
  const strings = ui || {}; // Safety fallback

  // State for selected parts
  const [wishlist, setWishlist] = useState<{ratchet: string[], bit: string[], assist: string[]}>({ 
    ratchet: [], bit: [], assist: [] 
  });

  // 1. Generate Parts Pool from Master Data
  const pool = useMemo(() => {
    const r = new Set<string>(); 
    const b = new Set<string>(); 
    const a = new Set<string>();
    
    products.forEach((p: any) => { 
      if (p.ratchet) r.add(p.ratchet); 
      if (p.bit_code) b.add(p.bit_code); 
      // Only add to assist pool if the code exists and isn't empty
      if (p.assist_blade_code && p.assist_blade_code.trim() !== "") {
        a.add(p.assist_blade_code);
      }
    });

    return {
      ratchets: Array.from(r).sort((x, y) => x.localeCompare(y, undefined, { numeric: true })),
      bits: Array.from(b).sort(),
      assists: Array.from(a).sort()
    };
  }, [products]);

  // 2. Matching Logic
  const recommendations = useMemo(() => {
    // If nothing is selected, show nothing
    if (wishlist.ratchet.length === 0 && wishlist.bit.length === 0 && wishlist.assist.length === 0) {
      return [];
    }

    return products.map((p: any) => {
      let score = 0;
      const matched: string[] = [];

      if (wishlist.ratchet.includes(p.ratchet)) { 
        score++; 
        matched.push(p.ratchet); 
      }
      if (wishlist.bit.includes(p.bit_code)) { 
        score++; 
        matched.push(p.bit_code); 
      }
      // Accurate matching for Assist Blades
      if (p.assist_blade_code && wishlist.assist.includes(p.assist_blade_code)) { 
        score++; 
        matched.push(p.assist_blade_code); 
      }

      return { ...p, score, matched };
    })
    .filter((p: any) => p.score > 0)
    .sort((a: any, b: any) => b.score - a.score || a.model.localeCompare(b.model));
  }, [products, wishlist]);

  const toggleWishlist = (type: 'ratchet' | 'bit' | 'assist', val: string) => {
    setWishlist((prev) => ({
      ...prev,
      [type]: prev[type].includes(val) 
        ? prev[type].filter((x) => x !== val) 
        : [...prev[type], val]
    }));
  };

  const btnStyle = (active: boolean) => `px-2 py-1.5 text-[10px] font-black border-2 transition-all ${
    active 
      ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow' 
      : 'opacity-50 border-gray-500 hover:opacity-100 hover:border-gray-400'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Left Column: Selection Interface */}
      <div className={`lg:col-span-5 p-6 border-4 ${isLight ? 'bg-white border-black text-black' : 'bg-[#050505] border-cyan-900/50 text-white'}`}>
        <div className="flex justify-between items-center mb-8 border-b-2 border-current pb-4 opacity-50">
          <div className="flex items-center gap-2">
            <ListChecks size={20} />
            <h4 className="font-black text-lg italic uppercase">{strings.INTEL || 'INTEL'}</h4>
          </div>
          <button 
            onClick={() => setWishlist({ratchet:[], bit:[], assist:[]})} 
            className="text-[10px] font-black text-red-500 border border-red-500 px-2 py-1 hover:bg-red-500 hover:text-white transition-all"
          >
            RESET
          </button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
          {/* Ratchet Pool */}
          <div>
            <p className="text-[10px] font-black opacity-40 mb-3 uppercase tracking-[0.2em]">{strings.R_POOL || 'RATCHET'}</p>
            <div className="flex flex-wrap gap-2">
              {pool.ratchets.map(val => (
                <button key={val} onClick={() => toggleWishlist('ratchet', val)} className={btnStyle(wishlist.ratchet.includes(val))}>{val}</button>
              ))}
            </div>
          </div>

          {/* Bit Pool */}
          <div>
            <p className="text-[10px] font-black opacity-40 mb-3 uppercase tracking-[0.2em]">{strings.B_POOL || 'BIT'}</p>
            <div className="flex flex-wrap gap-2">
              {pool.bits.map(val => (
                <button key={val} onClick={() => toggleWishlist('bit', val)} className={btnStyle(wishlist.bit.includes(val))}>{val}</button>
              ))}
            </div>
          </div>

          {/* Assist Pool */}
          <div>
            <p className="text-[10px] font-black opacity-40 mb-3 uppercase tracking-[0.2em]">{strings.A_POOL || 'ASSIST'}</p>
            <div className="flex flex-wrap gap-2">
              {pool.assists.map(val => (
                <button key={val} onClick={() => toggleWishlist('assist', val)} className={btnStyle(wishlist.assist.includes(val))}>{val}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Match Results */}
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between mb-6 border-b-2 border-current pb-4 opacity-50">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            <h4 className="font-black text-lg italic uppercase">{strings.OPTIMAL || 'OPTIMAL'}</h4>
          </div>
          <span className="text-xs font-mono font-black opacity-40 tracking-tighter">
            {recommendations.length} MATCHES FOUND
          </span>
        </div>

        <div className="space-y-3 max-h-[75vh] overflow-y-auto no-scrollbar pr-2">
          {recommendations.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-current opacity-20 rounded-xl">
              <p className="text-sm font-black italic uppercase tracking-widest">Awaiting_Scan_Input...</p>
            </div>
          ) : (
            recommendations.map((p: any) => (
              <div 
                key={p.model} 
                onClick={() => onProductClick(p)} 
                className={`group p-4 border-2 transition-all cursor-pointer flex justify-between items-center ${
                  isLight ? 'bg-white border-black hover:bg-gray-100' : 'bg-cyan-950/10 border-cyan-900/50 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-xl font-black italic px-3 py-1 flex items-center justify-center min-w-[3rem] ${
                    p.score >= 2 ? 'bg-cyan-600 text-white shadow-glow' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {p.score}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-black opacity-50 tracking-wider">{p.model}</div>
                    <div className="text-md font-black uppercase tracking-tight leading-tight">{getDisplayName(p, lang)}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.matched.map((m: string) => (
                        <span key={m} className="text-[9px] bg-cyan-600/20 text-cyan-400 px-1.5 py-0.5 font-black border border-cyan-400/30 uppercase">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelSystem;