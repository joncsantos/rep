window.app = window.app || {};
window.app.views = window.app.views || {};

window.app.views.currentReps = {
    render() {
        const tbody = document.querySelector('#table-current-reps tbody');
        const data = window.app.store.data.currentReps;
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color: var(--text-tertiary)">Nenhum representante atual cadastrado.</td></tr>';
            return;
        }

        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        tbody.innerHTML = data.map(rep => {
            const isExpired = window.app.ui.isExpired(rep.contractExpiration);
            const rowClass = isExpired ? 'row-danger' : '';
            
            const docsStatus = rep.docsUpToDate 
                ? '<span class="status-badge status-success">Sim</span>'
                : '<span class="status-badge status-danger">Pendente</span>';
            
            const contStatus = rep.activeContract
                ? '<span class="status-badge status-success">Ativo</span>'
                : '<span class="status-badge status-warning">Inativo</span>';

            const pendingTasks = (rep.tasks || []).filter(t => !t.isCompleted);
            let tasksHtml = '';
            if (pendingTasks.length > 0) {
                tasksHtml = '<ul style="margin: 0; padding-left: 0; list-style: none; font-size: 0.8rem;">' + 
                    pendingTasks.map(t => {
                        const isLate = window.app.ui.isExpired(t.deadline);
                        const style = isLate ? "color: var(--danger); font-weight: 600;" : "";
                        return `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;">
                                    <input type="checkbox" onchange="window.app.views.currentReps.completeTask('${rep.id}', '${t.id}')" title="Concluir tarefa" style="margin-top:2px;">
                                    <span style="${style}">${window.app.ui.escapeHtml(t.description)} (${window.app.ui.formatDate(t.deadline)})</span>
                                </li>`;
                    }).join('') + 
                '</ul>';
            } else {
                tasksHtml = '<span class="text-tertiary" style="font-size: 0.8rem;">Nenhuma pendente</span>';
            }

            return `
                <tr class="${rowClass}">
                    <td><strong>${window.app.ui.escapeHtml(rep.repName)}</strong></td>
                    <td>${window.app.ui.escapeHtml(rep.companyName)}</td>
                    <td>${window.app.ui.escapeHtml(rep.city)}</td>
                    <td>${contStatus} ${isExpired ? '<br><small class="text-danger">Aviso: Expirado</small>' : ''}</td>
                    <td>${docsStatus}</td>
                    <td>${rep.totalOpportunities} (${rep.activeOpportunities} AT)</td>
                    <td>${formatter.format(rep.salesValueUSD || 0)}</td>
                    <td>${tasksHtml}</td>
                    <td>
                        <button class="icon-btn" onclick="window.app.views.currentReps.edit('${rep.id}')" title="Editar">
                           Editar
                        </button>
                        <button class="icon-btn text-danger" onclick="window.app.views.currentReps.delete('${rep.id}')" title="Excluir">
                           Excluir
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openModal(repId = null) {
        let rep = {
            repName: '', companyName: '', city: '', activeContract: true,
            contractStart: '', contractExpiration: '', totalOpportunities: 0,
            activeOpportunities: 0, salesValueUSD: 0, docsUpToDate: false,
            pendingItems: [], tasks: []
        };
        
        if (repId) {
            rep = window.app.store.data.currentReps.find(r => r.id === repId) || rep;
        }

        // Store active items globally for the modal
        window._tempItems = [...(rep.pendingItems || [])];
        window._tempTasks = [...(rep.tasks || [])];

        const html = `
            <form id="form-current-rep" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Nome do Representante *</label>
                    <input type="text" id="cr-name" class="form-control" value="${window.app.ui.escapeHtml(rep.repName)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Empresa</label>
                    <input type="text" id="cr-company" class="form-control" value="${window.app.ui.escapeHtml(rep.companyName)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Cidade de Operação *</label>
                    <input type="text" id="cr-city" class="form-control" value="${window.app.ui.escapeHtml(rep.city)}" required>
                </div>
                <div class="form-group d-flex align-center" style="gap:16px;">
                    <div class="form-check pt-4">
                        <input type="checkbox" id="cr-active" class="form-check-input" ${rep.activeContract ? 'checked' : ''}>
                        <label class="form-label" style="margin:0;">Contrato Ativo</label>
                    </div>
                    <div class="form-check pt-4">
                        <input type="checkbox" id="cr-docs" class="form-check-input" ${rep.docsUpToDate ? 'checked' : ''}>
                        <label class="form-label" style="margin:0;">Documentação Atualizada</label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Data de Início</label>
                    <input type="date" id="cr-start" class="form-control" value="${rep.contractStart}">
                </div>
                <div class="form-group">
                    <label class="form-label">Data de Vencimento ${window.app.ui.isExpired(rep.contractExpiration) ? '<span class="text-danger">(Expirado)</span>' : ''}</label>
                    <input type="date" id="cr-exp" class="form-control" value="${rep.contractExpiration}">
                </div>
                <div class="form-group">
                    <label class="form-label">Total de Oportunidades</label>
                    <input type="number" id="cr-total-opps" class="form-control" value="${rep.totalOpportunities}">
                </div>
                <div class="form-group">
                    <label class="form-label">Oportunidades Ativas</label>
                    <input type="number" id="cr-active-opps" class="form-control" value="${rep.activeOpportunities}">
                </div>
                <div class="form-group full">
                    <label class="form-label">Valor Venda (USD)</label>
                    <input type="number" step="0.01" id="cr-sales" class="form-control" value="${rep.salesValueUSD}">
                </div>
                
                <hr class="full mt-md mb-md" style="border: 0; border-top: 1px solid var(--border);">
                
                <div class="form-group full">
                    <label class="form-label">Itens Pendentes</label>
                    <div class="d-flex" style="gap:8px;">
                        <input type="text" id="cr-new-item" class="form-control" placeholder="Descrever pendência...">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.views.currentReps.addItem()">Adicionar</button>
                    </div>
                    <ul id="cr-items-list" class="item-list mt-sm"></ul>
                </div>
                
                <div class="form-group full">
                    <label class="form-label">Tarefas com Prazo</label>
                    <div class="d-flex" style="gap:8px;">
                        <textarea id="cr-new-task-desc" class="form-control" placeholder="Descrever tarefa..." rows="2" style="flex: 1; resize: vertical;"></textarea>
                        <div class="d-flex" style="flex-direction: column; gap: 8px;">
                            <input type="date" id="cr-new-task-date" class="form-control" style="width: 140px;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.views.currentReps.addTask()">Adicionar</button>
                        </div>
                    </div>
                    <ul id="cr-tasks-list" class="item-list mt-sm"></ul>
                </div>
            </form>
        `;

        window.app.ui.openModal(repId ? 'Editar Representante Atual' : 'Novo Representante Atual', html, () => {
            if(!document.getElementById('form-current-rep').reportValidity()) return;

            const newRep = {
                repName: document.getElementById('cr-name').value,
                companyName: document.getElementById('cr-company').value,
                city: document.getElementById('cr-city').value,
                activeContract: document.getElementById('cr-active').checked,
                docsUpToDate: document.getElementById('cr-docs').checked,
                contractStart: document.getElementById('cr-start').value,
                contractExpiration: document.getElementById('cr-exp').value,
                totalOpportunities: parseInt(document.getElementById('cr-total-opps').value) || 0,
                activeOpportunities: parseInt(document.getElementById('cr-active-opps').value) || 0,
                salesValueUSD: parseFloat(document.getElementById('cr-sales').value) || 0,
                pendingItems: window._tempItems,
                tasks: window._tempTasks
            };

            if (repId) {
                window.app.store.updateCurrentRep(repId, newRep);
            } else {
                window.app.store.addCurrentRep(newRep);
            }
            
            window.app.ui.closeModal();
            this.render();
            window.app.views.dashboard.render();
        });

        // initial render of lists
        this._renderItemsList();
        this._renderTasksList();
    },

    edit(id) {
        this.openModal(id);
    },

    completeTask(repId, taskId) {
        const rep = window.app.store.data.currentReps.find(r => r.id === repId);
        if (rep && rep.tasks) {
            const task = rep.tasks.find(t => t.id === taskId);
            if (task) {
                task.isCompleted = true;
                window.app.store.updateCurrentRep(repId, rep);
                this.render();
            }
        }
    },

    delete(id) {
        if(confirm("Tem certeza que deseja excluir este representante?")) {
            window.app.store.deleteCurrentRep(id);
            this.render();
            window.app.views.dashboard.render();
        }
    },

    addItem() {
        const input = document.getElementById('cr-new-item');
        if (input.value.trim()) {
            window._tempItems.push(input.value.trim());
            input.value = '';
            this._renderItemsList();
        }
    },

    removeItem(idx) {
        window._tempItems.splice(idx, 1);
        this._renderItemsList();
    },

    addTask() {
        const desc = document.getElementById('cr-new-task-desc').value;
        const dt = document.getElementById('cr-new-task-date').value;
        if (desc.trim() && dt) {
            window._tempTasks.push({ id: Math.random().toString(), description: desc.trim(), deadline: dt, isCompleted: false });
            document.getElementById('cr-new-task-desc').value = '';
            document.getElementById('cr-new-task-date').value = '';
            this._renderTasksList();
        } else {
            alert('Preencha a descrição e defina o prazo (data) para a tarefa.');
        }
    },

    removeTask(idx) {
        window._tempTasks.splice(idx, 1);
        this._renderTasksList();
    },
    
    toggleTaskStatus(idx) {
        window._tempTasks[idx].isCompleted = !window._tempTasks[idx].isCompleted;
        this._renderTasksList();
    },

    _renderItemsList() {
        const ul = document.getElementById('cr-items-list');
        ul.innerHTML = window._tempItems.map((item, i) => `
            <li>
                <span>${window.app.ui.escapeHtml(item)}</span>
                <button type="button" class="icon-btn text-danger" onclick="window.app.views.currentReps.removeItem(${i})">X</button>
            </li>
        `).join('');
    },

    _renderTasksList() {
        const ul = document.getElementById('cr-tasks-list');
        ul.innerHTML = window._tempTasks.map((task, i) => {
            const overdue = !task.isCompleted && window.app.ui.isExpired(task.deadline);
            const style = overdue ? "color: var(--danger); font-weight: 600;" : (task.isCompleted ? "text-decoration: line-through; color: var(--text-tertiary);" : "");
            return `
            <li>
                <div class="d-flex align-center" style="gap: 8px;">
                    <input type="checkbox" ${task.isCompleted ? 'checked' : ''} onchange="window.app.views.currentReps.toggleTaskStatus(${i})">
                    <div style="${style}">
                        <strong>${window.app.ui.escapeHtml(task.description)}</strong>
                        <br><small>Prazo: ${window.app.ui.formatDate(task.deadline)} ${overdue ? '(Atrasada)' : ''}</small>
                    </div>
                </div>
                <button type="button" class="icon-btn text-danger" onclick="window.app.views.currentReps.removeTask(${i})">X</button>
            </li>
        `}).join('');
    }
};
