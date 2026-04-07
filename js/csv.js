function jsonToCsv(data) {
    if(!data || !data.length) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            let val = row[header];
            if (val === null || val === undefined) val = "";
            if (Array.isArray(val) || typeof val === 'object') {
                val = JSON.stringify(val);
            }
            // Escape quotes and wrap in quotes
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

function csvToJson(csv) {
    const lines = [];
    let l = '', r = [''], s = !0, p = '';
    for (let char of csv) {
        if ('"' === char) {
            if (s && char === p) r[r.length - 1] += char;
            s = !s;
        } else if (',' === char && s) char = r[r.length] = '';
        else if ('\n' === char && s) {
            if ('\r' === p) r[r.length - 1] = r[r.length - 1].slice(0, -1);
            lines.push(r);
            r = [''];
        } else r[r.length - 1] += char;
        p = char;
    }
    if (r[0] !== '') lines.push(r);
    
    if(lines.length < 2) return [];
    
    const headers = lines[0];
    const result = [];
    for(let i = 1; i < lines.length; i++) {
        if(lines[i].length === 1 && !lines[i][0]) continue; // skip empty line
        const obj = {};
        for(let j = 0; j < headers.length; j++) {
            let val = lines[i][j];
            try {
                // Determine if it was JSON array/object string
                if (val && (val.startsWith('[') || val.startsWith('{'))) {
                    val = JSON.parse(val);
                }
            } catch(e) {}
            // Determine booleans
            if (val === 'true') val = true;
            if (val === 'false') val = false;
            // Determine numbers if no spaces
            if (val && !isNaN(val) && typeof val === 'string' && val.trim() !== '') {
                // don't always parse numbers out of strings if it looks like a phone, etc.
                // But for simplicity, let it be. Actually, relying on the store types is better, let's keep strings where ambiguous.
            }

            obj[headers[j]] = val;
        }
        result.push(obj);
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    // Export Event
    document.getElementById('btnExportCSV').addEventListener('click', () => {
        const db = window.app.store.data;
        
        // Define an wrapper format to dump all 3 tables
        let csvContent = "";
        
        csvContent += "=== Current Representatives ===\n";
        csvContent += jsonToCsv(db.currentReps) + "\n\n";

        csvContent += "=== Potential Representatives ===\n";
        csvContent += jsonToCsv(db.potentialReps) + "\n\n";

        csvContent += "=== Resellers ===\n";
        csvContent += jsonToCsv(db.resellers) + "\n";
        
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `partner_manager_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Import Event
    document.getElementById('fileImportCSV').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const raw = evt.target.result;
            
            // Note: because the business requires managing 3 different structures, dumping them in one file 
            // requires splitting. Here we parse the exact format we generated.
            const sections = raw.split(/===\s.*?\s===\n/);
            
            // By splitting we get:
            // sections[0] (empty or junk before first header)
            // sections[1] Current Reps
            // sections[2] Potential Reps
            // sections[3] Resellers

            if (sections.length >= 4) {
               if(confirm("Deseja SOBRESCREVER todos os dados atuais por este backup?")) {
                  const currentReps = csvToJson(sections[1].trim() + "\n");
                  const potentialReps = csvToJson(sections[2].trim() + "\n");
                  const resellers = csvToJson(sections[3].trim() + "\n");
                  
                  // Clean up potentially parsed Number/Booleans 
                  currentReps.forEach(r => {
                      r.activeContract = r.activeContract === true || String(r.activeContract) === 'true';
                      r.docsUpToDate = r.docsUpToDate === true || String(r.docsUpToDate) === 'true';
                      r.totalOpportunities = Number(r.totalOpportunities) || 0;
                      r.activeOpportunities = Number(r.activeOpportunities) || 0;
                      r.salesValueUSD = Number(r.salesValueUSD) || 0;
                  });

                  window.app.store.overwriteAllData({
                      currentReps, potentialReps, resellers
                  });
                  
                  window.location.reload();
               }
            } else {
               alert("O formato do arquivo CSV não está em conformidade com o backup do sistema.");
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    });
});
