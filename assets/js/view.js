/* --- ASSETS/JS/VIEW.JS --- */
/**
 * UI RENDERER - Camada Visual Selah
 * Versão: 1.0.0 - Lançamento Oficial "Selah"
 */

const ui = {
    // Navegação (Abas Mobile e Colunas Desktop)
    switchTab: (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'text-indigo-600', 'border-indigo-600'));
        const btn = document.getElementById(`tab-${tabName}`);
        if(btn) btn.classList.add('active', 'text-indigo-600', 'border-indigo-600');

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

    // --- NOVA FUNÇÃO: Exibir Changelog ---
    toggleChangelog: (show) => {
        if(show && typeof changelogData !== 'undefined') {
            const container = document.getElementById('changelog-content');
            container.innerHTML = changelogData.map(log => `
                <div class="mb-4 border-l-2 border-amber-500 pl-3">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-stone-800 text-sm">v${log.version}</span>
                        <span class="text-xs text-stone-500">${log.date}</span>
                    </div>
                    <ul class="list-disc list-inside text-xs text-stone-600 space-y-1">
                        ${log.changes.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
            ui.toggleModal('modal-changelog', true);
        } else {
            ui.toggleModal('modal-changelog', false);
        }
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
            
            // Lógica visual: Cores Indigo para o Selah
            let bgClass = count > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-stone-100 border-stone-200 opacity-50';
            if (count > 3) bgClass = 'bg-indigo-100 border-indigo-300';
            
            const dots = dayStudies.map(() => `<div class="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>`).join('');

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

    /**
     * Gera o HTML do card de reflexão.
     * Implementa a lógica de anexos inteligentes e cores do Selah v1.0.0.
     */
    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        // Estilos Visuais do Card
        const containerClass = isDone 
            ? 'bg-stone-50 border-stone-200 opacity-60' 
            : 'bg-white border-stone-200 shadow-sm hover:shadow-md';
        
        const titleClass = isDone ? 'text-stone-400 line-through' : 'text-stone-800 font-bold';

        // LÓGICA DO ANEXO INTELIGENTE (Cores do Selah: Stone/Emerald)
        const hasSummary = review.htmlSummary && review.htmlSummary.length > 0;
        const hasSumString = hasSummary ? 'true' : 'false';

        // Se tem resumo: Ícone de Arquivo (File-Text), Cor Esmeralda, Ação: Abrir
        // Se não tem: Ícone de Nuvem (Upload), Cor Neutra, Ação: Upload
        const summaryIcon = hasSummary ? 'file-text' : 'upload-cloud';
        const summaryClass = hasSummary 
            ? "text-emerald-700 bg-emerald-100 border-emerald-300 hover:bg-emerald-200" 
            : "text-stone-400 bg-stone-50 border-transparent hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50";
            
        const summaryTitle = hasSummary ? "Ler Reflexão Anexada" : "Anexar Resumo HTML";

        // Botão de deletar anexo (só aparece se existir anexo)
        const deleteSummaryHtml = hasSummary ? `
            <button onclick="store.deleteSummary('${review.id}'); event.stopPropagation();"
                    class="w-6 h-6 flex items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 hover:border-red-200 transition-all ml-1" 
                    title="Remover Anexo">
                <i data-lucide="file-x" class="w-3 h-3"></i>
            </button>` : '';
        
        // Botão de Link Externo
        const hasLink = review.link && review.link.length > 5;
        const linkBtn = `
            <button onclick="app.handleLinkAction('${review.id}', '${review.link || ''}')"
                    class="w-7 h-7 flex items-center justify-center rounded-full border transition-all ${hasLink ? 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100' : 'bg-stone-50 text-stone-300 border-transparent hover:border-stone-200'}" 
                    title="${hasLink ? 'Abrir Link' : 'Adicionar Link'}">
                <i data-lucide="${hasLink ? 'external-link' : 'link'}" class="w-3.5 h-3.5"></i>
            </button>`;

        return `
            <div class="${containerClass} p-4 rounded-lg border-l-4 border-l-indigo-600 mb-3 transition-all relative group">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <span class="bg-stone-100 text-stone-500 text-[10px] px-1.5 py-0.5 rounded font-bold border border-stone-200">#${review.cycleIndex || '?'}</span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${review.date}</span>
                    </div>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" onclick="store.toggleStatus('${review.id}')" ${isDone ? 'checked' : ''} class="w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                    </label>
                </div>

                <h3 class="${titleClass} text-sm mb-3 leading-snug">${review.topic}</h3>

                <div class="flex justify-between items-center pt-2 border-t border-stone-100">
                    <div class="flex gap-2 items-center">
                        ${linkBtn}
                        
                        <div class="flex items-center gap-1 bg-stone-50 rounded-full pr-1">
                            <button onclick="fileManager.handleAction('${review.id}', ${hasSumString}); event.stopPropagation();"
                                    class="w-7 h-7 flex items-center justify-center rounded-full border transition-all ${summaryClass}" 
                                    title="${summaryTitle}">
                                <i data-lucide="${summaryIcon}" class="w-3.5 h-3.5"></i>
                            </button>
                            ${deleteSummaryHtml}
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
