window.app = window.app || {};
window.app.views = window.app.views || {};

window.app.views.opportunities = {
    render() {
        const tbody = document.querySelector('#table-opportunities tbody');
        const data = window.app.store.data.opportunities || [];
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-tertiary)">Nenhuma oportunidade cadastrada.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(opp => {
            let tempColor = '#a8b3cf';
            let tempBg = 'rgba(255,255,255,0.05)';
            if(opp.temperature === 'quente') {
                tempColor = '#ef4444';
                tempBg = 'rgba(239,68,68,0.1)';
            } else if(opp.temperature === 'morno') {
                tempColor = '#f59e0b';
                tempBg = 'rgba(245,158,11,0.1)';
            } else if(opp.temperature === 'frio') {
                tempColor = '#3b82f6';
                tempBg = 'rgba(59,130,246,0.1)';
            }
            
            return `
                <tr>
                    <td><strong>${window.app.ui.escapeHtml(opp.client)}</strong></td>
                    <td>${window.app.ui.escapeHtml(opp.equipment)}</td>
                    <td>${window.app.ui.escapeHtml(opp.representative)}</td>
                    <td>
                        <span style="display:inline-block; padding:0.25rem 0.5rem; border-radius:0.25rem; font-size:0.75rem; font-weight:600; color:${tempColor}; background-color:${tempBg}; text-transform:uppercase;">
                            ${opp.temperature}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-btn" onclick="window.app.views.opportunities.edit('${opp.id}')" title="Editar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="icon-btn text-danger" onclick="window.app.views.opportunities.delete('${opp.id}')" title="Excluir">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openModal(id = null) {
        let opp = { client: '', equipment: '', representative: '', temperature: 'morno' };
        if (id) {
            const found = window.app.store.data.opportunities.find(o => o.id === id);
            if (found) opp = { ...found };
        }

        const reps = window.app.store.data.currentReps || [];
        const repOptions = reps.map(r => `<option value="${window.app.ui.escapeHtml(r.repName)}" ${opp.representative === r.repName ? 'selected' : ''}>${window.app.ui.escapeHtml(r.repName)}</option>`).join('');

        const html = `
            <div class="form-group">
                <label>Nome do Cliente</label>
                <input type="text" id="opp-client" class="form-control" value="${window.app.ui.escapeHtml(opp.client)}" placeholder="Ex: Mercado Silva">
            </div>
            <div class="form-group mt-sm">
                <label>Equipamento</label>
                <input type="text" id="opp-equipment" class="form-control" value="${window.app.ui.escapeHtml(opp.equipment)}" placeholder="Ex: Totem de Autoatendimento">
            </div>
            <div class="form-group mt-sm">
                <label>Representante</label>
                <div style="display:flex; gap:0.5rem; flex-direction:column;">
                    <select id="opp-rep-select" class="form-control" onchange="document.getElementById('opp-representative').value = this.value">
                        <option value="">-- Selecionar da base --</option>
                        ${repOptions}
                    </select>
                    <input type="text" id="opp-representative" class="form-control" value="${window.app.ui.escapeHtml(opp.representative)}" placeholder="Ou digite o nome manualmente">
                </div>
            </div>
            <div class="form-group mt-sm">
                <label>Temperatura</label>
                <select id="opp-temperature" class="form-control">
                    <option value="frio" ${opp.temperature === 'frio' ? 'selected' : ''}>Frio</option>
                    <option value="morno" ${opp.temperature === 'morno' ? 'selected' : ''}>Morno</option>
                    <option value="quente" ${opp.temperature === 'quente' ? 'selected' : ''}>Quente</option>
                </select>
            </div>
        `;

        window.app.ui.openModal(
            id ? 'Editar Oportunidade' : 'Nova Oportunidade',
            html,
            () => this.save(id)
        );
    },

    edit(id) {
        this.openModal(id);
    },

    save(id) {
        const client = document.getElementById('opp-client').value.trim();
        const equipment = document.getElementById('opp-equipment').value.trim();
        const representative = document.getElementById('opp-representative').value.trim();
        const temperature = document.getElementById('opp-temperature').value;

        if (!client || !equipment) {
            alert('Por favor, preencha o Nome do Cliente e Equipamento.');
            return;
        }

        const data = {
            client,
            equipment,
            representative,
            temperature
        };

        if (id) {
            window.app.store.updateOpportunity(id, data);
        } else {
            window.app.store.addOpportunity(data);
        }

        window.app.ui.closeModal();
        this.render();
        
        // Update dashboard if possible
        if (window.app.views.dashboard && window.app.views.dashboard.render) {
            window.app.views.dashboard.render();
        }
    },

    delete(id) {
        if (confirm('Tem certeza que deseja excluir esta oportunidade?')) {
            window.app.store.deleteOpportunity(id);
            this.render();
            if (window.app.views.dashboard && window.app.views.dashboard.render) {
                window.app.views.dashboard.render();
            }
        }
    }
};
