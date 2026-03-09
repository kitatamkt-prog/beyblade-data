// DetailModal.tsx
import { X, Star } from 'lucide-react';

export default function DetailModal({ product, lang, theme, isFav, onToggleFav, onClose, getDisplayName, getC, uiStrings }: any) {
  if (!product) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg border-4 p-8 relative shadow-2xl ${isLight ? 'bg-white border-black text-black' : 'bg-black border-cyan-500 text-white shadow-glow'}`}>
        
        {/* ✅ 關閉按鈕：確保 z-index 最高且位置獨立 */}
        <button onClick={onClose} className="absolute top-2 right-2 p-2 text-cyan-500 hover:text-white transition-colors z-[210]">
          <X size={32}/>
        </button>
        
        <div className="mb-6 border-b-4 border-cyan-900 pb-4 pr-10"> {/* ✅ pr-10 預留空間俾右上角粒 X */}
          <div className="flex justify-between items-end mb-2">
            <span className="text-cyan-600 font-mono text-[10px] font-black uppercase tracking-widest italic">
              STATUS: ACTIVE_UNIT // {product.data_get || "NORMAL"}
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase leading-none truncate mr-2">
              {getDisplayName(product, lang)}
            </h2>
            {/* ✅ 星星同型號一組，遠離右上角 X */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={(e) => onToggleFav(e, product.model)} className="p-1">
                <Star size={28} fill={isFav ? (isLight ? "#000" : "#00f2ff") : "none"} className={isFav ? "text-cyan-400 shadow-glow" : "text-gray-600"} />
              </button>
              <span className="text-lg font-mono font-black border-l-2 border-cyan-900 pl-2">{product.model}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           {/* CX 零件拆解 Box */}
           <div className={`p-4 border-2 grid grid-cols-3 gap-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
              <div><p className="text-[8px] opacity-40 font-black uppercase">Chip</p><p className="text-sm font-black truncate">{getC(product, 'chip', lang) || "-"}</p></div>
              <div className="border-x border-cyan-900/30"><p className="text-[8px] opacity-40 font-black uppercase">Main</p><p className="text-sm font-black truncate">{getC(product, 'main_blade', lang) || "-"}</p></div>
              <div><p className="text-[8px] opacity-40 font-black uppercase">Assist({product.assist_blade_code})</p><p className="text-sm font-black truncate">{getC(product, 'assist_blade', lang) || "-"}</p></div>
           </div>

           {/* 四語對照 */}
           <div className={`p-4 border-2 grid grid-cols-1 gap-1 text-[11px] font-black ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-950/30 border-cyan-900/50'}`}>
              {['zh_hk', 'zh_tw', 'en', 'jp'].map(l => (
                <div key={l} className="flex justify-between border-b border-black/5 last:border-none pb-1">
                  <span className="opacity-40 uppercase">{l.split('_')[1] || l}:</span><span className="truncate ml-2">{getDisplayName(product, l)}</span>
                </div>
              ))}
           </div>

           {/* 零件對位 */}
           <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 border-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
                <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">RATCHET 齒輪</p>
                <p className="text-3xl font-black">{product.ratchet}</p>
              </div>
              <div className={`p-6 border-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
                <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">BIT 軸心</p>
                <p className="text-3xl font-black">{product.bit_code}</p>
                <p className="text-[10px] mt-1 italic opacity-60">({product[`bit_name_${lang}`] || product.bit_name_en})</p>
              </div>
           </div>

           <div className={`p-6 border-4 flex justify-between items-center ${isLight ? 'bg-black text-white' : 'border-cyan-500/30 bg-cyan-500/5 shadow-glow'}`}>
              <span className="text-sm font-black uppercase">{uiStrings.PRICE_LABEL}</span>
              <span className="text-5xl font-black italic">¥{product.price||'---'}</span>
           </div>
        </div>
      </div>
    </div>
  );
}