/* --- ASSETS/JS/CORE.JS --- */

/**
 * SELAH CORE - Gerenciamento de Dados e Estado
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
    
    // Simula a existência de subjects para manter compatibilidade com engine legado se necessário
    subjects: [REFLECTION_SUBJECT], 

    load: (fromCloudData = null) => {
        if (fromCloudData) {
            store.reviews = fromCloudData.reviews || [];
        } else {
            const raw = localStorage.getItem(CONFIG.storageKey);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    store.reviews = data.reviews || [];
                } catch (e) { store.reviews = []; }
            }
        }
        if (typeof ui !== 'undefined') ui.render();
    },

    save: () => {
        const dataToSave = { reviews: store.reviews, lastUpdate: new Date().toISOString() };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
        
        if (store.currentUser && window.fireMethods && window.fireDb) {
            const { ref, set } = window.fireMethods;
            set(ref(window.fireDb, 'users/' + store.currentUser.uid), dataToSave);
        }
    },

    // --- Ações de Review ---
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        store.save();
        if (typeof ui !== 'undefined') ui.render();
    },

    toggleStatus: (id) => {
        const r = store.reviews.find(r => r.id.toString() === id.toString());
        if (r) {
            r.status = r.status === 'PENDING' ? 'DONE' : 'PENDING';
            store.save(); 
            if (typeof ui !== 'undefined') {
                ui.render();
                ui.renderHeatmap(); // Atualiza o radar se aberto
            }
        }
    },

    deleteReview: (id) => {
        store.reviews = store.reviews.filter(r => r.id !== id);
        store.save();
        if (typeof ui !== 'undefined') ui.render();
    },

    deleteBatch: (batchId) => {
        store.reviews = store.reviews.filter(r => r.batchId !== batchId);
        store.save();
        if (typeof ui !== 'undefined') ui.render();
    },

    // --- Anexos HTML ---
    attachSummary: (id, htmlContent) => {
        const target = store.reviews.find(r => r.id.toString() === id.toString());
        if (target) {
            const apply = (r) => { r.htmlSummary = htmlContent; };
            if (target.batchId) {
                store.reviews.forEach(r => { if (r.batchId === target.batchId) apply(r); });
            } else { apply(target); }
            store.save();
            if (typeof ui !== 'undefined') ui.render();
            toast.show('Resumo anexado à reflexão.', 'success');
        }
    },

    getSummary: (id) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        return review ? review.htmlSummary : null;
    },

    deleteSummary: (id) => {
        const target = store.reviews.find(r => r.id.toString() === id.toString());
        if(target) {
            const remove = (r) => delete r.htmlSummary;
            if (target.batchId) {
                 store.reviews.forEach(r => { if (r.batchId === target.batchId) remove(r); });
            } else { remove(target); }
            store.save();
            ui.render();
            toast.show('Resumo removido.');
        }
    },

    updateReviewLink: (id, link) => {
        const r = store.reviews.find(i => i.id === id);
        if(r) {
            if(r.batchId) {
                store.reviews.forEach(item => { if(item.batchId === r.batchId) item.link = link; });
            } else { r.link = link; }
            store.save();
            ui.render();
        }
    }
};
