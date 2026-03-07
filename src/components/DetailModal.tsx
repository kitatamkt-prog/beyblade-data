import { X } from 'lucide-react';

// 定義組件需要的 Props，確保數據格式統一
interface DetailModalProps {
  product: any;
  lang: string;
  theme: string;
  onClose: () => void;
  // 傳入工具函數，保持邏輯一致性
  getDisplayName: (p: any, l: string) => string;
  getC: (p: any, key: string, l: string) => string;
}

const DetailModal = ({ product, lang, theme, onClose, getDisplayName, getC }: DetailModalProps) => {
  if (!product) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg border-4 p-8 relative shadow-2xl ${
        isLight ? 'bg-white border-black text-black' : 'bg-black border-cyan-500 text-white shadow-glow'
      }`}>
        {/* 關閉按鈕 */}
        <button onClick={onClose} className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors">
          <X size={32}/>
        </button>
        
        {/* 標題與狀態區 */}
        <div className="mb-6 border-b-4 border-cyan-900 pb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-cyan-600 font-mono text-sm font-black tracking-widest uppercase italic">
              STATUS: ACTIVE_UNIT // {product.data_get || "NORMAL"}
            </span>
            <span className="text-xl font-mono font-black">{product.model}</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase leading-none">
            {getDisplayName(product, lang)}
          </h2>
        </div>

        {/* 內容區域 */}
        <div className="space-y-6">
           {/* CX 專用零件拆解 */}
           <div className={`p-4 border-2 grid grid-cols-3 gap-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
              <div>
                <p className="text-[8px] opacity-40 font-black uppercase">Chip 晶片</p>
                <p className="text-sm font-black">{getC(product, 'chip', lang) || "-"}</p>
              </div>
              <div className="border-x border-cyan-900/30">
                <p className="text-[8px] opacity-40 font-black uppercase">Main 主刃</p>
                <p className="text-sm font-black">{getC(product, 'main_blade', lang) || "-"}</p>
              </div>
              <div>
                <p className="text-[8px] opacity-40 font-black uppercase">Assist({product.assist_blade_code || "-"})</p>
                <p className="text-sm font-black">{getC(product, 'assist_blade', lang) || "-"}</p>
              </div>
           </div>

           {/* 四語對照清單 */}
           <div className={`p-4 border-2 grid grid-cols-1 gap-1 text-[11px] font-black ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-950/30 border-cyan-900/50'}`}>
              {['zh_hk', 'zh_tw', 'en', 'jp'].map(l => (
                <div key={l} className="flex justify-between border-b border-black/5 last:border-none pb-1 uppercase">
                  <span className="opacity-40">{l.split('_')[1] || l}:</span>
                  <span>{getDisplayName(product, l)}</span>
                </div>
              ))}
           </div>

           {/* 齒輪與軸心數據 */}
           <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 border-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
                <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">RATCHET 齒輪</p>
                <p className="text-3xl font-black">{product.ratchet || "N/A"}</p>
              </div>
              <div className={`p-6 border-2 text-center ${isLight ? 'bg-gray-100 border-black' : 'bg-cyan-900/10 border-cyan-900/50'}`}>
                <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">BIT 軸心</p>
                <p className="text-3xl font-black">{product.bit_code || "N/A"}</p>
                <p className="text-[10px] mt-1 italic opacity-60">({product[`bit_name_${lang}`] || product.bit_name_en || "N/A"})</p>
              </div>
           </div>

           {/* 官方定價 */}
           <div className={`p-6 border-4 flex justify-between items-center ${isLight ? 'bg-black text-white' : 'border-cyan-500/30 bg-cyan-500/5 shadow-glow'}`}>
              <span className="text-sm font-black uppercase tracking-widest">官方定價</span>
              <span className="text-5xl font-black italic">¥{product.price || '---'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;