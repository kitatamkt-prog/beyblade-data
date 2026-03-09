// src/components/Navbar.tsx
import { Settings, Zap } from 'lucide-react';
import { APP_VERSION_CURRENT } from '../config/version';

export default function Navbar({ lang, theme, onLangChange, onThemeToggle, onEggTrigger, systemName }: any) {
  const isLight = theme === 'light';
  const isPink = theme === 'pink';

  // ✅ 必須定義這個數組，否則會報 langs is not defined
  const langs = [
    { id: 'zh_hk', l: '繁港' },
    { id: 'zh_tw', l: '繁台' },
    { id: 'en', l: 'EN' },
    { id: 'jp', l: 'JP' }
  ];

  return (
    <nav className={`p-4 border-b flex flex-col md:flex-row justify-between items-center sticky top-0 z-[100] backdrop-blur-md ${isLight ? 'bg-white border-black' : 'bg-black/95 border-cyan-900/50'}`}>
      <div className="flex items-center gap-2 mb-3 md:mb-0">
        <Settings className={isLight ? 'text-black' : 'text-cyan-400'} size={24} />
        <div className="flex flex-col">
          <h1 onClick={onEggTrigger} className={`font-black italic text-xl cursor-pointer select-none leading-none ${isPink ? 'text-pink-500 shadow-glow' : isLight ? 'text-black' : 'text-cyan-400'}`}>
            {systemName}
          </h1>
          <span className="text-[9px] font-mono opacity-40 tracking-widest mt-1 uppercase font-black">
            Build: {APP_VERSION_CURRENT}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* 這裡使用了 langs.map，所以上面必須定義 langs */}
        <div className="flex gap-1 bg-black/10 p-1 rounded-xl">
          {langs.map(l => (
            <button 
              key={l.id} 
              onClick={() => onLangChange(l.id)} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                lang === l.id ? 'bg-cyan-600 text-white shadow-glow' : 'opacity-40 hover:opacity-100'
              }`}
            >
              {l.l}
            </button>
          ))}
        </div>
        
        <button 
          onClick={onThemeToggle} 
          className="p-2 border rounded-full border-gray-500 transition-transform active:scale-90"
        >
          <Zap size={18} className={isLight ? 'text-black' : 'text-cyan-400'} />
        </button>
      </div>
    </nav>
  );
}