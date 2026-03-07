import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Moon, Sun, Star, Clock, Zap, Cpu, TrendingUp, Shield, Globe, ChevronDown, ListChecks, Trash2 } from 'lucide-react';

// --- 多語言 UI 辭典 (解決導航、池、按鈕多語言問題) ---
const UI_TEXT: any = {
  zh_hk: { ARSENAL: "產品名錄", INTEL: "數據分析", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "輸入指令...", R_POOL: "⚙️ RATCHET 池", B_POOL: "🔰 BIT 池", A_POOL: "🔪 ASSIST 池", SCORE: "匹配度", RECENT: "最近瀏覽", LOADING: "系統啟動中...", SORT_MODEL: "型號", SORT_PRC: "價格" },
  zh_tw: { ARSENAL: "產品目錄", INTEL: "數據分析", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "搜尋中...", R_POOL: "⚙️ RATCHET 池", B_POOL: "🔰 BIT 池", A_POOL: "🔪 ASSIST 池", SCORE: "匹配度", RECENT: "最近瀏覽", LOADING: "系統啟動中...", SORT_MODEL: "型號", SORT_PRC: "價格" },
  en: { ARSENAL: "ARSENAL", INTEL: "INTEL", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "QUERY SYSTEM...", R_POOL: "⚙️ RATCHET POOL", B_POOL: "🔰 BIT POOL", A_POOL: "🔪 ASSIST POOL", SCORE: "SCORE", RECENT: "RECENT", LOADING: "BOOTING_SYSTEM...", SORT_MODEL: "MODEL", SORT_PRC: "PRC" },
  jp: { ARSENAL: "アーセナル", INTEL: "インテル", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "検索中...", R_POOL: "⚙️ ラチェット", B_POOL: "🔰 ビット", A_POOL: "🔪 アシスト", SCORE: "スコア", RECENT: "閲覧履歴", LOADING: "システム起動中...", SORT_MODEL: "モデル", SORT_PRC: "価格" }
};

export default function BeybladeApp() {
  // 1. 定義 BASE_URL ✅ (解決 ReferenceError)
  const BASE_URL = import.meta.env.BASE_URL || "/";

  // 2. 狀態定義 (加上防禦性 try-catch 預防 [object Object] 報錯) ✅
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ARSENAL");
  const [lang, setLang] = useState("zh_hk");
  const [theme, setTheme] = useState("dark");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // 篩選/排序/搜尋
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSeries, setCurrentSeries] = useState("all");
  const [currentGet, setCurrentGet] = useState("all");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortKey, setSortKey] = useState("model");
  const [sortOrder, setSortOrder] = useState("asc");

  // 持久化數據
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const s = localStorage.getItem("bey_favs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { const s = localStorage.getItem("bey_recent"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<any>(() => {
    try { 
      const s = localStorage.getItem("bey_wishlist"); 
      const p = s ? JSON.parse(s) : null;
      return (p && typeof p === 'object' && p.ratchet) ? p : { ratchet: [], bit: [], assist: [] };
    } catch { return { ratchet: [], bit: [], assist: [] }; }
  });

  const clickCount = useRef(0);
  const eggTimer = useRef<any>(null);
  const ui = UI_TEXT[lang] || UI_TEXT.zh_hk;

  // 3. 數據抓取
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const t = Date.now();
        const [mRes, pRes] = await Promise.all([
          fetch(`${BASE_URL}beyblade_product_master.json?t=${t}`).then(res => res.json()),
          fetch(`${BASE_URL}beyblade_price_inventory.json?t=${t}`).then(res => res.json())
        ]);
        
        const merged = mRes.map((p: any) => ({
          ...p,
          price: pRes[p.model]?.price_jpy || null,
          notes: pRes[p.model]?.notes || '',
        }));
        setProducts(merged);
      } catch (e) { console.error("Load Error:", e); } finally { setLoading(false); }
    }
    fetchData();
  }, [BASE_URL]);

  useEffect(() => {
    localStorage.setItem("bey_favs", JSON.stringify(favorites));
    localStorage.setItem("bey_recent", JSON.stringify(recent));
    localStorage.setItem("bey_wishlist", JSON.stringify(wishlist));
  }, [favorites, recent, wishlist]);

  const handleEggTrigger = () => {
    clickCount.current += 1;
    if (eggTimer.current) clearTimeout(eggTimer.current);
    eggTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);
    if (clickCount.current >= 10) { setTheme(prev => prev === 'pink' ? 'dark' : 'pink'); clickCount.current = 0; }
  };

  const getDisplayName = (p: any, language: string) => {
    if (!p) return "";
    const chip = p[`chip_${language}`] || p.chip_zh_hk || "";
    const main = p[`main_blade_${language}`] || p.main_blade_zh_hk || "";
    const assist = p[`assist_blade_${language}`] || p.assist_blade_zh_hk || "";
    const fullName = `${chip}${main}${assist}`.trim();
    return fullName || p.model;
  };

  // 4. 計算邏輯
  const recommendations = useMemo(() => {
    if (!wishlist?.ratchet?.length && !wishlist?.bit?.length && !wishlist?.assist?.length) return [];
    return products.map((p: any) => {
      let score = 0;
      const matched = [];
      if (wishlist.ratchet.includes(p.ratchet)) { score++; matched.push(p.ratchet); }
      if (wishlist.bit.includes(p.bit_code)) { score++; matched.push(p.bit_code); }
      if (p.assist_blade_code && wishlist.assist.includes(p.assist_blade_code)) { score++; matched.push(p.assist_blade_code); }
      return { ...p, score, matched };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);
  }, [products, wishlist]);

  const pool = useMemo(() => {
    const r = new Set<string>(); const b = new Set<string>(); const a = new Set<string>();
    products.forEach((p: any) => { 
      if (p.ratchet) r.add(p.ratchet); if (p.bit_code) b.add(p.bit_code);
      if (p.assist_blade_code) a.add(p.assist_blade_code);
    });
    return { ratchets: Array.from(r).sort(), bits: Array.from(b).sort(), assists: Array.from(a).sort() };
  }, [products]);

  const processedProducts = useMemo(() => {
    let res = products.filter((p: any) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const searchStr = `${p.model} ${name} ${p.ratchet} ${p.bit_code}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      const matchesGet = currentGet === "all" || (currentGet === "box" ? p.data_get?.includes('×') : p.data_get === currentGet);
      const matchesFav = !showFavOnly || favorites.includes(p.model);
      return matchesSearch && matchesSeries && matchesGet && matchesFav;
    });

    return [...res].sort((a: any, b: any) => {
      let vA = a[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      let vB = b[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      if (vA < vB) return sortOrder === "asc" ? -1 : 1;
      if (vA > vB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, currentSeries, currentGet, showFavOnly, sortKey, sortOrder, lang, favorites]);

  const themeClass = theme === 'pink' ? "bg-[#1a0010] text-[#ff71ce]" : theme === 'light' ? "bg-slate-50 text-slate-900" : "bg-[#050505] text-cyan-50";

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-cyan-500 bg-black animate-pulse">{ui.LOADING}</div>;

  return (
    <div className={`min-h-screen transition-all font-mono pb-24 ${themeClass}`}>
      
      {/* 1. Navbar ✅ */}
      <nav className="p-4 border-b border-cyan-900/50 flex justify-between items-center sticky top-0 z-[100] bg-black">
        <h1 onClick={handleEggTrigger} className={`font-black italic text-lg tracking-tighter cursor-pointer select-none ${theme==='pink'?'text-[#ff71ce] shadow-[0_0_15px]':'text-cyan-400'}`}>{ui.SYSTEM}</h1>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-[10px] border border-cyan-800 px-3 py-1 rounded bg-black text-cyan-400 hover:border-cyan-400">
              <Globe size={12}/> {lang.toUpperCase()} <ChevronDown size={10}/>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-black border-2 border-cyan-500 rounded shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden z-[110]">
                {[{id: "zh_hk", l: "繁體港"}, {id: "zh_tw", l: "繁體台"}, {id: "en", l: "English"}, {id: "jp", l: "日本語"}].map(l => (
                  <button key={l.id} className="w-full text-left px-4 py-3 text-[11px] text-cyan-400 font-bold hover:bg-cyan-900 transition-colors border-b border-white/10 last:border-none" 
                    onClick={() => { setLang(l.id); setShowLangMenu(false); }}>{l.l}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 border border-cyan-800 rounded-full text-cyan-400 hover:border-cyan-400 transition-all"><Zap size={16}/></button>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {/* 2. 最近瀏覽 ✅ */}
        {recent.length > 0 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[9px] opacity-40 italic">
            <Clock size={10}/> {ui.RECENT}: {recent.map(m => <span key={m} className="hover:text-cyan-400 cursor-pointer border-r border-white/10 pr-2 last:border-none" onClick={() => setSelectedProduct(products.find(x=>x.model===m))}>{m}</span>)}
          </div>
        )}

        <div className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-cyan-400" />
          <input type="text" placeholder={ui.QUERY} className="w-full bg-black border-b-2 border-cyan-900 p-4 pl-12 text-cyan-100 outline-none focus:border-cyan-400 transition-all italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {activeTab === "ARSENAL" ? (
          <>
            {/* 3. 篩選與排序面板 ✅ (型號 ↑, RAT, BIT, PRC) */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <select onChange={(e) => setCurrentSeries(e.target.value)} value={currentSeries} className="bg-black border border-cyan-900 text-[10px] p-2 rounded text-cyan-400 outline-none hover:border-cyan-500">
                  <option value="all">SERIES_ALL</option><option value="BX">BX</option><option value="UX">UX</option><option value="CX">CX</option>
                </select>
                <select onChange={(e) => setCurrentGet(e.target.value)} value={currentGet} className="bg-black border border-cyan-900 text-[10px] p-2 rounded text-cyan-400 outline-none hover:border-cyan-500">
                  <option value="all">GET_ALL</option><option value="通販">📦通販</option><option value="A">📱APP</option><option value="J">🇯🇵日本</option><option value="box">🎲抽包</option>
                </select>
                <button onClick={() => setShowFavOnly(!showFavOnly)} className={`p-2 border rounded text-[10px] flex items-center gap-1 transition-all ${showFavOnly ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-cyan-900 text-cyan-900'}`}><Star size={10} fill={showFavOnly?"currentColor":"none"}/> FAVS</button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[{ k: 'model', i: ui.SORT_MODEL, s: '📇' }, { k: 'ratchet', i: 'RAT', s: '⚙️' }, { k: 'bit_code', i: 'BIT', s: '🔰' }, { k: 'price', i: ui.SORT_PRC, s: '💰' }].map(item => (
                  <button key={item.k} onClick={() => { if(sortKey===item.k) setSortOrder(sortOrder==='asc'?'desc':'asc'); else {setSortKey(item.k); setSortOrder('asc');} }}
                    className={`flex flex-col items-center py-1 rounded border transition-all ${sortKey === item.k ? 'border-cyan-400 bg-cyan-900/30 text-cyan-400 shadow-[0_0_10px_cyan]' : 'border-cyan-900/30 opacity-40'}`}>
                    <span className="text-[10px] font-black">{item.s}</span>
                    <span className="text-[7px] uppercase font-bold">{item.i} {sortKey === item.k ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 產品列表 ✅ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processedProducts.length > 0 ? processedProducts.map((p: any) => (
                <div key={p.model} onClick={() => { setSelectedProduct(p); setRecent(prev => [p.model, ...prev.filter(x=>x!==p.model)].slice(0,8)); }}
                     className="group relative p-4 bg-black border border-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer overflow-hidden backdrop-blur-sm">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.type==='UX'?'bg-red-600 shadow-[0_0_10px_red]':p.type==='CX'?'bg-green-600 shadow-[0_0_10px_green]':'bg-cyan-600 shadow-[0_0_10px_cyan]'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-mono text-cyan-700 group-hover:text-cyan-400">{p.model}</span>
                    <button onClick={(e) => { e.stopPropagation(); setFavorites(prev => prev.includes(p.model)?prev.filter(m=>m!==p.model):[...prev, p.model]); }}>
                      <Star size={14} fill={favorites.includes(p.model)?"#00f2ff":"none"} className={`transition-all ${favorites.includes(p.model)?"text-cyan-400 shadow-[0_0_5px]":"text-cyan-900 opacity-20 hover:opacity-100"}`}/>
                    </button>
                  </div>
                  <h3 className="text-[10px] font-black h-8 line-clamp-2 mb-4 text-cyan-100 uppercase tracking-tighter leading-tight group-hover:text-white transition-colors">{getDisplayName(p, lang)}</h3>
                  <div className="flex justify-between items-center border-t border-cyan-900/30 pt-2"><span className="text-[8px] text-cyan-900 font-bold uppercase">{p.ratchet}</span><span className="text-sm font-black italic text-cyan-400 group-hover:text-white transition-colors">¥{p.price||'---'}</span></div>
                </div>
              )) : <div className="col-span-full py-20 text-center opacity-40 italic">NO DATA FOUND_RETRY_SYSTEM</div>}
            </div>
          </>
        ) : (
          /* 5. INTEL + Wishlist ✅ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 border border-cyan-900/50 bg-black">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-xs flex items-center gap-2 tracking-[0.2em] text-cyan-400"><ListChecks size={14}/> SYSTEM_WISHLIST</h4>
                  <button onClick={() => setWishlist({ratchet:[], bit:[], assist:[]})} className="text-[9px] text-red-500/60 hover:text-red-400 flex items-center gap-1 transition-colors"><Trash2 size={10}/> CLEAR</button>
                </div>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                  {[
                    { id: 'ratchet', label: ui.R_POOL, data: pool.ratchets },
                    { id: 'bit', label: ui.B_POOL, data: pool.bits },
                    { id: 'assist', label: ui.A_POOL, data: pool.assists }
                  ].map(sec => (
                    <div key={sec.id} className="border-l border-cyan-900/30 pl-3">
                      <p className="text-[9px] text-cyan-600 mb-3 font-black uppercase tracking-widest">{sec.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {sec.data.map((val: any) => (
                          <button key={val} onClick={() => setWishlist((v: any) => ({...v, [sec.id]: v[sec.id].includes(val) ? v[sec.id].filter((x: any)=>x!==val) : [...v[sec.id], val]}))}
                            className={`text-[9px] px-2 py-1 border transition-all ${wishlist[sec.id as keyof typeof wishlist].includes(val) ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_cyan] scale-105' : 'border-cyan-900/30 text-cyan-900 hover:text-cyan-400'}`}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <h4 className="font-black text-xs tracking-[0.2em] mb-6 text-cyan-400 flex justify-between border-b border-cyan-900/50 pb-2">
                <span>OPTIMAL_ACQUISITION_PLAN</span>
                <span className="opacity-40">{recommendations.length} RECORDS_MATCHED</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((p: any) => (
                    <div key={p.model} onClick={() => setSelectedProduct(p)} className="group p-4 bg-black border border-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer flex justify-between items-center relative overflow-hidden backdrop-blur-sm">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.score >= 2 ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-cyan-900'}`}></div>
                      <div>
                        <div className="text-[9px] font-bold text-cyan-600 mb-1">{p.model}</div>
                        <div className="text-xs font-black text-white group-hover:text-cyan-400">{getDisplayName(p, lang)}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.matched.map((m: any) => <span key={m} className="text-[7px] bg-cyan-400 text-black px-1 font-black uppercase">MATCH_{m}</span>)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] px-2 py-0.5 font-black italic transition-all ${p.score >= 2 ? 'bg-cyan-400 text-black shadow-[0_0_15px_cyan]' : 'bg-cyan-900 text-cyan-400'}`}>
                          {ui.SCORE}: {p.score}
                        </div>
                        <div className="text-sm font-black text-cyan-400 mt-2 italic group-hover:text-white">¥{p.price || '---'}</div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. 底部 Tab Bar ✅ */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-cyan-900 flex justify-around p-2 z-[100]">
        {[
          {id:"ARSENAL", icon:<Shield size={20}/>, label: ui.ARSENAL}, 
          {id:"INTEL", icon:<TrendingUp size={20}/>, label: ui.INTEL}
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === t.id ? 'text-cyan-400 drop-shadow-[0_0_8px_cyan] scale-110' : 'text-cyan-900 opacity-50 hover:opacity-100'}`}>
            {t.icon} <span className="text-[9px] font-black tracking-widest uppercase">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 7. 詳細彈窗 - 四語對照 & 高對比 ✅ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-black border-2 border-cyan-500 p-8 relative shadow-[0_0_60px_rgba(0,255,255,0.3)] animate-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"><X/></button>
            <div className="mb-6 border-b border-cyan-900 pb-4 relative">
              <span className="text-cyan-600 font-mono text-[9px] tracking-[0.3em] uppercase">STATUS_ACTIVE_UNIT</span>
              <h2 className="text-2xl font-black italic mt-1 text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{getDisplayName(selectedProduct, lang)}</h2>
            </div>
            <div className="space-y-4">
               <div className="bg-cyan-950/30 p-4 border border-cyan-900/50 grid grid-cols-2 gap-2 text-[9px]">
                  {['zh_hk', 'zh_tw', 'en', 'jp'].map(l => (
                    <div key={l} className="text-cyan-100"><span className="opacity-40 uppercase mr-1">{l.split('_')[1] || l}:</span> {getDisplayName(selectedProduct, l)}</div>
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-cyan-900/10 border border-cyan-900/50 text-center">
                    <p className="text-[8px] text-cyan-700 mb-1 uppercase tracking-tighter">Ratchet_Module</p>
                    <p className="text-sm font-black text-cyan-400">{selectedProduct.ratchet || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-cyan-900/10 border border-cyan-900/50 text-center">
                    <p className="text-[8px] text-cyan-700 mb-1 uppercase tracking-tighter">Bit_Core_Link</p>
                    <p className="text-sm font-black text-cyan-400">{selectedProduct.bit_code || 'N/A'}</p>
                  </div>
               </div>
               <div className="p-4 border border-cyan-500/30 flex justify-between items-center bg-cyan-500/5">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Required_Credits</span>
                  <span className="text-xl font-black italic text-white shadow-cyan-400 drop-shadow-[0_0_8px_cyan]">¥{selectedProduct.price||'---'}</span>
               </div>
               {selectedProduct.notes && <div className="text-[8px] p-3 bg-cyan-950/20 border-l border-amber-500 text-amber-200/60 italic leading-relaxed uppercase opacity-80">{selectedProduct.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}