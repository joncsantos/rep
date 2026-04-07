window.app = window.app || {};
window.app.views = window.app.views || {};

window.app.views.dashboard = {
    render() {
        const data = window.app.store.data;
        
        // Compute Metrics
        const totalCurrent = data.currentReps.length;
        const totalOppsLegacy = data.currentReps.reduce((sum, r) => sum + (Number(r.totalOpportunities) || 0), 0);
        const totalOppsNew = data.opportunities ? data.opportunities.length : 0;
        const totalOpps = totalOppsLegacy + totalOppsNew;
        
        const totalActiveOppsLegacy = data.currentReps.reduce((sum, r) => sum + (Number(r.activeOpportunities) || 0), 0);
        const totalActiveOppsNew = data.opportunities ? data.opportunities.filter(o => o.temperature === 'quente' || o.temperature === 'morno').length : 0;
        const totalActiveOpps = totalActiveOppsLegacy + totalActiveOppsNew;
        
        const totalSalesValue = data.currentReps.reduce((sum, r) => sum + (Number(r.salesValueUSD) || 0), 0);
        const totalContractedResellers = data.resellers.filter(r => r.type === 'contracted').length;

        // Update UI Metrics
        document.getElementById('metric-current-reps').innerText = totalCurrent;
        if(document.getElementById('metric-total-opps')) document.getElementById('metric-total-opps').innerText = totalOpps;
        document.getElementById('metric-active-opps').innerText = totalActiveOpps;
        
        // Format USD
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById('metric-sales-value').innerText = formatter.format(totalSalesValue);
        
        document.getElementById('metric-total-resellers').innerText = totalContractedResellers;

        // Render Rankings
        this.renderRankings();
    },

    renderRankings() {
        const reps = [...window.app.store.data.currentReps];
        
        // 1. Ranking by Total Opportunities
        const byQty = [...reps].sort((a, b) => (Number(b.totalOpportunities) || 0) - (Number(a.totalOpportunities) || 0)).slice(0, 10);
        const qtyHtml = byQty.map((r, index) => `
            <li class="ranking-item">
                <span class="ranking-item-name"><strong>${index + 1}º</strong> - ${window.app.ui.escapeHtml(r.repName)}</span>
                <span class="ranking-item-value">${r.totalOpportunities} opps</span>
            </li>
        `).join('');
        document.getElementById('ranking-qty-list').innerHTML = qtyHtml || '<li class="text-tertiary">Sem dados suficientes</li>';

        // 2. Ranking by Sales Value
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        const byValue = [...reps].sort((a, b) => (Number(b.salesValueUSD) || 0) - (Number(a.salesValueUSD) || 0)).slice(0, 10);
        const valHtml = byValue.map((r, index) => `
            <li class="ranking-item">
                <span class="ranking-item-name"><strong>${index + 1}º</strong> - ${window.app.ui.escapeHtml(r.repName)}</span>
                <span class="ranking-item-value">${formatter.format(r.salesValueUSD)}</span>
            </li>
        `).join('');
        document.getElementById('ranking-value-list').innerHTML = valHtml || '<li class="text-tertiary">Sem dados suficientes</li>';
    }
};
