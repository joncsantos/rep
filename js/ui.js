window.app = window.app || {};

window.app.ui = {
    currentView: 'dashboard',
    
    init() {
        this.setupNavigation();
        this.setupTabs();
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(nav => nav.classList.remove('active'));
                const btn = e.currentTarget;
                btn.classList.add('active');
                
                const viewId = btn.getAttribute('data-view');
                this.switchView(viewId);
            });
        });
    },

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
                
                // Show target
                document.getElementById('tab-' + targetId).classList.add('active');
                e.target.classList.add('active');
            });
        });
    },

    switchView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        // Show target view
        document.getElementById('view-' + viewId).classList.add('active');
        this.currentView = viewId;

        // Render data for the specific view
        if (viewId === 'dashboard') window.app.views.dashboard.render();
        if (viewId === 'current-reps') window.app.views.currentReps.render();
        if (viewId === 'potential-reps') window.app.views.potentialReps.render();
        if (viewId === 'resellers') window.app.views.resellers.render();
        if (viewId === 'pending') window.app.views.pending.render();
        if (viewId === 'agenda') window.app.views.agenda.render();
        if (viewId === 'opportunities') window.app.views.opportunities.render();
        
        // Update title
        const titles = {
            'dashboard': 'Dashboard Geral',
            'current-reps': 'Representantes Atuais',
            'potential-reps': 'Representantes em Potencial',
            'resellers': 'Lista de Revendedores',
            'pending': 'Pendências e Tarefas',
            'agenda': 'Agenda de Compromissos',
            'opportunities': 'Gestão de Oportunidades'
        };
        document.getElementById('page-title').innerText = titles[viewId];
    },

    openModal(title, htmlContent, onSave) {
        const modal = document.getElementById('modal-container');
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = htmlContent;
        
        const saveBtn = document.getElementById('modal-save-btn');
        // Replace button to remove old event listeners
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener('click', onSave);
        modal.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    },

    // Utilities
    isExpired(dateStr) {
        if (!dateStr) return false;
        // Append T00:00:00 to avoid UTC timezone shifts when parsing YYYY-MM-DD
        const expDate = new Date(dateStr.indexOf('T') === -1 ? dateStr + 'T00:00:00' : dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        return expDate < today;
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    },
    
    escapeHtml(unsafe) {
        return (unsafe || "").toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
};
