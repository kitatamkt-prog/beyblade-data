import { useState, useEffect, useMemo, useRef } from 'react';
import { Shield, Zap, Settings, TrendingUp, Star } from 'lucide-react';

// --- 匯入配置與自定義 Hook ---
import { APP_VERSION_CURRENT } from './config/version'; 
import { useBeybladeData } from './hooks/useBeybladeData';

// --- 匯入自定義組件 ---
import DetailModal from './components/DetailModal';
import ProductCard from './components/ProductCard';
import IntelSystem from './components/IntelSystem';

const UI_TEXT: any = {
  zh_hk: { ARSENAL: "產品名錄", INTEL: "零件匹配", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "輸入搜索指令...", R_POOL: "⚙️ R_POOL", B_POOL: "🔰 B_POOL", A_POOL: "🔪 A_POOL", SCORE: "匹配得分", LOADING: "加載中...", PRICE_LABEL: "官方定價", ITEMS_FOUND: "項結果", OPTIMAL: "最佳獲取建議", SORT_MODEL: "型號", SORT_PRC: "價格" },
  zh_tw: { ARSENAL: "產品清單", INTEL: "零件匹配", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "搜尋中...", R_POOL: "⚙️ R_POOL", B_POOL: "🔰 B_POOL", A_POOL: "🔪 A_POOL", SCORE: "匹配得分", LOADING: "啟動中...", PRICE_LABEL: "官方定價", ITEMS_FOUND: "項結果", OPTIMAL: "最佳獲取建議", SORT_MODEL: "型號", SORT_PRC: "價格" },
  en: { ARSENAL: "ARSENAL", INTEL: "MATCHING", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "QUERY TERMINAL...", R_POOL: "⚙️ R_POOL", B_POOL: "🔰 B_POOL", A_POOL: "🔪 A_POOL", SCORE: "SCORE", RECENT: "HISTORY", LOADING: "BOOTING...", PRICE_LABEL: "MSRP", ITEMS_FOUND: "items", OPTIMAL: "OPTIMAL", SORT_MODEL: "MODEL", SORT_PRC: "PRICE" }
};

export default function BeybladeApp() {
  const BASE_URL = import.meta.env.BASE_URL || "/";
  
  // --- UI 與 語言/主題 狀態 ---
  const [activeTab, setActiveTab] = useState("ARSENAL");
  const [lang, setLang] = useState("zh_hk");
  const [theme, setTheme] = useState("dark");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSeries, setCurrentSeries] = useState("all");
  const [currentGet, setCurrentGet] = useState("all");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortKey, setSortKey] = useState("model");
  const [sortOrder, setSortOrder] = useState("asc");

  // --- 持久化數據 (本地存儲) ---
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem("bey_favs") || "[]"));
  const [wishlist, setWishlist] = useState<any>(() => JSON.parse(localStorage.getItem("bey_wishlist") || '{"ratchet":[],"bit":[],"assist":[]}'));

  // --- 使用數據大腦 (Hook) ---
  const { products, loading, pool, getDisplayName, getC } = useBeybladeData(BASE_URL, lang);

  const clickCount = useRef(0);
  const ui = UI_TEXT[lang] || UI_TEXT.zh_hk;

  // 保存收藏與零件清單到 LocalStorage
  useEffect(() => {
    localStorage.setItem("bey_favs", JSON.stringify(favorites));
    localStorage.setItem("bey_wishlist", JSON.stringify(wishlist));
  }, [favorites, wishlist]);

  // 最愛切換邏輯
  const toggleFavorite = (model: string) => {
    setFavorites(prev => 
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  const handleEggTrigger = () => {
    clickCount.current += 1;
    setTimeout(() => { clickCount.current = 0; }, 1000);
    if (clickCount.current >= 3) setTheme(prev => prev === 'pink' ? 'dark' : 'pink');
  };

  // --- 零件推薦算法 (Intel 核心邏輯) ---
  const recommendations = useMemo(() => {
    if (!wishlist.ratchet.length && !wishlist.bit.length && !wishlist.assist.length) return [];
    return products.map((p: any) => {
      let score = 0;
      const matched = [];
      if (wishlist.ratchet.includes(p.ratchet)) { score++; matched.push(p.ratchet); }
      if (wishlist.bit.includes(p.bit_code)) { score++; matched.push(p.bit_code); }
      if (p.assist_blade_code && wishlist.assist.includes(p.assist_blade_code)) { score++; matched.push(p.assist_blade_code); }
      return { ...p, score, matched };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);
  }, [products, wishlist]);

  // --- 名錄過濾與排序 ---
  const processedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      const matchesGet = currentGet === "all" || (currentGet === "box" ? p.data_get?.includes('×') : p.data_get === currentGet);
      const matchesFav = !showFavOnly || favorites.includes(p.model);
      return matchesSearch && matchesSeries && matchesGet && matchesFav;
    });
    return [...filtered].sort((a, b) => {
      let vA = a[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      let vB = b[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      return sortOrder === "asc" ? (vA < vB ? -1 : 1) : (vA > vB ? -1 : 1);
    });
  }, [products, searchTerm, currentSeries, currentGet, showFavOnly, sortKey, sortOrder, lang, favorites, getDisplayName]);

  const themeClass = theme === 'pink' ? "bg-[#1a0010] text-[#ff71ce]" : theme === 'light' ? "bg-white text-black" : "bg-[#050505] text-cyan-50";

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-cyan-500 bg-black animate-pulse text-3xl italic tracking-tighter text-center px-6">SYSTEM_V2_INITIALIZING...</div>;

  return (
    <div className={`min-h-screen transition-all font-sans pb-24 no-scrollbar ${themeClass}`}>
      
      {/* 1. Navbar */}
      <nav className={`p-4 border-b flex justify-between items-center sticky top-0 z-[100] shadow-xl backdrop-blur-lg ${
        theme === 'light' ? 'bg-white border-black' : 'bg-black/95 border-cyan-900/50'
      }`}>
        <div className="flex items-center gap-2">
          <Settings className={theme==='light' ? 'text-black' : 'text-cyan-400'} size={24} />
          <h1 onClick={handleEggTrigger} className="font-black italic text-xl tracking-tighter cursor-pointer select-none">
            {ui.SYSTEM} <span className="text-[10px] opacity-40 ml-1 font-mono">{APP_VERSION_CURRENT}</span>
          </h1>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 border rounded-full border-gray-500 hover:scale-110 transition-transform"><Zap size={18}/></button>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {activeTab === "ARSENAL" ? (
          <>
            {/* 2. 篩選與排序面板 */}
            <div className="space-y-4 mb-8">
              <input type="text" placeholder={ui.QUERY} className={`w-full border-b-2 p-5 text-xl outline-none font-black ${
                theme==='light' ? 'bg-white border-black text-black' : 'bg-transparent border-cyan-900 text-white'
              }`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex bg-black/5 p-1 rounded-xl border border-black/10">
                  {['all', 'BX', 'UX', 'CX'].map(s => (
                    <button key={s} onClick={() => setCurrentSeries(s)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      currentSeries === s ? (theme==='light' ? 'bg-black text-white' : 'bg-cyan-600 text-white shadow-glow') : 'opacity-40 hover:opacity-100'
                    }`}>{s.toUpperCase()}</button>
                  ))}
                </div>
                <select onChange={(e) => setCurrentGet(e.target.value)} value={currentGet} className={`text-xs p-2 rounded-xl font-black border outline-none ${theme==='light'?'bg-white border-black':'bg-black border-cyan-900 text-cyan-400'}`}>
                  <option value="all">GET_ALL</option><option value="通販">📦通販</option><option value="A">📱APP</option><option value="J">🇯🇵日本</option><option value="box">🎲抽包</option>
                </select>
                <button onClick={() => setShowFavOnly(!showFavOnly)} className={`p-2 border rounded-xl transition-all ${showFavOnly ? 'bg-yellow-500 border-yellow-500 text-black shadow-glow' : theme==='light' ? 'border-black text-black' : 'border-cyan-900 text-cyan-900'}`}>
                  <Star size={16} fill={showFavOnly?"black":"none"}/>
                </button>
                <span className="text-xs font-black opacity-60 italic tracking-tighter">{processedProducts.length} {ui.ITEMS_FOUND}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[{ k: 'model', i: ui.SORT_MODEL, s: '📇' }, { k: 'ratchet', i: 'RAT', s: '⚙️' }, { k: 'bit_code', i: 'BIT', s: '🔰' }, { k: 'price', i: ui.SORT_PRC, s: '💰' }].map(item => (
                  <button key={item.k} onClick={() => { if(sortKey===item.k) setSortOrder(sortOrder==='asc'?'desc':'asc'); else {setSortKey(item.k); setSortOrder('asc');} }}
                    className={`flex flex-col items-center py-2 rounded-xl border transition-all font-black ${
                      sortKey === item.k ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400 shadow-glow' : theme==='light' ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50' : 'border-cyan-900/30 text-cyan-700 opacity-60 hover:opacity-100'
                    }`}>
                    <span className="text-xl">{item.s}</span>
                    <span className="text-[9px] uppercase mt-1 tracking-widest">{item.i} {sortKey === item.k ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 產品列表 (已整合最愛 Props) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedProducts.map((p) => (
                <ProductCard 
                  key={p.model} 
                  product={p} 
                  lang={lang} 
                  theme={theme} 
                  onClick={setSelectedProduct} 
                  getDisplayName={getDisplayName}
                  isFavorite={favorites.includes(p.model)}
                  onToggleFavorite={() => toggleFavorite(p.model)}
                />
              ))}
            </div>
          </>
        ) : (
          <IntelSystem 
            pool={pool}
            wishlist={wishlist}
            setWishlist={setWishlist}
            recommendations={recommendations}
            lang={lang}
            theme={theme}
            ui={ui}
            getDisplayName={getDisplayName}
            onProductClick={setSelectedProduct}
          />
        )}
      </div>

      {/* 5. 詳細資料彈窗 */}
      <DetailModal 
        product={selectedProduct} 
        lang={lang} 
        theme={theme} 
        onClose={() => setSelectedProduct(null)} 
        getDisplayName={getDisplayName}
        getC={getC}
      />

      {/* 6. 底部導航 */}
      <div className={`fixed bottom-0 left-0 right-0 border-t-4 flex justify-around p-3 z-[100] backdrop-blur-xl ${
        theme === 'light' ? 'bg-white border-black' : 'bg-black/95 border-cyan-900/50 shadow-glow'
      }`}>
        <button onClick={() => setActiveTab("ARSENAL")} className={`flex flex-col items-center p-2 transition-all ${activeTab === "ARSENAL" ? (theme==='light'?'text-black scale-110':'text-cyan-400 shadow-glow scale-110') : 'text-gray-500 opacity-40'}`}>
          <Shield size={32}/><span className="text-[10px] font-black uppercase">{ui.ARSENAL}</span>
        </button>
        <button onClick={() => setActiveTab("INTEL")} className={`flex flex-col items-center p-2 transition-all ${activeTab === "INTEL" ? (theme==='light'?'text-black scale-110':'text-cyan-400 shadow-glow scale-110') : 'text-gray-500 opacity-40'}`}>
          <TrendingUp size={32}/><span className="text-[10px] font-black uppercase">{ui.INTEL}</span>
        </button>
      </div>

      <style>{`
        .shadow-glow { filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.6)); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}