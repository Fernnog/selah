/* --- ASSETS/JS/CONTROLLER.JS (Selah Version) --- */

const app = {
    /**
     * Inicializa a aplicação, carregando dados locais, configurando listeners
     * e ativando a integração com o Firebase.
     */
    init: () => {
        store.load();
        
        // Listener do Formulário de Reflexão
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);

        // Listener de Autenticação
        app.initAuth();
        
        ui.render();
        ui.switchTab('today');
    },

    /**
     * Processa a criação de uma nova reflexão espiritual.
     * Simplificado para focar no conteúdo (Tema e Data).
     */
    handleNewEntry: (e) => {
        e.preventDefault();
        
        // Seleção de elementos do DOM
        const dateInput = document.getElementById('input-study-date');
        const topicInput = document.getElementById('input-topic');
        const linkInput = document.getElementById('input-study-link');

        // Validação obrigatória para o registro
        if(!dateInput.value || !topicInput.value) {
            return alert("Por favor, preencha a data e o tema.");
        }

        // Preparação do objeto de dados
        // 'time' e 'complexity' são mantidos com valores padrão para 
        // garantir compatibilidade com o engine.js original.
        const data = {
            dateStr: dateInput.value,
            topic: topicInput.value,
            link: linkInput.value,
            time: 0, 
            complexity: 'normal'
        };

        // Dispara o motor de agendamento (24h, 7d, 30d)
        engine.processEntry(data);
        
        // Reset da Interface
        ui.toggleModal('modal-new', false);
        e.target.reset();
        
        // Define a data padrão para o dia atual após o salvamento
        dateInput.value = getLocalISODate();
    },

    /**
     * Gerencia a ação de links externos (Drive, YouTube, etc).
     */
    handleLinkAction: (id, currentLink) => {
        if (currentLink && currentLink.length > 5) {
            window.open(currentLink, '_blank');
        } else {
            const newLink = prompt("Insira o link de referência (Drive/Notion/Youtube):");
            if (newLink) store.updateReviewLink(id, newLink);
        }
    },

    /**
     * Solicita confirmação antes de remover uma reflexão do ciclo.
     */
    confirmDelete: (id) => {
        if(confirm("Deseja excluir esta reflexão? Se for parte de um ciclo, apenas este registro será removido.")) {
            store.deleteReview(id);
        }
    },

    /**
     * Gerenciador de Autenticação Firebase.
     * Mantém o estado do usuário e sincroniza com o Cloud Firestore.
     */
    initAuth: () => {
        if (!window.fireMethods) return;
        const { onAuthStateChanged, signInWithEmailAndPassword, signOut } = window.fireMethods;
        const auth = window.fireAuth;
        const db = window.fireDb;
        const { ref, get } = window.fireMethods;

        const btnUser = document.getElementById('user-menu-btn');
        const popover = document.getElementById('auth-popover');
        const viewLogin = document.getElementById('auth-view-login');
        const viewUser = document.getElementById('auth-view-user');

        btnUser.onclick = () => popover.classList.toggle('hidden');

        onAuthStateChanged(auth, (user) => {
            store.currentUser = user;
            if(user) {
                viewLogin.classList.add('hidden');
                viewUser.classList.remove('hidden');
                document.getElementById('popover-user-email').innerText = user.email;
                document.getElementById('user-status-dot').classList.remove('hidden');
                
                // Sincronização com Nuvem
                const userRef = ref(db, 'users/' + user.uid);
                get(userRef).then(snap => {
                    if(snap.exists()) store.load(snap.val());
                    else store.save(); 
                });
            } else {
                viewLogin.classList.remove('hidden');
                viewUser.classList.add('hidden');
                document.getElementById('user-status-dot').classList.add('hidden');
                store.load(null); 
            }
        });

        document.getElementById('auth-form-popover').onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('popover-email').value;
            const pass = document.getElementById('popover-pass').value;
            signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Erro: " + err.message));
        };

        document.getElementById('btn-logout-popover').onclick = () => signOut(auth);
    }
};

// Inicialização Global
app.init();
window.app = app;
