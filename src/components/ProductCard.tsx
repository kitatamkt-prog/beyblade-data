import React from 'react';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: any;
  lang: string;
  theme: string;
  onClick: (p: any) => void;
  getDisplayName: (p: any, l: string) => string;
  isFavorite: boolean;      // V2.0 新增
  onToggleFavorite: () => void; // V2.0 新增
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  lang, 
  theme, 
  onClick, 
  getDisplayName,
  isFavorite,
  onToggleFavorite
}) => {
  const isLight = theme === 'light';

  return (
    <div 
      onClick={() => onClick(product)}
      className={`group relative p-6 border-2 transition-all cursor-pointer overflow-hidden min-h-[300px] flex flex-col justify-between ${
        isLight 
          ? 'bg-white border-black text-black hover:shadow-2xl' 
          : 'bg-[#0a0a0a] border-cyan-900/50 hover:border-cyan-400 hover:shadow-glow'
      }`}
    >
      {/* 1. 最愛星星按鈕 (獨立點擊邏輯) */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // 阻止觸發卡片彈窗
          onToggleFavorite();
        }}
        className="absolute top-4 right-4 z-20 transition-transform hover:scale-125 p-1"
      >
        <Star 
          size={22} 
          fill={isFavorite ? "#facc15" : "none"} 
          className={isFavorite ? "text-yellow-400" : "text-gray-600 opacity-20 group-hover:opacity-100"} 
        />
      </button>

      {/* 2. 型號影子背景 */}
      <div className={`absolute -right-2 -bottom-2 font-black italic opacity-[0.03] pointer-events-none select-none z-0 ${
        product.model.length > 8 ? 'text-4xl' : 'text-6xl'
      }`}>
        {product.model}
      </div>

      {/* 3. 頂部數據：型號 & 價格 */}
      <div className="relative z-10 flex justify-between font-mono font-black text-sm">
        <span>{product.model}</span>
        <span className="italic">¥{product.price || '---'}</span>
      </div>

      {/* 4. 中間：名稱區域 (四語名回歸) */}
      <div className="relative z-10 space-y-1">
        <h3 className="text-xl font-black uppercase leading-tight">
          {getDisplayName(product, lang)}
        </h3>
        {/* 卡片預覽四語名 - 11px 加粗 */}
        <div className="grid grid-cols-1 text-[11px] font-black opacity-60 italic">
          <div className="truncate">HK: {getDisplayName(product, 'zh_hk')}</div>
          <div className="truncate">TW: {getDisplayName(product, 'zh_tw')}</div>
          <div className="truncate">EN: {getDisplayName(product, 'en')}</div>
          <div className="truncate">JP: {getDisplayName(product, 'jp')}</div>
        </div>
      </div>

      {/* 5. 底部：零件預覽 */}
      <div className={`relative z-10 flex justify-between items-center pt-3 border-t-2 ${
        isLight ? 'border-black' : 'border-cyan-900/30'
      }`}>
        <span className="text-[9px] font-black uppercase tracking-tighter italic">
          ⚙️ {product.ratchet} // 🔰 {product.bit_code}
        </span>
      </div>

      {/* 6. 系列色條 (側邊標識) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        product.type === 'UX' ? 'bg-red-600' : product.type === 'CX' ? 'bg-green-600' : 'bg-cyan-600'
      }`}></div>
    </div>
  );
};

export default ProductCard;