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
     * Gerencia a exclusão de reflexões, permitindo remover um item único 
     * ou o ciclo completo (batch) via modal de confirmação.
     */
    openDeleteModal: (id, batchId) => {
        const modal = document.getElementById('modal-delete');
        if (!modal) return;

        // Armazena referências nos metadados do elemento para os handlers de clique
        modal.dataset.targetId = id;
        modal.dataset.targetBatch = batchId;
        
        const btnOne = document.getElementById('btn-delete-one');
        const btnBatch = document.getElementById('btn-delete-batch');
        
        // Configura o comportamento do botão para exclusão individual
        if (btnOne) {
            btnOne.onclick = () => {
                store.deleteReview(id);
                ui.toggleModal('modal-delete', false);
            };
        }
        
        // Configura o comportamento do botão para exclusão do ciclo completo
        if (btnBatch) {
            btnBatch.onclick = () => {
                if(batchId && batchId !== 'undefined' && batchId !== '') {
                    store.deleteBatch(batchId);
                } else {
                    // Fallback para itens órfãos ou legados sem batchId
                    alert("Este item não pertence a um ciclo rastreável. Excluindo apenas ele.");
                    store.deleteReview(id);
                }
                ui.toggleModal('modal-delete', false);
            };
        }
        
        ui.toggleModal('modal-delete', true);
    },

    /**
     * Gerenciador de Autenticação Firebase e Sincronização em Tempo Real.
     * Atualizado para Firestore (SDK v9+).
     */
    initAuth: () => {
        const startFirebaseLogic = () => {
            console.log("🔗 Iniciando lógica de autenticação e Firestore...");
            
            // 1. IMPORTAÇÃO VIA WINDOW (Exposto pelo index.html)
            const { 
                onAuthStateChanged, 
                signInWithEmailAndPassword, 
                signOut,
                doc,          
                onSnapshot    
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

            // 1. Toggle do Popover
            if(btnUser) {
                btnUser.onclick = (e) => {
                    e.stopPropagation();
                    popover.classList.toggle('hidden');
                };
            }

            // 2. Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (popover && !popover.contains(e.target) && btnUser && !btnUser.contains(e.target)) {
                    popover.classList.add('hidden');
                }
            });

            // 3. Listener de Estado (Login/Logout com Sync Firestore)
            onAuthStateChanged(auth, (user) => {
                store.currentUser = user;
                if (user) {
                    // Logado
                    if(viewLogin) viewLogin.classList.add('hidden');
                    if(viewUser) viewUser.classList.remove('hidden');
                    if(emailDisplay) emailDisplay.innerText = user.email;
                    
                    if(statusDot) {
                        statusDot.classList.remove('hidden');
                        statusDot.classList.add('bg-emerald-500');
                    }
                    
                    // Sync em Tempo Real via Firestore (Documento do Usuário)
                    const userDocRef = doc(db, 'users', user.uid);
                    store.dbUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const data = docSnapshot.data();
                            console.log("📥 Dados recebidos do Firestore:", data);
                            store.load(data);
                            if (typeof toast !== 'undefined') toast.show('Sincronizado.', 'success');
                        } else {
                            console.log("🆕 Usuário novo ou sem dados. Inicializando...");
                            store.save(); // Cria estrutura inicial
                        }
                    }, (error) => {
                        console.error("Erro no Sync Firestore:", error);
                    });
                } else {
                    // Deslogado
                    if(viewLogin) viewLogin.classList.remove('hidden');
                    if(viewUser) viewUser.classList.add('hidden');
                    if(statusDot) statusDot.classList.add('hidden');
                    
                    if (store.dbUnsubscribe) store.dbUnsubscribe();
                    store.load(null);
                }
            });

            // 4. Submit do Login
            const formLogin = document.getElementById('auth-form-popover');
            if(formLogin) {
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
                    } catch (err) {
                        alert("Erro: " + err.code);
                    } finally {
                        btnSubmit.innerText = originalText;
                        btnSubmit.disabled = false;
                    }
                };
            }

            // 5. Botão Sair
            const btnLogout = document.getElementById('btn-logout-popover');
            if(btnLogout) {
                btnLogout.onclick = () => {
                    if(confirm("Sair da conta?")) {
                        signOut(auth);
                        popover.classList.add('hidden');
                    }
                };
            }
        };

        // --- VERIFICAÇÃO DE SEGURANÇA ---
        if (window.fireMethods) {
            startFirebaseLogic();
        } else {
            console.log("⏳ Aguardando inicialização do Firebase...");
            window.addEventListener('firebase-ready', () => {
                console.log("✅ Firebase detectado! Conectando...");
                startFirebaseLogic();
            });
        }
    }
};

// Inicialização Global
app.init();
window.app = app;
