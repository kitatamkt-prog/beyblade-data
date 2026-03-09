import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import FilterSortBar from './components/FilterSortBar';
import ProductCard from './components/ProductCard';
import DetailModal from './components/DetailModal';
import IntelManager from './components/IntelManager'; 
import { LANGUAGES_DATA } from './config/languages';

export default function App() {
  const BASE_URL = import.meta.env.BASE_URL || "/";
  
  const [lang, setLang] = useState("zh_hk");
  const [theme, setTheme] = useState("dark");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ARSENAL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSeries, setCurrentSeries] = useState("all");
  const [currentGet, setCurrentGet] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const ui = useMemo(() => LANGUAGES_DATA[lang] || LANGUAGES_DATA.zh_hk, [lang]);

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

  const getDisplayName = (p: any, l: string) => {
    if (!p) return "";
    const name = `${p[`chip_${l}`] || ""}${p[`main_blade_${l}`] || ""}${p[`assist_blade_${l}`] || ""}`;
    return name.trim() || p.model;
  };

  // ✅ 核心修正：過濾邏輯
  const processedProducts = useMemo(() => {
    return products.filter((p) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      
      // 處理代號轉換
      let matchesGet = false;
      const g = p.data_get || "";
      if (currentGet === "all") matchesGet = true;
      else if (currentGet === "retail") matchesGet = (g === "通販");
      else if (currentGet === "app") matchesGet = (g === "A");
      else if (currentGet === "jp") matchesGet = (g === "J");
      else if (currentGet === "set") matchesGet = g.includes("×");
      else matchesGet = (g === currentGet);

      return matchesSearch && matchesSeries && matchesGet;
    });
  }, [products, searchTerm, currentSeries, currentGet, lang]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-cyan-400">LOADING_V2.0.1...</div>;

  return (
    <div className={`min-h-screen transition-all ${theme === 'light' ? 'bg-white text-black' : 'bg-[#050505] text-cyan-50'}`}>
      <Navbar lang={lang} theme={theme} onLangChange={setLang} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} systemName={ui.SYSTEM} />
      
      <main className="p-4 max-w-7xl mx-auto pb-24">
        {activeTab === "ARSENAL" ? (
          <>
            <input 
              className="w-full bg-transparent border-b-2 p-5 mb-6 font-black text-xl outline-none border-current opacity-70"
              placeholder={ui.QUERY} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
            />
            <FilterSortBar 
              currentSeries={currentSeries} currentGet={currentGet} getMethods={ui.GET_METHODS} uiStrings={ui} theme={theme}
              onSeriesChange={setCurrentSeries} onGetChange={setCurrentGet} onSort={()=>{}}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {processedProducts.map(p => (
                <ProductCard key={p.model} product={p} lang={lang} theme={theme} onClick={() => setSelectedProduct(p)} getDisplayName={getDisplayName} />
              ))}
            </div>
          </>
        ) : (
          <IntelManager products={products} lang={lang} theme={theme} uiStrings={ui} getDisplayName={getDisplayName} onProductClick={setSelectedProduct} />
        )}
      </main>

      {/* 底部導航 */}
      <div className={`fixed bottom-0 left-0 right-0 border-t-2 flex justify-around p-3 z-[100] backdrop-blur-md ${theme === 'light' ? 'bg-white border-black' : 'bg-black border-cyan-900/50'}`}>
        <button onClick={() => setActiveTab("ARSENAL")} className={`font-black uppercase ${activeTab === "ARSENAL" ? 'text-cyan-400' : 'opacity-40'}`}>{ui.ARSENAL}</button>
        <button onClick={() => setActiveTab("INTEL")} className={`font-black uppercase ${activeTab === "INTEL" ? 'text-cyan-400' : 'opacity-40'}`}>{ui.INTEL}</button>
      </div>
    </div>
  );
}