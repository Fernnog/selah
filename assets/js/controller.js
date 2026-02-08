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

        // --- CÓDIGO NOVO: Preenche a data de hoje automaticamente no input ---
        const dateInput = document.getElementById('input-study-date');
        if(dateInput && typeof getLocalISODate === 'function') {
            dateInput.value = getLocalISODate();
        }
        // ---------------------------------------------------------------------

        // Listener de Autenticação
        app.initAuth();
        
        ui.render();
        ui.switchTab('today');
    },

    /**
     * Processa a nova reflexão (Selah v1.0.0 Simplificado)
     * Focado no conteúdo essencial: Data, Tema e Link.
     */
    handleNewEntry: (e) => {
        e.preventDefault();
        
        const dateInput = document.getElementById('input-study-date');
        const topicInput = document.getElementById('input-topic');
        const linkInput = document.getElementById('input-study-link');

        if(!dateInput.value || !topicInput.value) {
            return alert("Por favor, preencha a data e o tema da reflexão.");
        }

        const data = {
            dateStr: dateInput.value,
            topic: topicInput.value,
            link: linkInput.value || '',
            time: 0, 
            complexity: 'normal'
        };

        engine.processEntry(data);
        
        ui.toggleModal('modal-new', false);
        e.target.reset();
        
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
     * Gerenciador de Autenticação Firebase e Sincronização em Tempo Real.
     */
    initAuth: () => {
        if (!window.fireMethods) {
            console.error("Firebase não inicializado.");
            return;
        }

        const { 
            onAuthStateChanged, 
            signInWithEmailAndPassword, 
            signOut, 
            ref, 
            onValue 
        } = window.fireMethods;
        
        const auth = window.fireAuth;
        const db = window.fireDb;

        // Elementos da UI
        const btnUser = document.getElementById('user-menu-btn');
        const popover = document.getElementById('auth-popover');
        const viewLogin = document.getElementById('auth-view-login');
        const viewUser = document.getElementById('auth-view-user');
        const statusDot = document.getElementById('user-status-dot');
        const emailDisplay = document.getElementById('popover-user-email');

        // Toggle do Popover
        btnUser.onclick = (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
        };
        
        // Fechar popover ao clicar fora
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !btnUser.contains(e.target)) {
                popover.classList.add('hidden');
            }
        });

        // LISTENER DE ESTADO DE AUTENTICAÇÃO
        onAuthStateChanged(auth, (user) => {
            store.currentUser = user;
            
            if (user) {
                // --- USUÁRIO LOGADO ---
                viewLogin.classList.add('hidden');
                viewUser.classList.remove('hidden');
                emailDisplay.innerText = user.email;
                
                // Indicador Visual (Verde = Online)
                statusDot.classList.remove('hidden');
                statusDot.classList.add('bg-emerald-500', 'border-emerald-100');
                statusDot.classList.remove('bg-stone-400', 'border-white');

                // Conectar ao Banco de Dados em Tempo Real
                const userRef = ref(db, 'users/' + user.uid);
                
                // onValue escuta mudanças na nuvem em tempo real
                const unsubscribe = onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        store.load(data);
                        if (typeof toast !== 'undefined') toast.show('Sincronizado com a nuvem.', 'success');
                    } else {
                        // Primeiro login: sincroniza o local atual para a nuvem
                        store.save();
                    }
                });
                
                store.dbUnsubscribe = unsubscribe;

            } else {
                // --- USUÁRIO DESLOGADO ---
                viewLogin.classList.remove('hidden');
                viewUser.classList.add('hidden');
                statusDot.classList.add('hidden');
                
                if (store.dbUnsubscribe) store.dbUnsubscribe();
                
                store.load(null);
            }
        });

        // AÇÃO DE LOGIN
        const formLogin = document.getElementById('auth-form-popover');
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('popover-email').value;
            const pass = document.getElementById('popover-pass').value;
            const btnSubmit = formLogin.querySelector('button');
            const originalText = btnSubmit.innerText;

            try {
                btnSubmit.innerText = "Entrando...";
                btnSubmit.disabled = true;
                
                await signInWithEmailAndPassword(auth, email, pass);
                
                popover.classList.add('hidden');
                formLogin.reset();
                if (typeof toast !== 'undefined') toast.show(`Bem-vindo, ${email}`, 'success');
            } catch (err) {
                alert("Erro ao entrar: Verifique e-mail e senha.\n(" + err.code + ")");
            } finally {
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        };

        // AÇÃO DE LOGOUT
        const btnLogout = document.getElementById('btn-logout-popover');
        if (btnLogout) {
            btnLogout.onclick = () => {
                if(confirm("Deseja sair? Seus dados permanecerão salvos neste navegador.")) {
                    signOut(auth);
                    popover.classList.add('hidden');
                    if (typeof toast !== 'undefined') toast.show('Desconectado.');
                }
            };
        }
    }
};

// Inicialização Global
app.init();
window.app = app;
