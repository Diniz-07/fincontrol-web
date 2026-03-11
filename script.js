// --- script.js (VERSÃO FINAL COMPLETA - NGROK CLOUD) ---

const URL_BACKEND = 'https://raye-bloomy-connectedly.ngrok-free.dev'; 
const usuarioId = localStorage.getItem('usuarioId');
const usuarioNome = localStorage.getItem('usuarioNome');

// 1. PROTEÇÃO DE ROTA (Chuta quem tentar acessar sem login)
if (!usuarioId) { 
    window.location.href = 'login.html'; 
}

// 2. CONFIGURAÇÃO DOS ALERTAS
const Toast = Swal.mixin({ 
    toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true, background: '#161b22', color: '#fff', iconColor: '#3b82f6' 
});

// 3. CABEÇALHOS DO NGROK (Pula a tela de aviso de segurança)
const headersPadrao = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };
const headersGet = { 'ngrok-skip-browser-warning': 'true' };

// 4. MOTOR DE ÍCONES
function obterIcone(descricao) {
    const desc = descricao.toLowerCase();
    if (desc.includes('salario') || desc.includes('pix')) return '<i class="bi bi-cash-stack text-success me-2"></i>';
    if (desc.includes('ifood') || desc.includes('lanche') || desc.includes('comida')) return '<i class="bi bi-egg-fried text-warning me-2"></i>';
    if (desc.includes('gasolina') || desc.includes('moto') || desc.includes('adv')) return '<i class="bi bi-fuel-pump text-info me-2"></i>';
    if (desc.includes('internet') || desc.includes('net') || desc.includes('vivo')) return '<i class="bi bi-wifi text-primary me-2"></i>';
    if (desc.includes('luz') || desc.includes('energia')) return '<i class="bi bi-lightning-charge text-warning me-2"></i>';
    if (desc.includes('aluguel') || desc.includes('casa')) return '<i class="bi bi-house-door text-danger me-2"></i>';
    if (desc.includes('mercado') || desc.includes('compra')) return '<i class="bi bi-cart3 text-success me-2"></i>';
    return '<i class="bi bi-dot text-muted me-2"></i>';
}

// 5. INICIALIZAÇÃO DA TELA
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-usuario-logado').innerText = usuarioNome;
    const inputMes = document.getElementById('filtroMes');
    inputMes.value = new Date().toISOString().slice(0, 7); 
    inputMes.addEventListener('change', carregarPainel);
    carregarPainel();
});

let meuGrafico = null, totalReceitasGlobal = 0, totalDespesasGlobal = 0;
function formatarReais(valor) { return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function formatarData(dataString) { return dataString ? dataString.split('-').reverse().join('/') : '-'; }
window.limparForm = function(formId, idInput) { document.getElementById(formId).reset(); document.getElementById(idInput).value = ''; };
window.sairDoSistema = function() { localStorage.clear(); window.location.href = 'login.html'; }

// 6. GRÁFICO RESUMO
function atualizarGrafico() {
    const ctx = document.getElementById('graficoResumo').getContext('2d');
    if(meuGrafico) meuGrafico.destroy(); 
    if(totalReceitasGlobal === 0 && totalDespesasGlobal === 0) { 
        meuGrafico = new Chart(ctx, { type: 'doughnut', data: { datasets: [{ data: [1], backgroundColor: ['#30363d'] }] }, options: { cutout: '80%', plugins: { tooltip: { enabled: false } } } }); 
        return; 
    }
    meuGrafico = new Chart(ctx, { type: 'doughnut', data: { labels: ['Entradas', 'Saídas'], datasets: [{ data: [totalReceitasGlobal, totalDespesasGlobal], backgroundColor: ['#00ff88', '#ff4d4d'], hoverOffset: 4, borderWidth: 0 }] }, options: { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

// 7. BUSCA DE DADOS (READ)
async function carregarReceitas() {
    const res = await fetch(`${URL_BACKEND}/receitas`, { headers: headersGet });
    const dados = await res.json();
    const lista = dados.filter(d => d.usuario && d.usuario.id == usuarioId && d.dataReceita.startsWith(document.getElementById('filtroMes').value));
    totalReceitasGlobal = lista.reduce((acc, r) => acc + r.valor, 0); 
    const tbody = document.getElementById('tabela-receitas');
    tbody.innerHTML = lista.length === 0 ? '<tr><td class="text-white-50 text-center py-4">Nenhum lançamento</td></tr>' : '';
    lista.forEach(d => { 
        tbody.innerHTML += `<tr class="align-middle"><td><div class="text-white fw-bold d-flex align-items-center">${obterIcone(d.descricao)} ${d.descricao}</div><div class="text-white-50 small ps-4">${formatarData(d.dataReceita)}</div></td><td class="text-success fw-bold text-end">+ ${formatarReais(d.valor)}</td><td class="text-end"><button class="btn btn-sm btn-link text-primary p-1" onclick="editarReceita(${d.id}, '${d.descricao}', ${d.valor}, '${d.dataReceita}')"><i class="bi bi-pencil-square"></i></button><button class="btn btn-sm btn-link text-danger p-1" onclick="apagarReceita(${d.id})"><i class="bi bi-trash3"></i></button></td></tr>`; 
    });
}

async function carregarDespesas() {
    const res = await fetch(`${URL_BACKEND}/despesas`, { headers: headersGet });
    const dados = await res.json();
    const lista = dados.filter(d => d.usuario && d.usuario.id == usuarioId && d.dataDespesa.startsWith(document.getElementById('filtroMes').value));
    totalDespesasGlobal = lista.reduce((acc, d) => acc + d.valor, 0); 
    const tbody = document.getElementById('tabela-despesas');
    tbody.innerHTML = lista.length === 0 ? '<tr><td class="text-white-50 text-center py-4">Nenhum lançamento</td></tr>' : '';
    lista.forEach(d => { 
        tbody.innerHTML += `<tr class="align-middle"><td><div class="text-white fw-bold d-flex align-items-center">${obterIcone(d.descricao)} ${d.descricao}</div><div class="text-white-50 small ps-4">${formatarData(d.dataDespesa)}</div></td><td class="text-danger fw-bold text-end">- ${formatarReais(d.valor)}</td><td class="text-end"><button class="btn btn-sm btn-link text-primary p-1" onclick="editarDespesa(${d.id}, '${d.descricao}', ${d.valor}, '${d.dataDespesa}')"><i class="bi bi-pencil-square"></i></button><button class="btn btn-sm btn-link text-danger p-1" onclick="apagarDespesa(${d.id})"><i class="bi bi-trash3"></i></button></td></tr>`; 
    });
}

async function carregarMetas() {
    const res = await fetch(`${URL_BACKEND}/metas`, { headers: headersGet });
    const dados = await res.json();
    const lista = dados.filter(m => m.usuario && m.usuario.id == usuarioId);
    const container = document.getElementById('lista-metas');
    container.innerHTML = lista.length === 0 ? '<div class="col-12 text-center text-white-50 py-3">Crie seu primeiro objetivo!</div>' : '';
    lista.forEach(meta => {
        let porcentagem = Math.min((meta.valorAtual / meta.valorMeta) * 100, 100);
        container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card bg-dark border-secondary h-100 p-3 shadow-sm">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-white fw-bold"><i class="bi bi-trophy text-warning me-2"></i>${meta.nomeMeta}</span>
                        <div class="text-nowrap">
                            <button class="btn btn-sm btn-link text-primary p-0 me-2" onclick="editarMeta(${meta.id}, '${meta.nomeMeta}', ${meta.valorMeta}, ${meta.valorAtual}, '${meta.dataLimite}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0" onclick="apagarMeta(${meta.id})"><i class="bi bi-x-circle"></i></button>
                        </div>
                    </div>
                    <div class="progress mb-2"><div class="progress-bar bg-primary shadow-sm" style="width: ${porcentagem}%"></div></div>
                    <div class="d-flex justify-content-between small">
                        <span class="text-white-50">${formatarReais(meta.valorAtual)} / ${formatarReais(meta.valorMeta)}</span>
                        <span class="text-primary fw-bold">${porcentagem.toFixed(0)}%</span>
                    </div>
                </div>
            </div>`;
    });
}

// 8. FUNÇÃO MESTRE
async function carregarPainel() {
    try {
        await carregarReceitas(); await carregarDespesas(); await carregarMetas();
        const saldoTotal = totalReceitasGlobal - totalDespesasGlobal;
        const el = document.getElementById('valor-saldo');
        el.innerText = formatarReais(saldoTotal);
        el.className = saldoTotal < 0 ? "display-3 fw-bold text-danger text-center" : "display-3 fw-bold text-success text-center";
        atualizarGrafico();
    } catch (e) { console.error("Erro na conexão:", e); }
}

// 9. EXCLUSÃO (DELETE)
async function apagarReceita(id) { const res = await Swal.fire({ title: 'Excluir?', text: 'Essa ação não pode ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#ef4444', confirmButtonText: 'Sim', background: '#161b22', color: '#fff' }); if (res.isConfirmed) { await fetch(`${URL_BACKEND}/receitas/${id}`, { method: 'DELETE', headers: headersGet }); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Excluído!' }); } }
async function apagarDespesa(id) { const res = await Swal.fire({ title: 'Excluir?', text: 'Essa ação não pode ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#ef4444', confirmButtonText: 'Sim', background: '#161b22', color: '#fff' }); if (res.isConfirmed) { await fetch(`${URL_BACKEND}/despesas/${id}`, { method: 'DELETE', headers: headersGet }); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Excluído!' }); } }
async function apagarMeta(id) { const res = await Swal.fire({ title: 'Remover Meta?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#ef4444', background: '#161b22', color: '#fff' }); if (res.isConfirmed) { await fetch(`${URL_BACKEND}/metas/${id}`, { method: 'DELETE', headers: headersGet }); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Removida!' }); } }

// 10. INSERÇÃO E ATUALIZAÇÃO (POST / PUT)
document.getElementById('formReceita').addEventListener('submit', async e => { e.preventDefault(); const id = document.getElementById('idReceita').value; await fetch(id ? `${URL_BACKEND}/receitas/${id}` : `${URL_BACKEND}/receitas`, { method: id ? 'PUT' : 'POST', headers: headersPadrao, body: JSON.stringify({ descricao: document.getElementById('descReceita').value, valor: document.getElementById('valorReceita').value, dataReceita: document.getElementById('dataReceita').value, usuario: {id: usuarioId}, categoria: {id: 1} }) }); bootstrap.Modal.getInstance('#modalReceita').hide(); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Salvo!' }); });
document.getElementById('formDespesa').addEventListener('submit', async e => { e.preventDefault(); const id = document.getElementById('idDespesa').value; await fetch(id ? `${URL_BACKEND}/despesas/${id}` : `${URL_BACKEND}/despesas`, { method: id ? 'PUT' : 'POST', headers: headersPadrao, body: JSON.stringify({ descricao: document.getElementById('descDespesa').value, valor: document.getElementById('valorDespesa').value, dataDespesa: document.getElementById('dataDespesa').value, usuario: {id: usuarioId}, categoria: {id: 2} }) }); bootstrap.Modal.getInstance('#modalDespesa').hide(); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Salvo!' }); });
document.getElementById('formMeta').addEventListener('submit', async e => { e.preventDefault(); const id = document.getElementById('idMeta').value; await fetch(id ? `${URL_BACKEND}/metas/${id}` : `${URL_BACKEND}/metas`, { method: id ? 'PUT' : 'POST', headers: headersPadrao, body: JSON.stringify({ nomeMeta: document.getElementById('nomeMeta').value, valorMeta: parseFloat(document.getElementById('valorMeta').value), valorAtual: parseFloat(document.getElementById('valorAtual').value), dataLimite: document.getElementById('dataLimite').value, usuario: {id: usuarioId} }) }); bootstrap.Modal.getInstance('#modalMeta').hide(); await carregarPainel(); Toast.fire({ icon: 'success', title: 'Meta salva!' }); });

// 11. PREENCHIMENTO DOS MODAIS PARA EDIÇÃO
window.editarReceita = function(id, desc, valor, data) { document.getElementById('idReceita').value = id; document.getElementById('descReceita').value = desc; document.getElementById('valorReceita').value = valor; document.getElementById('dataReceita').value = data; new bootstrap.Modal('#modalReceita').show(); };
window.editarDespesa = function(id, desc, valor, data) { document.getElementById('idDespesa').value = id; document.getElementById('descDespesa').value = desc; document.getElementById('valorDespesa').value = valor; document.getElementById('dataDespesa').value = data; new bootstrap.Modal('#modalDespesa').show(); };
window.editarMeta = function(id, nome, valorM, valorA, data) { document.getElementById('idMeta').value = id; document.getElementById('nomeMeta').value = nome; document.getElementById('valorMeta').value = valorM; document.getElementById('valorAtual').value = valorA; document.getElementById('dataLimite').value = data; new bootstrap.Modal('#modalMeta').show(); };