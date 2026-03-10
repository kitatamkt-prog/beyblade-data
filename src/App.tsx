import { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import FilterSortBar from './components/FilterSortBar';
import ProductCard from './components/ProductCard';
import DetailModal from './components/DetailModal';
import IntelManager from './components/IntelManager'; 
import { LANGUAGES_DATA } from './config/languages';

export default function App() {
  const BASE_URL = import.meta.env.BASE_URL || "/";
  
  // --- 1. States ---
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
  const [favorites, setFavorites] = useState<string[]>(() => {
    const s = localStorage.getItem("bey_favs");
    return s ? JSON.parse(s) : [];
  });

  const ui = useMemo(() => LANGUAGES_DATA[lang] || LANGUAGES_DATA.zh_hk, [lang]);

  // --- 2. Logic Helpers (定義在 return 之前) ---
  const getC = (p: any, key: string, l: string) => {
    if (!p) return "";
    return p[`${key}_${l}`] || p[`${key}_zh_hk`] || "";
  };

  const getDisplayName = (p: any, l: string) => {
    if (!p) return "";
    const name = `${getC(p, 'chip', l)}${getC(p, 'main_blade', l)}${getC(p, 'assist_blade', l)}`;
    return name.trim() || p.model;
  };

  const handleToggleFav = (e: any, model: string) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]);
  };

  // --- 3. Data Sync ---
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

  // --- 4. Filter Logic ---
  const processedProducts = useMemo(() => {
    return products.filter((p) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      
      let matchesGet = false;
      const g = p.data_get || "";
      if (currentGet === "all") matchesGet = true;
      else if (currentGet === "retail") matchesGet = (g === "通販");
      else if (currentGet === "app") matchesGet = (g === "A");
      else if (currentGet === "jp") matchesGet = (g === "J");
      else if (currentGet === "set") matchesGet = g.includes('×');
      else matchesGet = (g === currentGet);

      const matchesFav = !showFavOnly || favorites.includes(p.model);
      return matchesSearch && matchesSeries && matchesGet && matchesFav;
    });
  }, [products, searchTerm, currentSeries, currentGet, showFavOnly, lang, favorites]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-cyan-400 font-black italic">VER_2.0.1_STABLE...</div>;

  return (
    <div className={`min-h-screen transition-all ${theme === 'light' ? 'bg-white text-black' : 'bg-[#050505] text-cyan-50'}`}>
      <Navbar lang={lang} theme={theme} onLangChange={setLang} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} systemName={ui.SYSTEM} />
      
      <main className="p-4 max-w-7xl mx-auto pb-24">
        {activeTab === "ARSENAL" ? (
          <>
            <input 
              id="search-box" name="search"
              className="w-full bg-transparent border-b-2 p-5 mb-6 font-black text-xl outline-none border-current opacity-70"
              placeholder={ui.QUERY} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
            />
            <FilterSortBar 
              currentSeries={currentSeries} currentGet={currentGet} showFavOnly={showFavOnly}
              getMethods={ui.GET_METHODS} uiStrings={ui} theme={theme}
              onSeriesChange={setCurrentSeries} onGetChange={setCurrentGet} onFavToggle={() => setShowFavOnly(!showFavOnly)} onSort={()=>{}}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Footer Tabs */}
      <div className={`fixed bottom-0 left-0 right-0 border-t-2 flex justify-around p-3 z-[100] backdrop-blur-md ${theme === 'light' ? 'bg-white border-black' : 'bg-black border-cyan-900/50'}`}>
        <button onClick={() => setActiveTab("ARSENAL")} className={`font-black uppercase px-6 py-2 transition-all ${activeTab === "ARSENAL" ? 'text-cyan-400' : 'opacity-40'}`}>{ui.ARSENAL}</button>
        <button onClick={() => setActiveTab("INTEL")} className={`font-black uppercase px-6 py-2 transition-all ${activeTab === "INTEL" ? 'text-cyan-400' : 'opacity-40'}`}>{ui.INTEL}</button>
      </div>
    </div>
  );
}