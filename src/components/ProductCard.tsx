import { Star } from 'lucide-react';

export default function ProductCard({ product, lang, theme, isFav, onToggleFav, onClick, getDisplayName }: any) {
  const isLight = theme === 'light';
  return (
    <div onClick={onClick} className={`group relative p-4 border-2 transition-all cursor-pointer overflow-hidden min-h-[220px] flex flex-col justify-between ${isLight ? 'bg-white border-black text-black' : 'bg-[#0a0a0a] border-cyan-900/50 hover:border-cyan-400 hover:shadow-glow'}`}>
      <div className={`absolute -right-2 -bottom-2 font-black italic opacity-[0.03] z-0 ${product.model.length > 8 ? 'text-3xl' : 'text-5xl'}`}>{product.model}</div>
      <div className="relative z-10 flex justify-between items-start">
        <span className="text-[10px] font-mono font-black text-cyan-600">{product.model}</span>
        <button onClick={(e) => onToggleFav(e, product.model)} className="p-1">
          <Star size={20} fill={isFav ? (isLight ? "#000" : "#00f2ff") : "none"} className={isFav ? (isLight ? "text-black" : "text-cyan-400 shadow-glow") : "text-gray-400 opacity-20"}/>
        </button>
      </div>
      <div className="relative z-10 my-2">
        <h3 className="text-lg font-black uppercase leading-tight truncate">{getDisplayName(product, lang)}</h3>
        <div className="text-[9px] font-black opacity-60 italic space-y-0.5 mt-1">
          <div className="truncate">HK: {getDisplayName(product, 'zh_hk')}</div>
          <div className="truncate">TW: {getDisplayName(product, 'zh_tw')}</div>
          <div className="truncate">EN: {getDisplayName(product, 'en')}</div>
          <div className="truncate">JP: {getDisplayName(product, 'jp')}</div>
        </div>
      </div>
      <div className={`relative z-10 flex justify-between items-end pt-2 border-t ${isLight ? 'border-black/10' : 'border-cyan-900/30'}`}>
        <span className="text-[10px] font-black opacity-50 italic">⚙️ {product.ratchet} // 🔰 {product.bit_code}</span>
        <div className={`text-sm font-black italic px-2 py-0.5 ${isLight ? 'bg-black text-white' : 'bg-cyan-600 text-white'}`}>¥{product.price || '---'}</div>
      </div>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${product.type === 'UX' ? 'bg-red-600' : product.type === 'CX' ? 'bg-green-600' : 'bg-cyan-600'}`}></div>
    </div>
  );
}