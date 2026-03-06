// ==================== 全域變數 ====================
const app = {
    // 數據
    products: [],
    
    // 狀態
    currentSeries: 'all',
    currentPart: 'all',
    currentGet: 'all',
    searchTerm: '',
    currentLang: 'zh_hk',
    sortMode: 'model',
    sortOrder: 'asc',
    
    // 數據來源
    dataUrl: 'beyblade_db.json',
    
    // ==================== 初始化 ====================
    init: function() {
        this.loadData();
        this.bindEvents();
    },
    
    // ==================== 綁定事件 ====================
    bindEvents: function() {
        // Dark Mode
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        
        // 語言下拉選單
        this.setupLangDropdown();
        
        // 零件篩選下拉選單
        this.setupDropdown('partButton', 'partMenu', 'dropdown-item[data-part]', (item) => {
            const part = item.dataset.part;
            document.getElementById('selectedPart').innerHTML = item.innerHTML;
            this.currentPart = part;
            this.render();
        });
        
        // 入手方式下拉選單
        this.setupDropdown('getButton', 'getMenu', 'dropdown-item[data-get]', (item) => {
            const get = item.dataset.get;
            document.getElementById('selectedGet').innerHTML = item.innerHTML;
            this.currentGet = get;
            this.render();
        });
        
        // 系列篩選
        document.querySelectorAll('#seriesFilter .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#seriesFilter .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSeries = btn.dataset.type;
                this.render();
            });
        });
        
        // 排序按鈕
        document.getElementById('sortModel').addEventListener('click', (e) => this.handleSort(e.target.closest('.sort-btn'), 'model'));
        document.getElementById('sortRatchet').addEventListener('click', (e) => this.handleSort(e.target.closest('.sort-btn'), 'ratchet'));
        document.getElementById('sortBit').addEventListener('click', (e) => this.handleSort(e.target.closest('.sort-btn'), 'bit'));
        
        // 搜尋輸入
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.render();
        });
    },
    
    // ==================== Dark Mode ====================
    toggleDarkMode: function() {
        const body = document.body;
        const btn = document.getElementById('darkModeToggle');
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            btn.innerHTML = '🌙 深色';
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            btn.innerHTML = '☀️ 亮色';
        }
    },
    
    // ==================== 語言下拉選單 ====================
    setupLangDropdown: function() {
        const button = document.getElementById('langButton');
        const menu = document.getElementById('langMenu');
        const selected = document.getElementById('selectedLang');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => menu.classList.remove('show'));
        menu.addEventListener('click', (e) => e.stopPropagation());
        
        document.querySelectorAll('.lang-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.lang-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.currentLang = item.dataset.lang;
                selected.innerHTML = item.innerHTML;
                menu.classList.remove('show');
                this.render();
            });
        });
    },
    
    // ==================== 通用下拉選單 ====================
    setupDropdown: function(buttonId, menuId, itemSelector, callback) {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m.id !== menuId) m.classList.remove('show');
            });
            menu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => menu.classList.remove('show'));
        menu.addEventListener('click', (e) => e.stopPropagation());
        
        document.querySelectorAll(itemSelector).forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll(itemSelector).forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                callback(item);
                menu.classList.remove('show');
            });
        });
    },
    
    // ==================== 排序處理 ====================
    handleSort: function(clickedBtn, mode) {
        const currentActive = document.querySelector('.sort-btn.active');
        const orderSpan = clickedBtn.querySelector('.sort-direction');
        
        if (currentActive && currentActive.id === clickedBtn.id) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            if (currentActive) currentActive.classList.remove('active');
            clickedBtn.classList.add('active');
            this.sortMode = mode;
            this.sortOrder = 'asc';
        }
        
        document.querySelectorAll('.sort-btn').forEach(btn => {
            const span = btn.querySelector('.sort-direction');
            if (btn.id === clickedBtn.id) {
                span.innerHTML = this.sortOrder === 'asc' ? '↑' : '↓';
            } else {
                span.innerHTML = '↑';
            }
        });
        
        this.render();
    },
    
    // ==================== 載入數據 ====================
    loadData: async function() {
        const listEl = document.getElementById('productList');
        const dataCountEl = document.getElementById('dataCount');
        const updateTimeEl = document.getElementById('updateTime');
        
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.products = Array.isArray(data) ? data : [];
            
            // 加入零件類型標記
            this.products = this.products.map(p => {
                if (!p.part_type) {
                    if (p.type === 'CX') {
                        p.part_type = 'blade';
                    } else if (p.ratchet && p.ratchet !== '') {
                        p.part_type = 'ratchet';
                    } else if (p.bit_code) {
                        p.part_type = 'bit';
                    } else {
                        p.part_type = 'blade';
                    }
                }
                return p;
            });
            
            dataCountEl.textContent = this.products.length;
            updateTimeEl.innerHTML = `最後更新: ${new Date().toLocaleString('zh-HK')} (共 ${this.products.length} 項)`;
            
            this.updateStats();
            this.render();
            
        } catch (error) {
            listEl.innerHTML = `
                <div style="text-align:center; padding:40px; color:#cc0000;">
                    <h3>📛 無法載入數據</h3>
                    <p>${this.escapeHTML(error.message)}</p>
                    <p>請確保 <code>beyblade_db.json</code> 同 HTML 放埋一齊</p>
                    <button class="filter-btn" style="margin-top:20px;" onclick="location.reload()">🔄 重試</button>
                </div>
            `;
        }
    },
    
    // ==================== 更新統計 ====================
    updateStats: function() {
        const total = this.products.length;
        const bx = this.products.filter(p => p.type === 'BX').length;
        const ux = this.products.filter(p => p.type === 'UX').length;
        const cx = this.products.filter(p => p.type === 'CX').length;
        
        document.getElementById('stats').innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${total}</div>
                <div class="stat-label">總數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${bx}</div>
                <div class="stat-label">BX</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${ux}</div>
                <div class="stat-label">UX</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${cx}</div>
                <div class="stat-label">CX</div>
            </div>
        `;
    },
    
    // ==================== 輔助函數 ====================
    escapeHTML: function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    },
    
    getNameByLang: function(product, field) {
        if (field === 'chip') {
            return product[`chip_${this.currentLang}`] || product.chip_zh_hk || product.chip_en || '';
        }
        if (field === 'main') {
            return product[`main_blade_${this.currentLang}`] || product.main_blade_zh_hk || '';
        }
        if (field === 'metal') {
            return product[`metal_${this.currentLang}`] || product.metal_zh_hk || '';
        }
        if (field === 'over') {
            return product[`over_${this.currentLang}`] || product.over_zh_hk || '';
        }
        if (field === 'assist') {
            return product[`assist_blade_${this.currentLang}`] || product.assist_blade_zh_hk || '';
        }
        if (field === 'bit') {
            return product[`bit_name_${this.currentLang}`] || product.bit_name_zh_hk || product.bit_name_en || '';
        }
        return '';
    },
    
    getDataGetClass: function(dataGet) {
        if (!dataGet || dataGet === '') return 'data-get-t';
        if (dataGet === 'A') return 'data-get-a';
        if (dataGet === 'J') return 'data-get-j';
        if (dataGet.match(/^×\d+$/)) return 'data-get-box';
        return 'data-get-t';
    },
    
    getDataGetDisplay: function(dataGet) {
        if (!dataGet || dataGet === '') return '📦 通販';
        if (dataGet === 'A') return '📱 App';
        if (dataGet === 'J') return '🇯🇵 日本';
        if (dataGet === '×3') return '🎲 3入';
        if (dataGet === '×4') return '🎲 4入';
        if (dataGet === '×5') return '🎲 5入';
        if (dataGet === '×8') return '🎲 8入';
        if (dataGet === '×12') return '🎲 12入';
        return '📦 通販';
    },
    
    // ==================== 過濾產品 ====================
    getFilteredProducts: function() {
        return this.products.filter(p => {
            if (this.currentSeries !== 'all' && p.type !== this.currentSeries) return false;
            if (this.currentPart !== 'all' && p.part_type !== this.currentPart) return false;
            
            if (this.currentGet !== 'all') {
                if (this.currentGet === 'A' && p.data_get !== 'A') return false;
                if (this.currentGet === 'J' && p.data_get !== 'J') return false;
                if (this.currentGet === 'T' && p.data_get && p.data_get !== '') return false;
                if (this.currentGet === 'box' && (!p.data_get || !p.data_get.match(/^×\d+$/))) return false;
            }
            
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                return (p.model && p.model.toLowerCase().includes(term)) ||
                       (p.main_blade_zh_hk && p.main_blade_zh_hk.toLowerCase().includes(term)) ||
                       (p.main_blade_en && p.main_blade_en.toLowerCase().includes(term)) ||
                       (p.chip_zh_hk && p.chip_zh_hk.toLowerCase().includes(term)) ||
                       (p.assist_blade_code && p.assist_blade_code.toLowerCase().includes(term)) ||
                       (p.ratchet && p.ratchet.toLowerCase().includes(term)) ||
                       (p.bit_code && p.bit_code.toLowerCase().includes(term));
            }
            return true;
        });
    },
    
    // ==================== 排序產品 ====================
    sortProducts: function(productsToSort) {
        const sorted = [...productsToSort];
        
        sorted.sort((a, b) => {
            let compareResult = 0;
            
            if (this.sortMode === 'model') {
                compareResult = a.model.localeCompare(b.model);
            } else if (this.sortMode === 'ratchet') {
                const aVal = a.ratchet || '';
                const bVal = b.ratchet || '';
                if (aVal && bVal) {
                    compareResult = aVal.localeCompare(bVal);
                } else if (aVal) {
                    compareResult = -1;
                } else if (bVal) {
                    compareResult = 1;
                }
            } else if (this.sortMode === 'bit') {
                const aVal = a.bit_code || '';
                const bVal = b.bit_code || '';
                if (aVal && bVal) {
                    compareResult = aVal.localeCompare(bVal);
                } else if (aVal) {
                    compareResult = -1;
                } else if (bVal) {
                    compareResult = 1;
                }
            }
            
            return this.sortOrder === 'asc' ? compareResult : -compareResult;
        });
        
        return sorted;
    },
    
    // ==================== 渲染 ====================
    render: function() {
        let filtered = this.getFilteredProducts();
        filtered = this.sortProducts(filtered);
        
        const listEl = document.getElementById('productList');
        
        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="loading-message">🔍 沒有符合的產品</div>';
            return;
        }
        
        let html = '';
        filtered.forEach(p => {
            const chipName = this.escapeHTML(this.getNameByLang(p, 'chip'));
            const mainName = this.escapeHTML(this.getNameByLang(p, 'main'));
            const metalName = this.escapeHTML(this.getNameByLang(p, 'metal'));
            const overName = this.escapeHTML(this.getNameByLang(p, 'over'));
            const assistName = this.escapeHTML(this.getNameByLang(p, 'assist'));
            const assistCode = p.assist_blade_code ? this.escapeHTML(p.assist_blade_code) : '';
            const bitName = this.escapeHTML(this.getNameByLang(p, 'bit'));
            
            let nameHtml = '';
            let tags = '';
            let assistCodeHtml = '';
            
            if (p.type === 'CX') {
                const parts = [];
                if (chipName) parts.push(chipName);
                if (mainName) parts.push(mainName);
                if (metalName) parts.push(metalName);
                if (overName) parts.push(overName);
                if (assistName) parts.push(assistName);
                nameHtml = parts.join(' · ');
                
                if (assistCode) {
                    assistCodeHtml = `<span class="product-assist-code">🔪 ${assistCode}</span>`;
                }
                
                if (metalName) {
                    tags += `<span class="product-tag">⚙️ ${metalName}</span>`;
                }
                if (overName) {
                    tags += `<span class="product-tag">⬆️ ${overName}</span>`;
                }
            } else {
                nameHtml = mainName;
            }
            
            const dataGetClass = this.getDataGetClass(p.data_get);
            const dataGetDisplay = this.getDataGetDisplay(p.data_get);
            
            html += `
                <div class="product-card ${this.escapeHTML(p.type)}" onclick="app.showDetail('${this.escapeHTML(p.model)}')">
                    <div class="product-header">
                        <span class="product-model">${this.escapeHTML(p.model)} ${assistCodeHtml}</span>
                        <span class="product-type">${this.escapeHTML(p.type)}</span>
                    </div>
                    <div class="product-name">${nameHtml}</div>
                    ${tags ? `<div class="product-tags">${tags}</div>` : ''}
                    <div class="product-specs">
                        ${p.ratchet ? `<span>⚙️ ${this.escapeHTML(p.ratchet)}</span>` : ''}
                        ${p.bit_code ? `<span>🔰 ${this.escapeHTML(p.bit_code)}</span>` : ''}
                        ${bitName ? `<span>${bitName}</span>` : ''}
                    </div>
                    <div class="product-footer">
                        <span class="data-get-badge ${dataGetClass}">${this.escapeHTML(dataGetDisplay)}</span>
                    </div>
                </div>
            `;
        });
        
        listEl.innerHTML = html;
    },
    
    // ==================== 顯示詳細 ====================
    showDetail: function(model) {
        const product = this.products.find(p => p.model === model);
        if (!product) return;
        
        const dataGetClass = this.getDataGetClass(product.data_get);
        const dataGetDisplay = this.getDataGetDisplay(product.data_get);
        
        let content = `
            <span class="close-btn" onclick="app.hideDetail()">&times;</span>
            <h2 style="margin-top:0;">${this.escapeHTML(product.model)}</h2>
            <div style="display:flex; gap:8px; margin-bottom:16px;">
                <span style="background:var(--badge-bg); padding:4px 12px; border-radius:20px;">${this.escapeHTML(product.type)} 系列</span>
                <span style="background:var(--badge-bg); padding:4px 12px; border-radius:20px;">零件: ${this.escapeHTML(product.part_type)}</span>
            </div>
        `;
        
        if (product.type === 'CX' && product.chip_zh_hk) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">📝 本體名稱 (Chip)</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.chip_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.chip_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.chip_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.chip_jp) || '—'}</div>
                </div>
            `;
        }
        
        if (product.metal_zh_hk) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">⚙️ Metal</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.metal_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.metal_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.metal_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.metal_jp) || '—'}</div>
                </div>
            `;
        }
        
        if (product.over_zh_hk) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">⬆️ Over</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.over_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.over_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.over_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.over_jp) || '—'}</div>
                </div>
            `;
        }
        
        if (product.main_blade_zh_hk) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">⚔️ 主 blade</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.main_blade_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.main_blade_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.main_blade_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.main_blade_jp) || '—'}</div>
                </div>
            `;
        }
        
        if (product.assist_blade_zh_hk) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">🔪 輔助刀 (Assist Blade)</div>
                    <div><strong>代碼:</strong> ${this.escapeHTML(product.assist_blade_code) || '—'}</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.assist_blade_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.assist_blade_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.assist_blade_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.assist_blade_jp) || '—'}</div>
                </div>
            `;
        }
        
        if (product.ratchet) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">⚙️ Ratchet</div>
                    <div style="font-size:1.2rem;">${this.escapeHTML(product.ratchet)}</div>
                </div>
            `;
        }
        
        if (product.bit_code) {
            content += `
                <div class="detail-section">
                    <div class="detail-title">🔰 Bit</div>
                    <div><strong>代碼:</strong> ${this.escapeHTML(product.bit_code)}</div>
                    <div><span class="lang-tag">🇭🇰 港</span> ${this.escapeHTML(product.bit_name_zh_hk) || '—'}</div>
                    <div><span class="lang-tag">🇨🇳 台</span> ${this.escapeHTML(product.bit_name_zh_tw) || '—'}</div>
                    <div><span class="lang-tag">🇬🇧 英</span> ${this.escapeHTML(product.bit_name_en) || '—'}</div>
                    <div><span class="lang-tag">🇯🇵 日</span> ${this.escapeHTML(product.bit_name_jp) || '—'}</div>
                </div>
            `;
        }
        
        content += `
            <div class="detail-section">
                <div class="detail-title">📦 入手方式</div>
                <div class="data-get-info ${dataGetClass}">${this.escapeHTML(dataGetDisplay)}</div>
            </div>
        `;
        
        document.getElementById('modalContent').innerHTML = content;
        document.getElementById('detailModal').classList.add('show');
    },
    
    // ==================== 隱藏詳細 ====================
    hideDetail: function() {
        document.getElementById('detailModal').classList.remove('show');
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 檢查 Dark Mode 偏好
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '☀️ 亮色';
    }
    
    // 啟動 App
    window.app = app;
    app.init();
});
