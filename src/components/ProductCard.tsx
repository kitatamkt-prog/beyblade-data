import { Star } from 'lucide-react';

export default function ProductCard({ product, lang, theme, isFav, onToggleFav, onClick, getDisplayName }: any) {
  const isLight = theme === 'light';
  
  return (
    <div onClick={onClick} className={`group relative p-4 border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px] ${isLight ? 'bg-white border-black text-black' : 'bg-[#0a0a0a] border-cyan-900/50 hover:border-cyan-400 hover:shadow-glow'}`}>
      {/* 背景浮水印 ID */}
      <div className={`absolute -right-2 -top-2 font-black italic opacity-[0.05] z-0 text-5xl select-none`}>{product.model}</div>
      
      <div className="relative z-10 flex justify-between items-start">
        <span className="text-[10px] font-mono font-black text-cyan-600 uppercase">{product.model}</span>
        <button onClick={(e) => onToggleFav(e, product.model)} className="p-1">
          <Star size={20} fill={isFav ? (isLight ? "#000" : "#00f2ff") : "none"} className={isFav ? (isLight ? "text-black" : "text-cyan-400 shadow-glow") : "text-gray-400 opacity-20"}/>
        </button>
      </div>

      <div className="relative z-10 my-2">
        <h3 className="text-lg font-black uppercase leading-tight truncate">{getDisplayName(product, lang)}</h3>
        <p className="text-[9px] font-black opacity-40 uppercase tracking-tighter italic">
          {product.type} SERIES // {product.release_date || '---'}
        </p>
      </div>

      {/* 零件欄位：模仿 go-shoot 零件列表風格 */}
      <div className={`relative z-10 flex flex-col gap-1.5 pt-3 border-t ${isLight ? 'border-black/10' : 'border-cyan-900/30'}`}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-white/5 px-1.5 py-0.5 border border-white/10 rounded font-mono opacity-50">RAT</span>
          <span className="text-xs font-black italic">{product.ratchet || '---'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-white/5 px-1.5 py-0.5 border border-white/10 rounded font-mono opacity-50">BIT</span>
          <span className="text-xs font-black italic">{product.bit_code || '---'}</span>
        </div>
      </div>
    </div>
  );
}