// CONFIGURAÇÃO DO FIREBASE
// IMPORTANTE: Adicione as suas credenciais do Firebase aqui.
const firebaseConfig = {
    apiKey: "AIzaSyDvQvD9d7Yo-WI-B5jhY5lv_CQPmoDlDew",
    authDomain: "prosp-dbc50.firebaseapp.com",
    databaseURL: "https://prosp-dbc50-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "prosp-dbc50",
    storageBucket: "prosp-dbc50.firebasestorage.app",
    messagingSenderId: "387358006559",
    appId: "1:387358006559:web:5a4296aa462bc4d9dba42a"
};

let db = null;
// Só inicializa o Firebase se a apiKey for substituída
if (firebaseConfig.apiKey !== "SUA_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}

const generateId = () => Math.random().toString(36).substr(2, 9);
class Store {
    constructor() {
        this.data = {
            currentReps: [],
            potentialReps: [],
            resellers: [],
            agenda: [],
            internalTasks: [],
            opportunities: []
        };
        this.load();
    }

    load() {
        // Se Firebase não foi configurado, usa o LocalStorage como fallback temporário
        if (!db) {
            console.warn("Firebase não configurado. Usando LocalStorage (apenas offline).");
            const saved = localStorage.getItem('partnerManagerData');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.data = { ...this.data, ...parsed };
                    if (!this.data.agenda) this.data.agenda = [];
                    if (!this.data.internalTasks) this.data.internalTasks = [];
                    if (!this.data.opportunities) this.data.opportunities = [];
                } catch (e) {
                    console.error("Failed to load local storage", e);
                }
            }
            return;
        }

        // Ouve as mudanças na nuvem em tempo real
        db.collection("partnerData").doc("mainStore").onSnapshot((doc) => {
            if (doc.exists) {
                const parsed = doc.data();
                this.data = { ...this.data, ...parsed };
                if (!this.data.agenda) this.data.agenda = [];
                if (!this.data.internalTasks) this.data.internalTasks = [];
                if (!this.data.opportunities) this.data.opportunities = [];

                // Se a UI já estiver pronta, força uma re-renderização com os novos dados
                if (window.app && window.app.ui && typeof window.app.ui.switchView === 'function') {
                    window.app.ui.switchView(window.app.ui.currentView);
                }
            } else {
                // Primeira vez usando o sistema, cria o documento
                this.save();
            }
        });
    }

    save() {
        if (!db) {
            localStorage.setItem('partnerManagerData', JSON.stringify(this.data));
            return;
        }

        db.collection("partnerData").doc("mainStore").set(this.data)
            .catch(error => {
                console.error("Erro ao salvar no Firebase: ", error);
            });
    }

    // CURRENT REPS
    addCurrentRep(rep) {
        rep.id = generateId();
        this.data.currentReps.push(rep);
        this.save();
    }
    updateCurrentRep(id, updatedRep) {
        const idx = this.data.currentReps.findIndex(r => r.id === id);
        if (idx > -1) {
            this.data.currentReps[idx] = { ...this.data.currentReps[idx], ...updatedRep };
            this.save();
        }
    }
    deleteCurrentRep(id) {
        this.data.currentReps = this.data.currentReps.filter(r => r.id !== id);
        this.save();
    }

    // POTENTIAL REPS
    addPotentialRep(rep) {
        rep.id = generateId();
        this.data.potentialReps.push(rep);
        this.save();
    }
    updatePotentialRep(id, updatedRep) {
        const idx = this.data.potentialReps.findIndex(r => r.id === id);
        if (idx > -1) {
            this.data.potentialReps[idx] = { ...this.data.potentialReps[idx], ...updatedRep };
            this.save();
        }
    }
    deletePotentialRep(id) {
        this.data.potentialReps = this.data.potentialReps.filter(r => r.id !== id);
        this.save();
    }

    // RESELLERS
    addReseller(rep) {
        rep.id = generateId();
        this.data.resellers.push(rep);
        this.save();
    }
    updateReseller(id, updatedRep) {
        const idx = this.data.resellers.findIndex(r => r.id === id);
        if (idx > -1) {
            this.data.resellers[idx] = { ...this.data.resellers[idx], ...updatedRep };
            this.save();
        }
    }
    deleteReseller(id) {
        this.data.resellers = this.data.resellers.filter(r => r.id !== id);
        this.save();
    }

    overwriteAllData(newData) {
        this.data = newData;
        if (!this.data.agenda) this.data.agenda = [];
        if (!this.data.internalTasks) this.data.internalTasks = [];
        if (!this.data.opportunities) this.data.opportunities = [];
        this.save();
    }

    // AGENDA
    addAgendaEvent(event) {
        event.id = generateId();
        this.data.agenda.push(event);
        this.save();
    }
    updateAgendaEvent(id, updatedEvent) {
        const idx = this.data.agenda.findIndex(e => e.id === id);
        if (idx > -1) {
            this.data.agenda[idx] = { ...this.data.agenda[idx], ...updatedEvent };
            this.save();
        }
    }
    deleteAgendaEvent(id) {
        this.data.agenda = this.data.agenda.filter(e => e.id !== id);
        this.save();
    }

    // INTERNAL TASKS
    addInternalTask(task) {
        task.id = generateId();
        this.data.internalTasks.push(task);
        this.save();
    }
    updateInternalTask(id, updatedTask) {
        const idx = this.data.internalTasks.findIndex(t => t.id === id);
        if (idx > -1) {
            this.data.internalTasks[idx] = { ...this.data.internalTasks[idx], ...updatedTask };
            this.save();
        }
    }
    deleteInternalTask(id) {
        this.data.internalTasks = this.data.internalTasks.filter(t => t.id !== id);
        this.save();
    }

    // OPPORTUNITIES
    addOpportunity(opp) {
        opp.id = generateId();
        this.data.opportunities.push(opp);
        this.save();
    }
    updateOpportunity(id, updatedOpp) {
        const idx = this.data.opportunities.findIndex(o => o.id === id);
        if (idx > -1) {
            this.data.opportunities[idx] = { ...this.data.opportunities[idx], ...updatedOpp };
            this.save();
        }
    }
    deleteOpportunity(id) {
        this.data.opportunities = this.data.opportunities.filter(o => o.id !== id);
        this.save();
    }
}

window.app = window.app || {};
window.app.store = new Store();
