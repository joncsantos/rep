window.app = window.app || {};
window.app.views = window.app.views || {};

// POTENTIAL REPS
window.app.views.potentialReps = {
    render() {
        const tbody = document.querySelector('#table-potential-reps tbody');
        const data = window.app.store.data.potentialReps;
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-tertiary)">Nenhum representante em potencial cadastrado.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(rep => `
            <tr>
                <td><strong>${window.app.ui.escapeHtml(rep.repName)}</strong></td>
                <td>${window.app.ui.escapeHtml(rep.companyName)}</td>
                <td>${window.app.ui.escapeHtml(rep.city)} - ${window.app.ui.escapeHtml(rep.state)}</td>
                <td>${window.app.ui.escapeHtml(rep.areaOfOperation)}</td>
                <td>${window.app.ui.escapeHtml(rep.techOfInterest)}</td>
                <td>${(rep.pendingItems || []).length} items</td>
                <td>
                    <button class="icon-btn" onclick="window.app.views.potentialReps.edit('${rep.id}')" title="Editar">Editar</button>
                    <button class="icon-btn text-danger" onclick="window.app.views.potentialReps.delete('${rep.id}')" title="Excluir">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    openModal(repId = null) {
        let rep = {
            repName: '', companyName: '', city: '', state: '',
            areaOfOperation: '', techOfInterest: '', pendingItems: []
        };
        
        if (repId) rep = window.app.store.data.potentialReps.find(r => r.id === repId) || rep;

        window._tempItemsPR = [...(rep.pendingItems || [])];

        const html = `
            <form id="form-potential-rep" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" id="pr-name" class="form-control" value="${window.app.ui.escapeHtml(rep.repName)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Empresa</label>
                    <input type="text" id="pr-company" class="form-control" value="${window.app.ui.escapeHtml(rep.companyName)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Cidade *</label>
                    <input type="text" id="pr-city" class="form-control" value="${window.app.ui.escapeHtml(rep.city)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <input type="text" id="pr-state" class="form-control" value="${window.app.ui.escapeHtml(rep.state)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Área de Atuação</label>
                    <input type="text" id="pr-area" class="form-control" value="${window.app.ui.escapeHtml(rep.areaOfOperation)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Tecnologia de Interesse</label>
                    <input type="text" id="pr-tech" class="form-control" value="${window.app.ui.escapeHtml(rep.techOfInterest)}">
                </div>
                <div class="form-group full">
                    <label class="form-label">Pendências para Fechar</label>
                    <div class="d-flex" style="gap:8px;">
                        <input type="text" id="pr-new-item" class="form-control">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.views.potentialReps.addItem()">Adicionar</button>
                    </div>
                    <ul id="pr-items-list" class="item-list mt-sm"></ul>
                </div>
            </form>
        `;

        window.app.ui.openModal(repId ? 'Editar Potencial' : 'Novo Potencial', html, () => {
            if(!document.getElementById('form-potential-rep').reportValidity()) return;

            const newRep = {
                repName: document.getElementById('pr-name').value,
                companyName: document.getElementById('pr-company').value,
                city: document.getElementById('pr-city').value,
                state: document.getElementById('pr-state').value,
                areaOfOperation: document.getElementById('pr-area').value,
                techOfInterest: document.getElementById('pr-tech').value,
                pendingItems: window._tempItemsPR
            };

            if (repId) window.app.store.updatePotentialRep(repId, newRep);
            else window.app.store.addPotentialRep(newRep);
            
            window.app.ui.closeModal();
            this.render();
        });

        this._renderItemsList();
    },

    edit(id) { this.openModal(id); },
    delete(id) {
        if(confirm("Tem certeza que deseja excluir?")) {
            window.app.store.deletePotentialRep(id);
            this.render();
        }
    },

    addItem() {
        const input = document.getElementById('pr-new-item');
        if (input.value.trim()) {
            window._tempItemsPR.push(input.value.trim());
            input.value = '';
            this._renderItemsList();
        }
    },
    removeItem(idx) {
        window._tempItemsPR.splice(idx, 1);
        this._renderItemsList();
    },
    _renderItemsList() {
        const ul = document.getElementById('pr-items-list');
        ul.innerHTML = window._tempItemsPR.map((item, i) => `
            <li>
                <span>${window.app.ui.escapeHtml(item)}</span>
                <button type="button" class="icon-btn text-danger" onclick="window.app.views.potentialReps.removeItem(${i})">X</button>
            </li>
        `).join('');
    }
};

// RESELLERS
window.app.views.resellers = {
    render() {
        const potentialTbody = document.querySelector('#table-resellers-potential tbody');
        const contractedTbody = document.querySelector('#table-resellers-contracted tbody');
        
        const data = window.app.store.data.resellers;
        const potential = data.filter(r => r.type === 'potential');
        const contracted = data.filter(r => r.type === 'contracted');
        
        if (potential.length === 0) {
            potentialTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum revendedor em potencial.</td></tr>';
        } else {
            potentialTbody.innerHTML = potential.map(r => `
                <tr>
                    <td><strong>${window.app.ui.escapeHtml(r.companyName)}</strong></td>
                    <td>${window.app.ui.escapeHtml(r.city)}</td>
                    <td>${(r.pendingItems || []).length} items</td>
                    <td>
                        <button class="icon-btn" onclick="window.app.views.resellers.edit('${r.id}', 'potential')">Editar</button>
                        <button class="icon-btn text-danger" onclick="window.app.views.resellers.delete('${r.id}')">Excluir</button>
                    </td>
                </tr>
            `).join('');
        }

        if (contracted.length === 0) {
            contractedTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum revendedor contratado.</td></tr>';
        } else {
            contractedTbody.innerHTML = contracted.map(r => `
                <tr>
                    <td><strong>${window.app.ui.escapeHtml(r.companyName)}</strong></td>
                    <td>${window.app.ui.escapeHtml(r.city)}</td>
                    <td>${r.balancesPurchased || 0}</td>
                    <td>
                        <button class="icon-btn" onclick="window.app.views.resellers.edit('${r.id}', 'contracted')">Editar</button>
                        <button class="icon-btn text-danger" onclick="window.app.views.resellers.delete('${r.id}')">Excluir</button>
                    </td>
                </tr>
            `).join('');
        }
    },

    openModal(repId = null, type = 'potential') {
        // If repId is just a type string due to UI event passing 'potential' vs ID
        if(repId === 'potential' || repId === 'contracted') {
            type = repId;
            repId = null;
        }

        let rep = { type: type, companyName: '', city: '', pendingItems: [], balancesPurchased: 0 };
        
        if (repId) rep = window.app.store.data.resellers.find(r => r.id === repId) || rep;

        window._tempItemsRes = [...(rep.pendingItems || [])];

        let extraFields = '';
        if (type === 'potential') {
            extraFields = `
                <div class="form-group full">
                    <label class="form-label">Pendências</label>
                    <div class="d-flex" style="gap:8px;">
                        <input type="text" id="res-new-item" class="form-control">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.views.resellers.addItem()">Adicionar</button>
                    </div>
                    <ul id="res-items-list" class="item-list mt-sm"></ul>
                </div>
            `;
        } else {
            extraFields = `
                <div class="form-group full">
                    <label class="form-label">Saldos Comprados</label>
                    <input type="number" id="res-balances" class="form-control" value="${rep.balancesPurchased}">
                </div>
            `;
        }

        const html = `
            <form id="form-reseller" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Empresa *</label>
                    <input type="text" id="res-company" class="form-control" value="${window.app.ui.escapeHtml(rep.companyName)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Cidade *</label>
                    <input type="text" id="res-city" class="form-control" value="${window.app.ui.escapeHtml(rep.city)}" required>
                </div>
                ${extraFields}
            </form>
        `;

        window.app.ui.openModal(repId ? `Editar Revendedor (${type})` : `Novo Revendedor (${type})`, html, () => {
            if(!document.getElementById('form-reseller').reportValidity()) return;

            const newRep = {
                type: type,
                companyName: document.getElementById('res-company').value,
                city: document.getElementById('res-city').value,
            };
            
            if (type === 'potential') {
                newRep.pendingItems = window._tempItemsRes;
            } else {
                newRep.balancesPurchased = parseInt(document.getElementById('res-balances').value) || 0;
            }

            if (repId) window.app.store.updateReseller(repId, newRep);
            else window.app.store.addReseller(newRep);
            
            window.app.ui.closeModal();
            this.render();
            window.app.views.dashboard.render();
        });

        if (type === 'potential') this._renderItemsList();
    },

    edit(id, type) { this.openModal(id, type); },
    delete(id) {
        if(confirm("Tem certeza que deseja excluir?")) {
            window.app.store.deleteReseller(id);
            this.render();
            window.app.views.dashboard.render();
        }
    },

    addItem() {
        const input = document.getElementById('res-new-item');
        if (input.value.trim()) {
            window._tempItemsRes.push(input.value.trim());
            input.value = '';
            this._renderItemsList();
        }
    },
    removeItem(idx) {
        window._tempItemsRes.splice(idx, 1);
        this._renderItemsList();
    },
    _renderItemsList() {
        const ul = document.getElementById('res-items-list');
        ul.innerHTML = window._tempItemsRes.map((item, i) => `
            <li>
                <span>${window.app.ui.escapeHtml(item)}</span>
                <button type="button" class="icon-btn text-danger" onclick="window.app.views.resellers.removeItem(${i})">X</button>
            </li>
        `).join('');
    }
};
