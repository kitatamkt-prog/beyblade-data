import { useState, useEffect, useMemo } from 'react';
import { Search, X, Star, Moon, Sun, History, Box, Settings2, ShoppingBag, ClipboardList, CheckCircle2, Sparkles, Globe } from 'lucide-react';
import { Button, Badge, Input, Card } from './components/ui.tsx';
import { APP_VERSION_CURRENT, APP_VERSION_DATA } from './config/version';

const MASTER_URL = "https://raw.githubusercontent.com/kitatamkt-prog/beyblade-data/refs/heads/main/beyblade_product_master.json";
const PRICE_URL = "https://raw.githubusercontent.com/kitatamkt-prog/beyblade-data/refs/heads/main/beyblade_price_inventory.json";

const LANGUAGES = [
  { id: 'zh_hk', label: '🇭🇰 繁中(港)' },
  { id: 'zh_tw', label: '🇹🇼 繁中(台)' },
  { id: 'en', label: '🇬🇧 EN' },
  { id: 'jp', label: '🇯🇵 JP' },
];

// --- 1. TopBar 子組件 ---
function TopBar({ theme, lang, onThemeToggle, onLangChange, onShowHistory }: any) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentLang = LANGUAGES.find(l => l.id === lang);

  return (
    <header className="top-bar-custom h-20">
      <div className="container mx-auto h-full flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${theme === 'pink' ? 'text-pink-500' : 'text-primary'}`}>
            BEYX<span className="text-white opacity-20 ml-1 italic uppercase">Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onShowHistory} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <History size={18} />
          </button>
          <button onClick={onThemeToggle} className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all ${theme === 'pink' ? 'border-pink-500 bg-pink-500/20' : 'border-primary/40 bg-primary/10'}`}>
            {theme === 'pink' ? <Sparkles size={18} className="text-pink-500" /> : <Sun size={18} className={theme === 'dark' ? 'text-primary' : 'text-orange-400'} />}
          </button>
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="h-[45px] px-4 flex flex-col items-center justify-center border-2 border-white/10 bg-white/5 rounded-xl transition-all hover:border-white/30">
              <span className="text-[8px] font-black opacity-30 uppercase">Region</span>
              <span className="text-sm font-black text-white flex items-center gap-2">{currentLang?.label} <Globe size={12} className="opacity-30" /></span>
            </button>
            {isLangOpen && (
              <div className="lang-panel-right absolute top-[55px] right-0 bg-black border-2 border-primary/50 rounded-xl z-[100] min-w-[150px] shadow-2xl overflow-hidden">
                {LANGUAGES.map(l => (
                  <button key={l.id} onClick={() => { onLangChange(l.id); setIsLangOpen(false); }} className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-primary/20 transition-all border-b border-white/5 last:border-none ${lang === l.id ? 'bg-primary/10 text-white' : 'text-white/60'}`}>
                    <span className="text-xs font-bold">{l.label}</span>
                    <span className="text-[9px] font-mono opacity-30">{l.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// --- 2. 主 App 組件 ---
export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'product' | 'favorite' | 'parts' | 'wishlist'>('product');
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("zh_hk");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<{ratchet: string[], bit: string[]}>({ ratchet: [], bit: [] });

  useEffect(() => {
    const savedTheme = localStorage.getItem('beyblade_theme') || 'dark';
    const savedLang = localStorage.getItem('beyblade_lang') || 'zh_hk';
    setTheme(savedTheme);
    setLang(savedLang);
    setFavorites(JSON.parse(localStorage.getItem('beyblade_favorites') || '[]'));
    setWishlist(JSON.parse(localStorage.getItem('beyblade_wishlist') || '{"ratchet":[],"bit":[]}'));

    async function fetchData() {
      try {
        const [mRes, pRes] = await Promise.all([fetch(MASTER_URL), fetch(PRICE_URL)]);
        const mData = await mRes.json();
        const pData = await pRes.json();
        const merged = Object.values(mData).map((p: any) => ({
          ...p,
          price_jpy: pData[p.model]?.price_jpy,
          data_get: pData[p.model]?.data_get || '通販',
          notes: pData[p.model]?.notes || '',
        }));
        setProducts(merged);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'pink-mode');
    root.classList.add(theme === 'pink' ? 'pink-mode' : theme);
    localStorage.setItem('beyblade_theme', theme);
  }, [theme]);

  const getName = (p: any, field: string, forceLang?: string) => {
    const currentL = forceLang || lang;
    return p[`${field}_${currentL}`] || p[`${field}_zh_hk`] || p[`${field}_en`] || p.model;
  };

  const handleThemeToggle = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount === 3) { setTheme(prev => (prev === 'pink' ? 'dark' : 'pink')); setClickCount(0); return; }
    if (theme !== 'pink' && nextCount === 1) { setTheme(prev => (prev === "dark" ? "light" : "dark")); }
    else if (theme === 'pink' && nextCount === 1) { setTheme('dark'); }
    const timer = setTimeout(() => setClickCount(0), 500);
    return () => clearTimeout(timer);
  };

  const toggleFav = (model: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newFavs = favorites.includes(model) ? favorites.filter(m => m !== model) : [...favorites, model];
    setFavorites(newFavs);
    localStorage.setItem('beyblade_favorites', JSON.stringify(newFavs));
  };

  const toggleWish = (type: 'ratchet' | 'bit', val: string) => {
    const newList = wishlist[type].includes(val) ? wishlist[type].filter(i => i !== val) : [...wishlist[type], val];
    const newWish = { ...wishlist, [type]: newList };
    setWishlist(newWish);
    localStorage.setItem('beyblade_wishlist', JSON.stringify(newWish));
  };

  const { availableParts, suggestedProducts, displayedProducts } = useMemo(() => {
    const r = new Set<string>();
    const b = new Set<string>();
    products.forEach(p => { if (p.ratchet) r.add(p.ratchet); if (p.bit_code) b.add(p.bit_code); });
    const suggested = (wishlist.ratchet.length === 0 && wishlist.bit.length === 0) ? [] : 
      products.map(p => {
        let score = 0;
        const matched: string[] = [];
        if (p.ratchet && wishlist.ratchet.includes(p.ratchet)) { score++; matched.push(p.ratchet); }
        if (p.bit_code && wishlist.bit.includes(p.bit_code)) { score++; matched.push(p.bit_code); }
        return { ...p, score, matched };
      }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

    let list = viewMode === 'favorite' ? products.filter(p => favorites.includes(p.model)) : products;
    const filtered = list.filter(p => p.model.toLowerCase().includes(search.toLowerCase()) || getName(p, 'main_blade').includes(search))
                         .sort((a, b) => a.model.localeCompare(b.model));
    return { availableParts: { ratchet: Array.from(r).sort(), bit: Array.from(b).sort() }, suggestedProducts: suggested, displayedProducts: filtered };
  }, [products, search, viewMode, favorites, lang, wishlist]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black bg-black text-primary animate-pulse tracking-tighter">INITIALIZING_TERMINAL...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-all duration-500">
      <TopBar theme={theme} lang={lang} onThemeToggle={handleThemeToggle} onLangChange={setLang} onShowHistory={() => setShowHistory(true)} />

      <main className="container mx-auto p-4 max-w-7xl mt-8 sm:mt-12">
        {/* 導航 Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-10 max-w-lg mx-auto border border-white/5 backdrop-blur-md">
          {[
            { id: 'product', label: 'ARSENAL', icon: Box },
            { id: 'favorite', label: 'VAULT', icon: Star },
            { id: 'parts', label: 'COMPONENTS', icon: Settings2 },
            { id: 'wishlist', label: 'INTEL', icon: ClipboardList }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as any)} className={`flex-1 py-3 rounded-lg text-[9px] font-black tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all ${viewMode === tab.id ? 'bg-primary text-white shadow-lg scale-105' : 'opacity-30 hover:opacity-100'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* 搜尋 */}
        {viewMode !== 'wishlist' && (
          <div className="relative mb-12 max-w-xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-all text-primary" />
            <Input 
              placeholder={`ENCRYPTED_SEARCH // ${lang.toUpperCase()}...`} 
              className="pl-12 h-14 rounded-xl bg-white/5 border-white/10 italic font-black text-sm bx-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* 視圖切換邏輯 */}
        {(viewMode === 'product' || viewMode === 'favorite') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map(p => (
              <div key={p.model} className="bx-card p-6 cursor-pointer group" onClick={() => setSelectedProduct(p)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-70">{p.type} SYSTEM</span>
                    <h3 className="metal-title text-4xl bx-title-black leading-none mt-1">{p.model}</h3>
                  </div>
                  <button onClick={(e) => toggleFav(p.model, e)} className={`${favorites.includes(p.model) ? 'text-yellow-500' : 'text-white/20'}`}>
                    <Star size={20} fill={favorites.includes(p.model) ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-white font-bold italic text-lg mb-8 line-clamp-1">{getName(p, 'main_blade')}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[11px]">
                  <span className="opacity-40 font-black uppercase tracking-widest">{p.data_get}</span>
                  <span className="text-xl font-black italic text-orange-400">¥{p.price_jpy?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'parts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableParts.bit.filter(b => b.toLowerCase().includes(search.toLowerCase())).map(bit => (
               <Card key={bit} className="p-6 rounded-2xl border-white/5 bg-white/5">
                 <h4 className="font-black text-primary mb-4 text-xl italic uppercase tracking-tighter flex items-center gap-2">
                   <Settings2 size={20}/> {bit}
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {products.filter(p => p.bit_code === bit).map(p => (
                     <button key={p.model} onClick={() => setSelectedProduct(p)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-primary/20 transition-all">
                       {p.model} <span className="text-white/40 ml-1 font-normal">{getName(p, 'main_blade')}</span>
                     </button>
                   ))}
                 </div>
               </Card>
            ))}
          </div>
        )}

        {viewMode === 'wishlist' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 bx-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 shadow-[0_0_15px_#3b82f6]"></div>
                <h3 className="font-black mb-5 text-blue-400 text-lg italic uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings2 size={18} /> Ratchet Pool
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {availableParts.ratchet.map(r => (
                    <button key={r} onClick={() => toggleWish('ratchet', r)} className={`px-3 py-1.5 rounded-lg text-[11px] font-black border transition-all ${wishlist.ratchet.includes(r) ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.6)] scale-105' : 'bg-white/5 border-white/10 text-white/40'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 bx-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 shadow-[0_0_15px_#a855f7]"></div>
                <h3 className="font-black mb-5 text-purple-400 text-lg italic uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings2 size={18} /> Bit Pool
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {availableParts.bit.map(b => (
                    <button key={b} onClick={() => toggleWish('bit', b)} className={`px-3 py-1.5 rounded-lg text-[11px] font-black border transition-all ${wishlist.bit.includes(b) ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.6)] scale-105' : 'bg-white/5 border-white/10 text-white/40'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {suggestedProducts.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-black text-orange-500 italic uppercase tracking-tighter flex items-center gap-2"><ShoppingBag size={20} /> <span className="metal-title">Intelligence Result</span></h3>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-orange-500/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggestedProducts.map(p => (
                    <div key={p.model} className="p-5 border border-white/10 bg-white/[0.03] rounded-xl relative cursor-pointer hover:border-orange-500/50 transition-all bx-card" onClick={() => setSelectedProduct(p)}>
                       <div className="absolute top-0 right-0 bg-orange-600/80 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg italic">MATCH {p.score}</div>
                       <h4 className="font-black text-2xl italic metal-title leading-none mt-1">{p.model}</h4>
                       <p className="text-sm font-bold text-white/80 mb-6 italic line-clamp-1">{getName(p, 'main_blade')}</p>
                       <div className="flex flex-wrap gap-1.5">
                         {p.matched.map(m => (
                           <span key={m} className="bg-green-600/20 text-green-400 border border-green-500/30 py-0.5 px-2 rounded text-[10px] font-black uppercase">{m}</span>
                         ))}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 彈窗：詳情 */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={() => setSelectedProduct(null)}>
          <Card className="w-full max-w-2xl bg-card border-white/10 rounded-[2rem] shadow-2xl overflow-hidden text-white" onClick={e => e.stopPropagation()}>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="font-black bg-primary mb-2 text-[10px]">BEYBLADE X // {selectedProduct.type}</Badge>
                  <div className="text-6xl bx-model-text">{selectedProduct.model}</div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl">
                   <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Localization</p>
                   {LANGUAGES.map(l => (
                     <div key={l.id} className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-primary">{l.label}</span>
                        <span className="text-sm font-bold">{getName(selectedProduct, 'main_blade', l.id)}</span>
                     </div>
                   ))}
                </div>
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl">
                   <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Specifications</p>
                   <div className="space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-xs font-bold opacity-40">Ratchet</span><span className="font-bold text-primary italic">{selectedProduct.ratchet || '---'}</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-xs font-bold opacity-40">Bit Code</span><span className="font-bold text-blue-400 italic">{selectedProduct.bit_code || '---'}</span></div>
                      <div className="flex justify-between"><span className="text-xs font-bold opacity-40">Source</span><span className="font-bold text-orange-400 uppercase">{selectedProduct.data_get}</span></div>
                   </div>
                </div>
              </div>
              {selectedProduct.notes && <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-sm italic opacity-50">" {selectedProduct.notes} "</div>}
              <div className="flex items-center justify-end pt-4 border-t border-white/10">
                {selectedProduct.price_jpy && <div className="text-5xl font-black italic text-orange-400">¥{selectedProduct.price_jpy.toLocaleString()}</div>}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 彈窗：歷史 */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowHistory(false)}>
          <Card className="w-full max-w-lg h-[70vh] flex flex-col p-8 rounded-[2rem] bg-card border-white/10 text-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black italic uppercase metal-title">Combat Update Log</h2><button onClick={() => setShowHistory(false)}><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {APP_VERSION_DATA.map((v, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-primary/20 pb-4">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <p className="font-black text-primary text-xs">{v.version} <span className="opacity-40 ml-2">{v.date}</span></p>
                  <p className="text-[11px] opacity-60 mt-2 bg-white/5 p-3 rounded-xl leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}