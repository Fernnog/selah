/* --- ASSETS/JS/VIEW.JS --- */
/**
 * UI RENDERER - Camada Visual Selah
 */

const ui = {
    // Navegação (Abas Mobile e Colunas Desktop)
    switchTab: (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'text-amber-600', 'border-amber-600'));
        const btn = document.getElementById(`tab-${tabName}`);
        if(btn) btn.classList.add('active', 'text-amber-600', 'border-amber-600');

        document.querySelectorAll('.kanban-column').forEach(c => {
            c.classList.remove('flex');
            c.classList.add('hidden');
        });

        const activeCol = document.getElementById(`col-${tabName}`);
        if(activeCol) {
            activeCol.classList.remove('hidden');
            activeCol.classList.add('flex');
        }
    },

    toggleModal: (id, show) => {
        const el = document.getElementById(id);
        if(!el) return;
        show ? el.classList.remove('hidden') : el.classList.add('hidden');
    },

    openHeatmapModal: () => {
        ui.renderHeatmap();
        ui.toggleModal('modal-heatmap', true);
    },

    renderHeatmap: () => {
        const container = document.getElementById('heatmap-grid');
        if(!container) return;
        container.innerHTML = '';
        
        // Renderiza próximos 30 dias
        for (let i = 0; i < 30; i++) {
            const isoDate = getRelativeDate(i);
            const displayDate = formatDateDisplay(isoDate);
            
            const dayStudies = store.reviews.filter(r => r.date === isoDate);
            const count = dayStudies.length;
            
            // Lógica visual simples: Tem reflexão? Pinta.
            let bgClass = count > 0 ? 'bg-amber-100 border-amber-300' : 'bg-stone-100 border-stone-200 opacity-50';
            if (count > 3) bgClass = 'bg-amber-200 border-amber-400';
            
            const dots = dayStudies.map(() => `<div class="w-1.5 h-1.5 rounded-full bg-amber-600"></div>`).join('');

            container.innerHTML += `
                <div class="p-2 rounded border ${bgClass} flex flex-col h-20 relative">
                    <span class="text-xs font-bold text-stone-600 mb-1">${displayDate}</span>
                    <div class="flex flex-wrap gap-1 content-start mt-1">
                        ${dots}
                    </div>
                    <span class="absolute bottom-1 right-2 text-[10px] text-stone-400 font-bold">${count > 0 ? count : ''}</span>
                </div>
            `;
        }
    },

    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        // Estilização Base
        const containerClass = isDone 
            ? 'bg-stone-50 border-stone-200 opacity-60' 
            : 'bg-white border-stone-200 shadow-sm hover:shadow-md';
        
        const titleClass = isDone ? 'text-stone-400 line-through' : 'text-stone-800 font-bold';

        // Badges
        const cycleBadge = `<span class="bg-stone-100 text-stone-500 text-[10px] px-1.5 py-0.5 rounded font-bold border border-stone-200">#${review.cycleIndex}</span>`;
        const typeBadge = `<span class="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-amber-100 uppercase">${review.type}</span>`;

        // Botões de Ação
        // 1. Link Externo
        const hasLink = review.link && review.link.length > 5;
        const linkBtn = `
            <button onclick="app.handleLinkAction('${review.id}', '${review.link || ''}')"
                    class="w-7 h-7 flex items-center justify-center rounded-full border transition-all ${hasLink ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-stone-50 text-stone-300 border-transparent'}" 
                    title="${hasLink ? 'Abrir Link Original' : 'Adicionar Link'}">
                <i data-lucide="${hasLink ? 'external-link' : 'link'}" class="w-3.5 h-3.5"></i>
            </button>`;

        // 2. Anexo HTML
        const hasSummary = review.htmlSummary && review.htmlSummary.length > 0;
        const summaryBtn = `
            <button onclick="if(typeof fileManager !== 'undefined') { fileManager.handleAction('${review.id}', ${hasSummary}); event.stopPropagation(); }"
                    class="w-7 h-7 flex items-center justify-center rounded-full border transition-all ${hasSummary ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-stone-50 text-stone-300 border-transparent hover:text-emerald-500 hover:border-emerald-200'}" 
                    title="${hasSummary ? 'Ler Resumo' : 'Anexar HTML'}">
                <i data-lucide="${hasSummary ? 'file-text' : 'upload'}" class="w-3.5 h-3.5"></i>
            </button>`;

        const deleteSummaryBtn = hasSummary ? `
            <button onclick="store.deleteSummary('${review.id}')" class="text-stone-300 hover:text-red-400 p-1" title="Remover Anexo"><i data-lucide="x" class="w-3 h-3"></i></button>
        ` : '';

        return `
            <div class="${containerClass} p-4 rounded-lg border-l-4 border-l-amber-600 mb-3 transition-all relative group">
                
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        ${cycleBadge}
                        ${typeBadge}
                    </div>
                    
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" onclick="store.toggleStatus('${review.id}')" ${isDone ? 'checked' : ''} class="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer">
                    </label>
                </div>

                <h3 class="${titleClass} text-sm mb-3 leading-snug">${review.topic}</h3>

                <div class="flex justify-between items-center pt-2 border-t border-stone-100">
                    <div class="flex gap-2 items-center">
                        ${linkBtn}
                        <div class="flex items-center gap-1 bg-stone-50 rounded-full pr-2">
                            ${summaryBtn}
                            ${deleteSummaryBtn}
                        </div>
                    </div>
                    
                    <button onclick="app.confirmDelete('${review.id}')" class="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    },

    render: () => {
        const todayStr = getLocalISODate();
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };

        if(!containers.today) return;
        Object.values(containers).forEach(el => el.innerHTML = '');

        const sorted = store.reviews.sort((a, b) => a.date.localeCompare(b.date));
        
        let counts = { late: 0, today: 0, future: 0 };

        sorted.forEach(r => {
            if (r.date < todayStr && r.status !== 'DONE') {
                containers.late.innerHTML += ui.createCardHTML(r);
                counts.late++;
            } else if (r.date === todayStr) {
                containers.today.innerHTML += ui.createCardHTML(r);
                counts.today++;
            } else if (r.date > todayStr) {
                containers.future.innerHTML += ui.createCardHTML(r);
                counts.future++;
            }
        });

        // Atualiza contadores
        ['late', 'today', 'future'].forEach(k => {
            const el = document.getElementById(`count-${k}`);
            if(el) el.innerText = counts[k];
        });

        // Empty States
        if(counts.today === 0) {
            containers.today.innerHTML = `<div class="text-center py-10 text-stone-400 text-xs italic">Nada programado para hoje.<br>Aproveite para ler a Bíblia livremente.</div>`;
        }
        
        if(window.lucide) lucide.createIcons();
    }
};
