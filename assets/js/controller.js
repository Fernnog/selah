/* --- ASSETS/JS/CONTROLLER.JS --- */

const app = {
    init: () => {
        store.load();
        
        // Listener do Formulário
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);

        // Listener Auth (Firebase)
        app.initAuth();
        
        ui.render();
        ui.switchTab('today');
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        
        const dateInput = document.getElementById('input-study-date');
        const topicInput = document.getElementById('input-topic');
        const linkInput = document.getElementById('input-study-link');

        if(!dateInput.value || !topicInput.value) return alert("Preencha data e tema.");

        const data = {
            dateStr: dateInput.value,
            topic: topicInput.value,
            link: linkInput.value
        };

        engine.processEntry(data);
        
        ui.toggleModal('modal-new', false);
        e.target.reset();
        
        // Reset data para hoje
        dateInput.value = getLocalISODate();
    },

    handleLinkAction: (id, currentLink) => {
        if (currentLink && currentLink.length > 5) {
            window.open(currentLink, '_blank');
        } else {
            const newLink = prompt("Insira o link (Drive/Notion):");
            if (newLink) store.updateReviewLink(id, newLink);
        }
    },

    confirmDelete: (id) => {
        if(confirm("Deseja excluir este card? Se for parte de um ciclo, apenas este dia será removido.")) {
            store.deleteReview(id);
        }
    },

    initAuth: () => {
        // Lógica de Autenticação Firebase mantida simples
        if (!window.fireMethods) return;
        const { onAuthStateChanged, signInWithEmailAndPassword, signOut } = window.fireMethods;
        const auth = window.fireAuth;
        const db = window.fireDb;
        const { ref, get, onValue } = window.fireMethods;

        // Elementos UI
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
                
                // Load Cloud Data
                const userRef = ref(db, 'users/' + user.uid);
                get(userRef).then(snap => {
                    if(snap.exists()) store.load(snap.val());
                    else store.save(); // Cria inicial
                });
            } else {
                viewLogin.classList.remove('hidden');
                viewUser.classList.add('hidden');
                document.getElementById('user-status-dot').classList.add('hidden');
                store.load(null); // Load Local
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

app.init();
window.app = app;
