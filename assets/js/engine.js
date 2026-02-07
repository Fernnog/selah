/* --- ASSETS/JS/ENGINE.JS --- */
/**
 * SELAH ENGINE - Lógica de Geração de Ciclos
 */

const engine = {
    
    calculateCycleIndex: () => {
        let maxIndex = 0;
        store.reviews.forEach(r => {
            if (r.cycleIndex) {
                const idx = parseInt(r.cycleIndex, 10);
                if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
            }
        });
        return maxIndex + 1;
    },

    processEntry: (data) => {
        const { topic, dateStr, link } = data;
        
        const baseDate = new Date(dateStr + 'T12:00:00'); 
        const batchId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const finalCycleIndex = engine.calculateCycleIndex();
        const generateUUID = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

        // Subject Fixo (Reflexão)
        const sub = store.subjects[0]; 

        const newReviews = [];

        // 1. Card Inicial (A Ministração em si) - Para registrar no dia
        // Se a data for hoje, aparece hoje. Se for passado, cai em atrasados/pendentes.
        newReviews.push({
            id: generateUUID(), 
            subject: sub.name, color: sub.color, topic: topic, time: 0, // Time 0 pois não medimos tempo
            date: dateStr, type: 'ORIGEM', status: 'PENDING',
            cycleIndex: finalCycleIndex, batchId: batchId,
            link: link || null
        });

        // 2. Projeção dos Ciclos (24h, 7d, 30d)
        // Intervalos definidos no core.js: [1, 7, 30]
        CONFIG.intervals.forEach(interval => {
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + interval);
            const isoDate = getLocalISODate(targetDate); 
            
            let label = interval === 1 ? '24h' : interval + 'd';

            newReviews.push({
                id: generateUUID(),
                subject: sub.name, color: sub.color, topic: topic, time: 0,
                date: isoDate, type: label, status: 'PENDING',
                cycleIndex: finalCycleIndex, batchId: batchId,
                link: link || null
            });
        });

        store.addReviews(newReviews);
        toast.show(`Ciclo #${finalCycleIndex} criado. Reflita bem!`, 'success');
    }
}; 

window.engine = engine;
