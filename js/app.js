window.app = window.app || {};

document.addEventListener('DOMContentLoaded', () => {
    window.app.ui.init();
    window.app.views.dashboard.render();
    
    // Ensure lists are loaded once at start
    window.app.views.currentReps.render();
    window.app.views.potentialReps.render();
    window.app.views.resellers.render();
    window.app.views.pending.render();
    window.app.views.agenda.render();
});
