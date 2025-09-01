// ---------- Inicialização ----------
if(!localStorage.getItem('usuarios')){
    const defaultUsers = [
        {username:'admin', password:'admin123', role:'admin', mustChange:true},
        {username:'tecnico', password:'tec123', role:'tecnico', mustChange:false}
    ];
    localStorage.setItem('usuarios', JSON.stringify(defaultUsers));
}

if(!localStorage.getItem('clientes')) localStorage.setItem('clientes','[]');
if(!localStorage.getItem('pecas')) localStorage.setItem('pecas','[]');
if(!localStorage.getItem('ordens')) localStorage.setItem('ordens','[]');
if(!localStorage.getItem('garantias')) localStorage.setItem('garantias','[]');
if(!localStorage.getItem('estoque')) localStorage.setItem('estoque','[]');

// ---------- Função para formatar valores ----------
function formatBRL(valor){
    return parseFloat(valor).toLocaleString('pt-BR',{style:'currency', currency:'BRL'});
}

// ---------- Login ----------
function login(){
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const found = usuarios.find(u=>u.username===user && u.password===pass);
    if(found){
        sessionStorage.setItem('currentUser', JSON.stringify(found));
        showDashboard();
        if(found.mustChange){
            alert('Troque sua senha!');
            document.getElementById('trocaSenhaDiv').classList.remove('hidden');
        }
    } else alert('Usuário ou senha incorretos');
}

// ---------- Troca de senha ----------
function trocarSenha(){
    const nova = document.getElementById('novaSenha').value;
    if(nova.length<4){ alert('Senha muito curta'); return; }
    let user = JSON.parse(sessionStorage.getItem('currentUser'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const idx = usuarios.findIndex(u=>u.username===user.username);
    usuarios[idx].password = nova;
    usuarios[idx].mustChange = false;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    sessionStorage.setItem('currentUser', JSON.stringify(usuarios[idx]));
    alert('Senha alterada!');
    document.getElementById('trocaSenhaDiv').classList.add('hidden');
}

// ---------- Dashboard ----------
function showDashboard(){
    document.getElementById('loginDiv').classList.add('hidden');
    document.getElementById('dashboardDiv').classList.remove('hidden');
    loadClientes();
    loadPecas();
    loadOrdens();
    loadGarantias();
    loadEstoque();
}

// ---------- CRUD Clientes ----------
function addCliente(){
    const nome = document.getElementById('cNome').value;
    const tel = document.getElementById('cTel').value;
    const email = document.getElementById('cEmail').value;
    let clientes = JSON.parse(localStorage.getItem('clientes'));
    clientes.push({id:Date.now(), nome,tel,email});
    localStorage.setItem('clientes', JSON.stringify(clientes));
    loadClientes();
}

function loadClientes(){
    const clientes = JSON.parse(localStorage.getItem('clientes'));
    let html = '<tr><th>ID</th><th>Nome</th><th>Telefone</th><th>Email</th></tr>';
    clientes.forEach(c=>{
        html+=`<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.tel}</td><td>${c.email}</td></tr>`;
    });
    document.getElementById('clientesTable').innerHTML = html;
}

// ---------- CRUD Peças ----------
function addPeca(){
    const nome = document.getElementById('pNome').value;
    const qtd = parseInt(document.getElementById('pQtd').value);
    const vcomp = parseFloat(document.getElementById('pVcomp').value);
    const vvenda = parseFloat(document.getElementById('pVvenda').value);
    let pecas = JSON.parse(localStorage.getItem('pecas'));
    pecas.push({id:Date.now(), nome, quantidade:qtd, valor_compra:vcomp, valor_venda:vvenda});
    localStorage.setItem('pecas', JSON.stringify(pecas));
    loadPecas();
}

function loadPecas(){
    const pecas = JSON.parse(localStorage.getItem('pecas'));
    let totalCompra = 0;
    let totalVenda = 0;
    let html = '<tr><th>ID</th><th>Nome</th><th>Qtd</th><th>Compra</th><th>Venda</th><th>Total Venda</th></tr>';
    pecas.forEach(p=>{
        let total = p.quantidade * p.valor_venda;
        totalCompra += p.quantidade * p.valor_compra;
        totalVenda += total;
        html+=`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.quantidade}</td><td>${formatBRL(p.valor_compra)}</td><td>${formatBRL(p.valor_venda)}</td><td>${formatBRL(total)}</td></tr>`;
    });
    html+=`<tr><th colspan="3">Totais</th><th>${formatBRL(totalCompra)}</th><th>-</th><th>${formatBRL(totalVenda)}</th></tr>`;
    document.getElementById('pecasTable').innerHTML = html;
}

// ---------- CRUD Ordens ----------
function addOrdem(){
    const cliente = document.getElementById('oCliente').value;
    const produto = document.getElementById('oProduto').value;
    const defeito = document.getElementById('oDefeito').value;
    const servico = document.getElementById('oServico').value;
    const valor = parseFloat(document.getElementById('oValor').value);
    let ordens = JSON.parse(localStorage.getItem('ordens'));
    ordens.push({id:Date.now(), cliente, produto, defeito, servico, valor, status:'aberta', data: new Date().toLocaleDateString()});
    localStorage.setItem('ordens', JSON.stringify(ordens));
    loadOrdens();
}

function loadOrdens(){
    const ordens = JSON.parse(localStorage.getItem('ordens'));
    let total = 0;
    let html = '<tr><th>ID</th><th>Cliente</th><th>Produto</th><th>Defeito</th><th>Serviço</th><th>Valor</th><th>Status</th><th>Data</th><th>Data Conclusão</th><th>Ação</th></tr>';
    ordens.forEach(o=>{
        total += o.valor;
        html+=`<tr>
            <td>${o.id}</td>
            <td>${o.cliente}</td>
            <td>${o.produto}</td>
            <td>${o.defeito}</td>
            <td>${o.servico}</td>
            <td>${formatBRL(o.valor)}</td>
            <td>${o.status}</td>
            <td>${o.data}</td>
            <td>${o.data_conclusao ? o.data_conclusao : '-'}</td>
            <td>${o.status==='aberta'?`<button onclick="fecharOrdem(${o.id})">Fechar</button>`:'-'}</td>
        </tr>`;
    });
    html+=`<tr><th colspan="5">Total</th><th>${formatBRL(total)}</th><th colspan="4"></th></tr>`;
    document.getElementById('ordensTable').innerHTML = html;
}

// ---------- Fechar Ordem ----------
function fecharOrdem(id){
    let ordens = JSON.parse(localStorage.getItem('ordens'));
    const idx = ordens.findIndex(o => o.id === id);
    if(idx !== -1){
        let novoValor = prompt("Informe o valor final da ordem:", ordens[idx].valor);
        if(novoValor === null) return;
        ordens[idx].valor = parseFloat(novoValor);
        ordens[idx].status = 'concluída';
        ordens[idx].data_conclusao = new Date().toLocaleDateString();
        localStorage.setItem('ordens', JSON.stringify(ordens));
        loadOrdens();
    }
}

// ---------- Garantia ----------
function addGarantia(){
    const cliente = document.getElementById('gCliente').value;
    const produto = document.getElementById('gProduto').value;
    const defeito = document.getElementById('gDefeito').value;
    const servico = document.getElementById('gServico').value;
    let valor = parseFloat(document.getElementById('gValor').value);
    const extensao = document.getElementById('gExtensao').checked;
    if(extensao) valor += 50;
    let garantias = JSON.parse(localStorage.getItem('garantias'));
    garantias.push({
        id: Date.now(),
        cliente,
        produto,
        defeito,
        servico,
        valor,
        extensao,
        data: new Date().toLocaleDateString()
    });
    localStorage.setItem('garantias', JSON.stringify(garantias));
    loadGarantias();
}

function loadGarantias(){
    const garantias = JSON.parse(localStorage.getItem('garantias'));
    let total = 0;
    let html = '<tr><th>ID</th><th>Cliente</th><th>Produto</th><th>Defeito</th><th>Serviço</th><th>Valor</th><th>Garantia Ext.</th><th>Data</th></tr>';
    garantias.forEach(g=>{
        total += g.valor;
        html += `<tr>
            <td>${g.id}</td>
            <td>${g.cliente}</td>
            <td>${g.produto}</td>
            <td>${g.defeito}</td>
            <td>${g.servico}</td>
            <td>${formatBRL(g.valor)}</td>
            <td>${g.extensao ? 'Sim' : 'Não'}</td>
            <td>${g.data}</td>
        </tr>`;
    });
    html += `<tr><th colspan="5">Total</th><th>${formatBRL(total)}</th><th colspan="2"></th></tr>`;
    document.getElementById('garantiaTable').innerHTML = html;
}

// ---------- Estoque ----------
function addEstoque(){
    const nome = document.getElementById('eNome').value;
    const qtd = parseInt(document.getElementById('eQtd').value);
    const vcomp = parseFloat(document.getElementById('eVcomp').value);
    const vvenda = parseFloat(document.getElementById('eVvenda').value);
    let estoque = JSON.parse(localStorage.getItem('estoque'));
    estoque.push({
        id: Date.now(),
        nome,
        quantidade: qtd,
        valor_compra: vcomp,
        valor_venda: vvenda,
        data: new Date().toLocaleDateString()
    });
    localStorage.setItem('estoque', JSON.stringify(estoque));
    loadEstoque();
}

function saidaEstoque(){
    const nome = document.getElementById('eNome').value;
    const qtdSaida = parseInt(document.getElementById('eQtdSaida').value);
    let estoque = JSON.parse(localStorage.getItem('estoque'));
    const idx = estoque.findIndex(e => e.nome === nome);
    if(idx !== -1 && estoque[idx].quantidade >= qtdSaida){
        estoque[idx].quantidade -= qtdSaida;
        localStorage.setItem('estoque', JSON.stringify(estoque));
        loadEstoque();
    } else alert('Quantidade insuficiente ou produto não encontrado');
}

function loadEstoque(){
    const estoque = JSON.parse(localStorage.getItem('estoque'));
    let html = '<tr><th>ID</th><th>Nome</th><th>Qtd</th><th>Compra</th><th>Venda</th><th>Data Entrada</th></tr>';
    estoque.forEach(e=>{
        html += `<tr>
            <td>${e.id}</td>
            <td>${e.nome}</td>
            <td>${e.quantidade}</td>
            <td>${formatBRL(e.valor_compra)}</td>
            <td>${formatBRL(e.valor_venda)}</td>
            <td>${e.data}</td>
        </tr>`;
    });
    document.getElementById('estoqueTable').innerHTML = html;
}

// ---------- PDF ----------
function gerarPDF(tipo){
    let {jsPDF} = window.jspdf;
    let doc = new jsPDF();
    let titulo = '';
    let tabela;

    if(tipo === 'garantia'){
        titulo = 'Relatório de Garantias';
        tabela = document.getElementById('garantiaTable');
    }
    else if(tipo === 'estoque'){
        titulo = 'Relatório de Estoque';
        tabela = document.getElementById('estoqueTable');
    }
    else if(tipo === 'pecas'){
        titulo = 'Relatório de Peças';
        tabela = document.getElementById('pecasTable');
    }
    else{
        titulo = 'Relatório de Ordens';
        tabela = document.getElementById('ordensTable');
    }

    doc.text(titulo,10,10);
    doc.autoTable({html: tabela, startY:20});

    if(tipo === 'garantia'){
        doc.text('Cliente concorda com a taxa de extensão de R$50',10,doc.lastAutoTable.finalY + 10);
        doc.text('Assinatura: _______________________',10,doc.lastAutoTable.finalY + 20);
    }

    doc.save(titulo + '.pdf');
}

// ---------- Levantamento ----------
function levantamento(){
    const pecas = JSON.parse(localStorage.getItem('pecas'));
    const ordens = JSON.parse(localStorage.getItem('ordens'));
    const garantias = JSON.parse(localStorage.getItem('garantias'));
    const estoque = JSON.parse(localStorage.getItem('estoque'));

    let totalPecas = pecas.reduce((s,p)=>s + (p.quantidade * p.valor_venda),0);
    let totalOrdens = ordens.reduce((s,o)=>s + o.valor,0);
    let totalGarantia = garantias.reduce((s,g)=>s + g.valor,0);
    let totalEstoque = estoque.reduce((s,e)=>s + (e.quantidade * e.valor_venda),0);

    alert(`Levantamento Geral:
Total Peças (venda): ${formatBRL(totalPecas)}
Total Ordens: ${formatBRL(totalOrdens)}
Total Garantias: ${formatBRL(totalGarantia)}
Total Estoque (venda): ${formatBRL(totalEstoque)}
Total Geral: ${formatBRL(totalPecas + totalOrdens + totalGarantia + totalEstoque)}`);
}
function openTab(evt, tabName) {
    // Esconde todas as abas
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove a classe "active" de todos os botões
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostra a aba selecionada
    document.getElementById(tabName).style.display = "block";

    // Adiciona a classe "active" ao botão clicado
    evt.currentTarget.className += " active";
}