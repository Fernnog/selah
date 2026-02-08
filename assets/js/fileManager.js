/**
 * SELAH FILE MANAGER
 * Responsabilidade: Upload e Leitura de Resumos HTML
 */
const fileManager = {
    // Ação: Selecionar e ler o arquivo do computador
    triggerUpload: (reviewId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html, .htm';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Trava de segurança: 2MB
            if (file.size > 2 * 1024 * 1024) {
                alert('O arquivo é muito grande (Max: 2MB).');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                // Chama o core.js para salvar
                store.attachSummary(reviewId, event.target.result);
            };
            reader.readAsText(file);
        };
        input.click();
    },

    // Ação: Abrir o resumo em nova aba
    openSummary: (reviewId) => {
        const htmlContent = store.getSummary(reviewId);
        if (!htmlContent) {
            alert("Resumo não encontrado.");
            return;
        }
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    },
    
    // Ação: Roteador (Decide se abre ou pede upload)
    handleAction: (reviewId, hasSummary) => {
        if (hasSummary) {
            fileManager.openSummary(reviewId);
        } else {
            fileManager.triggerUpload(reviewId);
        }
    }
};

window.fileManager = fileManager;
