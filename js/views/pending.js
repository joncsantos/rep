window.app = window.app || {};
window.app.views = window.app.views || {};

window.app.views.pending = {
    render() {
        const tbody = document.querySelector('#table-pending tbody');
        let itemsList = [];
        
        const store = window.app.store.data;
        
        // Current Rep Tasks and Pending Items
        if (store.currentReps) {
            store.currentReps.forEach(rep => {
                if (rep.tasks) {
                    rep.tasks.forEach(task => {
                        if (!task.isCompleted) {
                            itemsList.push({
                                type: 'Tarefa',
                                category: `Representante Atual`,
                                client: rep.companyName ? `${rep.repName} - ${rep.companyName}` : rep.repName,
                                desc: task.description,
                                deadline: task.deadline,
                                isOverdue: window.app.ui.isExpired(task.deadline),
                                viewTarget: 'current-reps',
                                targetId: rep.id,
                                targetType: null,
                                id: task.id
                            });
                        }
                    });
                }
                if (rep.pendingItems) {
                    rep.pendingItems.forEach(item => {
                        itemsList.push({
                            type: 'Pendência',
                            category: `Representante Atual`,
                            client: rep.companyName ? `${rep.repName} - ${rep.companyName}` : rep.repName,
                            desc: item,
                            deadline: null,
                            isOverdue: false,
                            viewTarget: 'current-reps',
                            targetId: rep.id,
                            targetType: null
                        });
                    });
                }
            });
        }
        
        // Potential Reps Pending Items
        if (store.potentialReps) {
            store.potentialReps.forEach(rep => {
                if (rep.pendingItems) {
                    rep.pendingItems.forEach(item => {
                        itemsList.push({
                            type: 'Pendência',
                            category: `Potencial`,
                            client: rep.companyName ? `${rep.repName} - ${rep.companyName}` : rep.repName,
                            desc: item,
                            deadline: null,
                            isOverdue: false,
                            viewTarget: 'potential-reps',
                            targetId: rep.id,
                            targetType: null
                        });
                    });
                }
            });
        }
        
        // Resellers (Potential) Pending Items
        if (store.resellers) {
            store.resellers.forEach(rep => {
                if (rep.type === 'potential' && rep.pendingItems) {
                    rep.pendingItems.forEach(item => {
                        itemsList.push({
                            type: 'Pendência',
                            category: `Revenda (Potencial)`,
                            client: rep.companyName || 'N/A',
                            desc: item,
                            deadline: null,
                            isOverdue: false,
                            viewTarget: 'resellers',
                            targetId: rep.id,
                            targetType: 'potential'
                        });
                    });
                }
            });
        }
        
        // Sort items
        itemsList.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            if (a.deadline && !b.deadline) return -1;
            if (!a.deadline && b.deadline) return 1;
            
            return 0; // maintain relative order
        });
        
        if (itemsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-tertiary)">Nenhuma pendência ou tarefa encontrada. Muito bem!</td></tr>';
            return;
        }

        tbody.innerHTML = itemsList.map(item => {
            const rowClass = item.isOverdue ? 'row-danger' : '';
            const badgeTitle = item.type === 'Tarefa' ? 'success' : 'warning';
            
            let formattedDeadline = item.deadline ? window.app.ui.formatDate(item.deadline) : '-';
            if (item.isOverdue) formattedDeadline = `<strong>${formattedDeadline} (Atrasada)</strong>`;
            
            return `
                <tr class="${rowClass}">
                    <td><span class="status-badge status-${badgeTitle}" style="font-size: 0.75rem">${item.type}</span></td>
                    <td>
                        <strong>${window.app.ui.escapeHtml(item.category)}</strong><br>
                        <small class="text-tertiary">${window.app.ui.escapeHtml(item.client)}</small>
                    </td>
                    <td>${window.app.ui.escapeHtml(item.desc)}</td>
                    <td style="color: ${item.isOverdue ? 'var(--danger)' : 'inherit'}">${formattedDeadline}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="window.app.views.pending.openTarget('${item.viewTarget}', '${item.targetId}', ${item.targetType ? `'${item.targetType}'` : 'null'})">Ver/Editar</button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    openTarget(viewTarget, targetId, targetType) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const navBtn = document.querySelector(`.nav-item[data-view='${viewTarget}']`);
        if(navBtn) navBtn.classList.add('active');
        
        window.app.ui.switchView(viewTarget); 
        setTimeout(() => {
            if(viewTarget === 'current-reps') window.app.views.currentReps.edit(targetId);
            else if(viewTarget === 'potential-reps') window.app.views.potentialReps.edit(targetId);
            else if(viewTarget === 'resellers') window.app.views.resellers.edit(targetId, targetType);
        }, 50);
    }
};
