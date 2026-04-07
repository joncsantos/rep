window.app = window.app || {};
window.app.views = window.app.views || {};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

window.app.views.agenda = {
    state: {
        year: 2026,
        month: 0, 
        selectedDate: '2026-01-01'
    },
    initialized: false,
    
    init() {
        const today = new Date();
        // Start on 2026 as per user requirement, but with current month
        this.state.year = 2026;
        this.state.month = today.getMonth(); 
        
        let d = today.getDate();
        if (d < 10) d = '0' + d;
        let m = this.state.month + 1;
        if (m < 10) m = '0' + m;
        this.state.selectedDate = `2026-${m}-${d}`;
    },

    render() {
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }
        this._renderCalendar();
        this._renderAgendaItems();
    },

    changeMonth(dir) {
        this.state.month += dir;
        if (this.state.month > 11) {
            this.state.month = 0;
            this.state.year++;
        } else if (this.state.month < 0) {
            this.state.month = 11;
            this.state.year--;
        }
        this._renderCalendar();
    },

    selectDate(dateStr) {
        this.state.selectedDate = dateStr;
        this._renderCalendar(); 
        this._renderAgendaItems();
    },

    _renderCalendar() {
        document.getElementById('cal-month-year').innerText = `${MONTHS[this.state.month]} ${this.state.year}`;
        const grid = document.getElementById('calendar-days-grid');
        
        const firstDay = new Date(this.state.year, this.state.month, 1);
        const lastDay = new Date(this.state.year, this.state.month + 1, 0);
        
        // Days of week: 0(Sun) to 6(Sat)
        let startingDay = firstDay.getDay(); 
        const totalDays = lastDay.getDate();
        
        let html = '';
        for (let i = 0; i < startingDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        
        const todayStr = new Date().toISOString().split('T')[0];
        const allEvents = window.app.store.data.agenda || [];

        for (let day = 1; day <= totalDays; day++) {
            let m = this.state.month + 1;
            m = m < 10 ? '0' + m : m;
            let d = day < 10 ? '0' + day : day;
            let dateStr = `${this.state.year}-${m}-${d}`;
            
            let classes = ['calendar-day'];
            if (dateStr === this.state.selectedDate) classes.push('active');
            if (dateStr === todayStr) classes.push('today');
            
            const dayEvents = allEvents.filter(e => e.date === dateStr);
            let indicatorsHtml = '';
            
            if (dayEvents.length > 0) {
                indicatorsHtml = '<div class="calendar-day-indicators">';
                dayEvents.forEach(ev => {
                    indicatorsHtml += `<div class="event-dot bg-${ev.color || 'primary'}"></div>`;
                });
                indicatorsHtml += '</div>';
            }

            html += `
                <div class="${classes.join(' ')}" onclick="window.app.views.agenda.selectDate('${dateStr}')">
                    <div class="calendar-day-num">${day}</div>
                    ${indicatorsHtml}
                </div>
            `;
        }
        
        grid.innerHTML = html;
    },

    _renderAgendaItems() {
        const dateStr = this.state.selectedDate;
        const [y, m, d] = dateStr.split('-');
        document.getElementById('agenda-selected-date').innerText = `${d}/${m}/${y}`;
        
        const ul = document.getElementById('agenda-daily-list');
        const allEvents = window.app.store.data.agenda || [];
        const dayEvents = allEvents.filter(e => e.date === dateStr);
        
        dayEvents.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
        
        if (dayEvents.length === 0) {
            ul.innerHTML = `<li><div class="text-tertiary mt-md pt-sm" style="text-align:center;">Nenhuma atividade para este dia.</div></li>`;
            return;
        }

        ul.innerHTML = dayEvents.map(ev => {
            const colorVar = `var(--${ev.color || 'primary'})`;
            const colorHex = ev.color === 'purple' ? '#8b5cf6' : colorVar;
            
            // Fix text color for specific bg classes by mapping them
            return `
            <li class="agenda-item" style="border-left-color: ${colorHex}">
                <div class="agenda-item-header">
                    <span class="agenda-item-title">${window.app.ui.escapeHtml(ev.title)}</span>
                    <span class="agenda-item-time">${ev.time ? ev.time : 'Dia todo'}</span>
                </div>
                ${ev.description ? `<div class="agenda-item-desc">${window.app.ui.escapeHtml(ev.description)}</div>` : ''}
                <div class="agenda-item-actions d-flex justify-end mt-sm" style="gap:8px;">
                    <button class="icon-btn btn-sm" style="color:var(--text-secondary);" onclick="window.app.views.agenda.openModal('${ev.id}')">Editar</button>
                    <button class="icon-btn btn-sm text-danger" onclick="window.app.views.agenda.deleteEvent('${ev.id}')">Excluir</button>
                </div>
            </li>
            `;
        }).join('');
    },

    openModal(eventId = null) {
        let ev = { title: '', description: '', time: '', color: 'primary', date: this.state.selectedDate };
        
        if (eventId) {
            ev = (window.app.store.data.agenda || []).find(e => e.id === eventId) || ev;
        }

        const colors = [
            { id: 'primary', label: 'Azul' },
            { id: 'success', label: 'Verde' },
            { id: 'warning', label: 'Amarelo' },
            { id: 'danger', label: 'Vermelho' },
            { id: 'purple', label: 'Roxo' }
        ];

        window._tempEventColor = ev.color;

        const html = `
            <form id="form-agenda" class="form-grid full">
                <div class="form-group">
                    <label class="form-label">Data</label>
                    <input type="date" id="ag-date" class="form-control" value="${ev.date}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Título *</label>
                    <input type="text" id="ag-title" class="form-control" value="${window.app.ui.escapeHtml(ev.title)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Horário (opcional)</label>
                    <input type="time" id="ag-time" class="form-control" value="${ev.time}">
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição (opcional)</label>
                    <textarea id="ag-desc" class="form-control" rows="3" style="resize:vertical;">${window.app.ui.escapeHtml(ev.description)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Cor da Atividade</label>
                    <div class="color-picker" id="ag-color-picker">
                        ${colors.map(c => `
                            <div class="color-swatch bg-${c.id} ${ev.color === c.id ? 'selected' : ''}" 
                                 onclick="window.app.views.agenda.selectColor('${c.id}')"
                                 title="${c.label}"></div>
                        `).join('')}
                    </div>
                </div>
            </form>
        `;

        window.app.ui.openModal(eventId ? 'Editar Atividade' : 'Nova Atividade', html, () => {
            if(!document.getElementById('form-agenda').reportValidity()) return;

            const updatedEvent = {
                title: document.getElementById('ag-title').value,
                date: document.getElementById('ag-date').value,
                time: document.getElementById('ag-time').value,
                description: document.getElementById('ag-desc').value,
                color: window._tempEventColor
            };

            if (eventId) {
                window.app.store.updateAgendaEvent(eventId, updatedEvent);
            } else {
                window.app.store.addAgendaEvent(updatedEvent);
            }
            
            // Navigate if date changed
            if (updatedEvent.date !== this.state.selectedDate) {
                const [y, m] = updatedEvent.date.split('-');
                this.state.year = parseInt(y, 10);
                this.state.month = parseInt(m, 10) - 1;
                this.selectDate(updatedEvent.date);
            } else {
                this.render(); 
            }
            
            window.app.ui.closeModal();
        });
    },

    selectColor(colorId) {
        window._tempEventColor = colorId;
        document.querySelectorAll('#ag-color-picker .color-swatch').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`#ag-color-picker .bg-${colorId}`).classList.add('selected');
    },

    deleteEvent(eventId) {
        if(confirm("Deseja realmente excluir esta atividade?")) {
            window.app.store.deleteAgendaEvent(eventId);
            this.render();
        }
    }
};
