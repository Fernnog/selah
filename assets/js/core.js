/* --- ASSETS/JS/CORE.JS --- */

/**
 * SELAH CORE - Gerenciamento de Dados e Estado (Sincronizado)
 */

const CONFIG = {
    storageKey: 'selah_db_v1',
    // Ciclo de Reflexão: 24h, 7 dias, 30 dias
    intervals: [1, 7, 30] 
};

// Matéria Única e Imutável (Backend interno)
const REFLECTION_SUBJECT = { id: 'ref_main', name: 'Reflexão', color: '#b45309' }; // Amber-700

// Utilitários de Data
const getLocalISODate = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getRelativeDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return getLocalISODate(date);
};

const formatDateDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}`;
};

// --- TOAST SYSTEM ---
const toast = {
    show: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if(!container) return; 
        
        const el = document.createElement('div');
        el.className = `bg-white border-l-4 p-4 rounded shadow-lg flex items-center gap-3 min-w-[300px] text-sm animate-fade-in ${type === 'success' ? 'border-emerald-500 text-emerald-800' : 'border-stone-500 text-stone-800'}`;
        
        el.innerHTML = `<span class="font-bold">${message}</span>`;
        container.appendChild(el);
        
        setTimeout(() => el.remove(), 4000);
    }
};

// --- STORE ---
const store = {
    reviews: [],
    currentUser: null,
    // Referência para desligar o listener do banco ao deslogar
    dbUnsubscribe: null, 
    
    // Simula a existência de subjects para manter compatibilidade com engine legado
    subjects: [REFLECTION_SUBJECT], 

    load: (fromCloudData = null) => {
        if (fromCloudData) {
            // Prioridade: Dados da Nuvem
            console.log("☁️ Dados carregados da nuvem.");
            store.reviews = fromCloudData.reviews || [];
        } else {
            // Fallback: Dados Locais (Offline)
            const raw = localStorage.getItem(CONFIG.storageKey);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    store.reviews = data.reviews || [];
                } catch (e) { store.reviews = []; }
            }
        }

        if (typeof ui !== 'undefined') {
            ui.render();
            // Atualiza o Heatmap se o modal estiver aberto ou apenas para garantir consistência
            const heatmapModal = document.getElementById('modal-heatmap');
            if (ui.renderHeatmap && heatmapModal && !heatmapModal.classList.contains('hidden')) {
                ui.renderHeatmap();
            }
        }
    },

    save: () => {
        const dataToSave = { reviews: store.reviews, lastUpdate: new Date().toISOString() };
        
        // 1. Salva Localmente (Backup imediato e persistência offline)
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
        
        // 2. Salva na Nuvem (Apenas se o usuário estiver autenticado)
        if (store.currentUser && window.fireMethods && window.fireDb) {
            const { ref, set } = window.fireMethods;
            const userPath = 'users/' + store.currentUser.uid;
            
            set(ref(window.fireDb, userPath), dataToSave)
                .then(() => console.log("☁️ Sincronizado com sucesso"))
                .catch(err => console.error("Erro ao sincronizar com a nuvem", err));
        }
    },

    // --- Ações de Review ---
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        store.save(); // Dispara persistência local e remota
        if (typeof ui !== 'undefined') ui.render();
    },

    toggleStatus: (id) => {
        const r = store.reviews.find(r => r.id.toString() === id.toString());
        if (r) {
            r.status = r.status === 'PENDING' ? 'DONE' : 'PENDING';
            store.save(); 
            if (typeof ui !== 'undefined') {
                ui.render();
                if (ui.renderHeatmap) ui.renderHeatmap(); 
            }
        }
    },

    deleteReview: (id) => {
        if(!confirm("Deseja excluir esta reflexão?")) return;
        store.reviews = store.reviews.filter(r => r.id !== id);
        store.save();
        if (typeof ui !== 'undefined') ui.render();
        toast.show('Reflexão removida.');
    },

    deleteBatch: (batchId) => {
        if(!confirm("Deseja excluir todo o ciclo de reflexões?")) return;
        store.reviews = store.reviews.filter(r => r.batchId !== batchId);
        store.save();
        if (typeof ui !== 'undefined') ui.render();
        toast.show('Ciclo removido.');
    },

    // --- Anexos HTML (Funcionalidade de Sumário) ---
    attachSummary: (id, htmlContent) => {
        const target = store.reviews.find(r => r.id.toString() === id.toString());
        if (target) {
            const apply = (r) => { r.htmlSummary = htmlContent; };
            
            // Propaga para o ciclo (batch) se existir
            if (target.batchId) {
                store.reviews.forEach(r => { if (r.batchId === target.batchId) apply(r); });
            } else { 
                apply(target); 
            }
            
            store.save();
            if (typeof ui !== 'undefined') ui.render();
            toast.show('Resumo anexado com sucesso!', 'success');
        }
    },

    getSummary: (id) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        return review ? review.htmlSummary : null;
    },

    deleteSummary: (id) => {
        if(!confirm("Remover o anexo HTML desta reflexão?")) return;
        
        const target = store.reviews.find(r => r.id.toString() === id.toString());
        if(target) {
            const remove = (r) => delete r.htmlSummary;
            
            if (target.batchId) {
                 store.reviews.forEach(r => { if (r.batchId === target.batchId) remove(r); });
            } else { 
                remove(target); 
            }
            
            store.save();
            if (typeof ui !== 'undefined') ui.render();
            toast.show('Anexo removido.');
        }
    },

    updateReviewLink: (id, link) => {
        const r = store.reviews.find(i => i.id === id);
        if(r) {
            if(r.batchId) {
                store.reviews.forEach(item => { if(item.batchId === r.batchId) item.link = link; });
            } else { 
                r.link = link; 
            }
            store.save();
            if (typeof ui !== 'undefined') ui.render();
            toast.show('Link atualizado.', 'success');
        }
    }
};

window.store = store;
