import { Star, ChevronUp, ChevronDown } from 'lucide-react';

export default function FilterSortBar({ 
  currentSeries, currentGet, showFavOnly, onSeriesChange, onGetChange, onFavToggle, 
  theme, getMethods, sortKey, sortOrder, onSort, uiStrings 
}: any) {
  const btn = (active: boolean) => `px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${
    active ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow' : 'opacity-50 border-gray-500 hover:opacity-100'
  }`;

  // 定義要顯示嘅排序項目
  const sortItems = [
    { k: 'model', i: uiStrings.SORT_MODEL || 'ID', s: '📇' },
    { k: 'ratchet', i: 'RAT', s: '⚙️' },
    { k: 'bit_code', i: 'BIT', s: '🔰' }
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* 系列選單 */}
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {['all', 'BX', 'UX', 'CX'].map(s => (
            <button key={s} onClick={() => onSeriesChange(s)} className={btn(currentSeries === s)}>{s.toUpperCase()}</button>
          ))}
        </div>
        
        {/* 取得方式 */}
        <div className="flex flex-wrap gap-1 bg-black/5 p-1 rounded-xl">
          {Object.entries(getMethods).map(([id, name]: any) => (
            <button key={id} onClick={() => onGetChange(id)} className={btn(currentGet === id)}>{name}</button>
          ))}
        </div>

        {/* 最愛過濾 */}
        <button onClick={onFavToggle} className={`p-2 border rounded-xl transition-all ${showFavOnly ? 'bg-yellow-500 border-yellow-500 text-black shadow-glow' : 'opacity-30 border-gray-500'}`}>
          <Star size={18} fill={showFavOnly ? "black" : "none"} />
        </button>
      </div>

      {/* 排序按鈕組 */}
      <div className="grid grid-cols-3 gap-2">
        {sortItems.map(item => (
          <button 
            key={item.k} 
            onClick={() => onSort(item.k)}
            className={`flex flex-col items-center py-2 rounded-xl border transition-all font-black ${
              sortKey === item.k 
                ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400 shadow-glow' 
                : 'border-gray-800 opacity-40 hover:opacity-100'
            }`}
          >
            <span className="text-[10px] mb-1">{item.s} {item.i}</span>
            {sortKey === item.k && (
              sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}