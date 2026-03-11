import { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import FilterSortBar from './components/FilterSortBar';
import ProductCard from './components/ProductCard';
import DetailModal from './components/DetailModal';
import IntelManager from './components/IntelManager'; 
import { LANGUAGES_DATA } from './config/languages';

export default function App() {
  const BASE_URL = import.meta.env.BASE_URL || "/";
  
  // --- 狀態定義 ---
  const [lang, setLang] = useState("zh_hk");
  const [theme, setTheme] = useState("dark");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ARSENAL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSeries, setCurrentSeries] = useState("all");
  const [currentGet, setCurrentGet] = useState("all");
  const [showFavOnly, setShowFavOnly] = useState(false);

  // ✅ 核心修正：補回排序狀態
  const [sortKey, setSortKey] = useState("model");   
  const [sortOrder, setSortOrder] = useState("asc"); 

  const [favorites, setFavorites] = useState<string[]>(() => {
    const s = localStorage.getItem("bey_favs");
    return s ? JSON.parse(s) : [];
  });

  const ui = useMemo(() => LANGUAGES_DATA[lang] || LANGUAGES_DATA.zh_hk, [lang]);

  // --- 工具函式 ---
  const getC = (p: any, key: string, l: string) => {
    if (!p) return "";
    return p[`${key}_${l}`] || p[`${key}_zh_hk`] || "";
  };

  const getDisplayName = (p: any, l: string) => {
    if (!p) return "";
    if (p.chip_zh_hk || p.chip_en) {
      return `${getC(p, 'chip', l)}${getC(p, 'main_blade', l)}${getC(p, 'assist_blade', l)}`.trim();
    }
    return p[`main_blade_${l}`] || p.main_blade_zh_hk || p.model;
  };

  const handleToggleFav = (e: any, model: string) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
  };

  // --- 數據加載 ---
  useEffect(() => {
    async function fetchData() {
      try {
        const t = Date.now();
        const res = await fetch(`${BASE_URL}beyblade_product_master.json?t=${t}`).then(r => r.json());
        setProducts(res);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [BASE_URL]);

  useEffect(() => {
    localStorage.setItem("bey_favs", JSON.stringify(favorites));
  }, [favorites]);

  // --- 核心過濾與排序邏輯 (模仿 go-shoot 效率) ---
  const processedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      let matchesGet = currentGet === "all" || (p.data_get && (
        (currentGet === "retail" && p.data_get === "通販") ||
        (currentGet === "app" && p.data_get === "A") ||
        (currentGet === "jp" && p.data_get === "J") ||
        (currentGet === "set" && p.data_get.includes('×'))
      ));
      const matchesFav = !showFavOnly || favorites.includes(p.model);
      return matchesSearch && matchesSeries && matchesGet && matchesFav;
    });

    // 執行排序
    return [...filtered].sort((a, b) => {
      const valA = String(a[sortKey] || "");
      const valB = String(b[sortKey] || "");
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  }, [products, searchTerm, currentSeries, currentGet, showFavOnly, lang, favorites, sortKey, sortOrder]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-cyan-400 font-black italic select-none">SYSTEM_REBOOTING_v2.0.4...</div>;

  return (
    <div className={`min-h-screen transition-all ${theme === 'light' ? 'bg-white text-black' : 'bg-[#050505] text-cyan-50'}`}>
      <Navbar lang={lang} theme={theme} onLangChange={setLang} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} systemName={ui.SYSTEM} />
      
      <main className="p-4 max-w-7xl mx-auto pb-24">
        {activeTab === "ARSENAL" ? (
          <>
            <input 
              className="w-full bg-transparent border-b-2 p-5 mb-6 font-black text-xl outline-none border-current opacity-70 focus:opacity-100 transition-all"
              placeholder={ui.QUERY} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
            />
            <FilterSortBar 
              currentSeries={currentSeries} currentGet={currentGet} showFavOnly={showFavOnly}
              getMethods={ui.GET_METHODS} uiStrings={ui} theme={theme}
              sortKey={sortKey} sortOrder={sortOrder}
              onSeriesChange={setCurrentSeries} onGetChange={setCurrentGet} onFavToggle={() => setShowFavOnly(!showFavOnly)} 
              onSort={(key: string) => {
                if (sortKey === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortKey(key); setSortOrder('asc'); }
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {processedProducts.map(p => (
                <ProductCard key={p.model} product={p} lang={lang} theme={theme} isFav={favorites.includes(p.model)} onToggleFav={handleToggleFav} onClick={() => setSelectedProduct(p)} getDisplayName={getDisplayName} />
              ))}
            </div>
          </>
        ) : (
          <IntelManager products={products} lang={lang} theme={theme} ui={ui} getDisplayName={getDisplayName} onProductClick={setSelectedProduct} />
        )}
      </main>

      {selectedProduct && (
        <DetailModal product={selectedProduct} lang={lang} theme={theme} isFav={favorites.includes(selectedProduct.model)} onToggleFav={handleToggleFav} onClose={() => setSelectedProduct(null)} getDisplayName={getDisplayName} getC={getC} uiStrings={ui} />
      )}

      {/* 底部 Tab */}
      <div className={`fixed bottom-0 left-0 right-0 border-t-2 flex justify-around p-3 z-[100] backdrop-blur-md ${theme === 'light' ? 'bg-white border-black' : 'bg-black border-cyan-900/50'}`}>
        <button onClick={() => setActiveTab("ARSENAL")} className={`font-black uppercase px-6 py-2 transition-all ${activeTab === "ARSENAL" ? 'text-cyan-400 shadow-glow' : 'opacity-40'}`}>{ui.ARSENAL}</button>
        <button onClick={() => setActiveTab("INTEL")} className={`font-black uppercase px-6 py-2 transition-all ${activeTab === "INTEL" ? 'text-cyan-400 shadow-glow' : 'opacity-40'}`}>{ui.INTEL}</button>
      </div>
      <style>{`.shadow-glow { filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.5)); }`}</style>
    </div>
  );
}