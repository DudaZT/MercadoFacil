// Estoque de produtos
if (!localStorage.getItem('estoque')) {
    const estoqueInicial = {
        'Açúcar': 10,
        'Azeite': 5,
        'Leite': 8,
        'Leite Condensado': 15,
        'Nescau': 7,
        'Sabonete': 20
    };
    localStorage.setItem('estoque', JSON.stringify(estoqueInicial));
}

// Função para obter o estoque atual
function getEstoque() {
    return JSON.parse(localStorage.getItem('estoque'));
}

// Função para atualizar o estoque
function updateEstoque(nome, quantidade) {
    const estoque = getEstoque();
    estoque[nome] = quantidade;
    localStorage.setItem('estoque', JSON.stringify(estoque));
    
    // Disparar evento para atualizar outras páginas
    if (typeof(Event) === 'function') {
        // Para navegadores modernos
        document.dispatchEvent(new Event('estoqueAtualizado'));
    } else {
        // Para navegadores antigos
        const event = document.createEvent('Event');
        event.initEvent('estoqueAtualizado', true, true);
        document.dispatchEvent(event);
    }
}

function verificarEstoque() {
    const pedidos = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const estoqueAtual = getEstoque();
    const estoqueCalculado = {...estoqueAtual};
    
    // Subtrair itens dos pedidos pendentes
    pedidos.forEach(pedido => {
        if (pedido.status === 'pendente') {
            pedido.itens.forEach(item => {
                if (estoqueCalculado[item.nome] !== undefined) {
                    estoqueCalculado[item.nome] -= item.quantidade;
                }
            });
        }
    });
    
    return estoqueCalculado;
}

// Atualizar estoque na página inicial
function atualizarExibicaoEstoque() {
    const estoqueAtual = getEstoque();
    document.querySelectorAll('.produto').forEach(produto => {
        const nome = produto.querySelector('h3').textContent;
        const estoqueElement = produto.querySelector('.estoque-disponivel');
        if (estoqueElement) {
            estoqueElement.textContent = `Estoque: ${estoqueAtual[nome]}`;
        } else {
            const novoEstoqueElement = document.createElement('p');
            novoEstoqueElement.className = 'estoque-disponivel';
            novoEstoqueElement.textContent = `Estoque: ${estoqueAtual[nome]}`;
            produto.insertBefore(novoEstoqueElement, produto.querySelector('button'));
        }
    });
}

// Atualizar estoque quando a página carrega
atualizarExibicaoEstoque();

// Atualizar estoque quando houver mudanças
document.addEventListener('estoqueAtualizado', atualizarExibicaoEstoque);

// Mostrar feedback para o usuário
function mostrarFeedback(msg, tipo) {
    document.querySelectorAll('.feedback-mensagem').forEach(el => el.remove());

    const el = document.createElement('div');
    el.className = `feedback-mensagem feedback-${tipo}`;
    el.textContent = msg;

    document.body.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, 5000);
}

// SISTEMA DE CARRINHO E CUPONS
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do carrinho
    const subtotalElement = document.getElementById('subtotal');
    const descontoElement = document.getElementById('desconto');
    const totalElement = document.getElementById('total');
    const btnFinalizar = document.getElementById('finalizar-compra');
    const btnAplicarCupom = document.getElementById('aplicar-cupom');
    const inputCupom = document.getElementById('codigo-cupom');
    
    // Cupons disponíveis
    const cupons = {
        'PROMO10': { desconto: 0.1, unico: true },   // 10% de desconto (único)
        'PROMO20': { desconto: 0.2, unico: true },   // 20% de desconto (único)
        'FRETEGRATIS': { tipo: 'frete', unico: false }, // Frete grátis (pode usar várias vezes)
        'PRIMEIRACOMPRA': { desconto: 0.15, unico: true }, // 15% de desconto (único)
        'SUPERPROMO': { desconto: 0.25, unico: true }      // 25% de desconto (único)
    };
    
    // Valores de frete baseados em região 
    const fretes = {
        'SP': 10.00,
        'RJ': 15.00,
        'MG': 12.00,
        'Outros': 20.00
    };

    // Carrinho de compras
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let cupomAplicado = localStorage.getItem('cupomAplicado') || null;
    let frete = 0;
 
    function verificarCupomPendente() {
        const cupomPendente = localStorage.getItem('cupomParaAplicar');

        if (cupomPendente && cupons[cupomPendente]) {
            const cuponsUsados = getCuponsUsados();
            
            if (cupons[cupomPendente].unico && cuponsUsados.includes(cupomPendente)) {
                mostrarFeedback('Este cupom já foi utilizado anteriormente', 'erro');
                return;
            }

            inputCupom.value = cupomPendente;
            cupomAplicado = cupomPendente;
            localStorage.setItem('cupomAplicado', cupomPendente);
            localStorage.removeItem('cupomParaAplicar');
            
            // Mostra feedback
            if (cupons[cupomPendente].desconto) {
                const percentual = cupons[cupomPendente].desconto * 100;
                mostrarFeedback(`Cupom aplicado automaticamente: ${percentual}% de desconto!`, 'sucesso');
            } else if (cupons[cupomPendente].tipo === 'frete') {
                mostrarFeedback('Cupom aplicado automaticamente: Frete grátis!', 'sucesso');
            }
            
            calcularTotal();
        }
    }

    // Inicializar carrinho
    function initCarrinho() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (!usuarioLogado) {
            localStorage.removeItem('cupomAplicado');
            cupomAplicado = null;
        }
        
        atualizarCarrinho();
        calcularTotal();
        verificarCupomPendente();

        btnAplicarCupom.addEventListener('click', aplicarCupom);
        btnFinalizar.addEventListener('click', finalizarCompra);
    }
    
    // Adicionar seção de endereço e saldo
    function adicionarSecaoUsuario() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) return;
        
        const resumoCarrinho = document.querySelector('.resumo-carrinho');
        
        // Criar seção de endereço
        const enderecoSection = document.createElement('div');
        enderecoSection.className = 'usuario-info';
        enderecoSection.innerHTML = `
            <h3>Informações para Entrega</h3>
            <div class="endereco-area">
                <p><strong>Endereço atual:</strong> <span id="endereco-usuario"> ${usuarioLogado.endereco || 'Não informado'}</span></p>
                <div class="frete-controle">
                    <select id="estado-entrega">
                        <option value="">Selecione seu estado</option>
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="Outros">Outros estados</option>
                    </select>
                <button id="calcular-frete">Calcular Frete</button>
                </div>
                <p id="valor-frete" class="frete-nao-calculado">Frete: R$ 0,00</p>
            </div>
        `;

        resumoCarrinho.insertBefore(enderecoSection, resumoCarrinho.firstChild);
        
        // Event listener para calcular frete
        document.getElementById('calcular-frete').addEventListener('click', calcularFrete);

        document.getElementById('estado-entrega').addEventListener('change', function() {
            document.getElementById('valor-frete').classList.remove('frete-calculado');
            document.getElementById('valor-frete').classList.add('frete-nao-calculado');
            document.getElementById('valor-frete').textContent = 'Frete: R$ 0,00';
            document.getElementById('frete-resumo').textContent = 'R$ 0,00';
            frete = 0;
            calcularTotal();
        });
    }
    
    // Calcular frete baseado no estado selecionado
    function calcularFrete() {
        const estado = document.getElementById('estado-entrega').value;

        if (!estado) {
            mostrarFeedback('Selecione um estado para calcular o frete', 'erro');
            return;
        }
        
        frete = fretes[estado] || fretes['Outros'];
        
        // Verificar se tem cupom de frete grátis
        if (cupomAplicado && cupons[cupomAplicado].tipo === 'frete'){
            frete = 0;
            mostrarFeedback('Frete grátis aplicado!', 'sucesso');
        }
        
        document.getElementById('valor-frete').textContent = `Frete: R$ ${frete.toFixed(2)}`;
        document.getElementById('frete-resumo').textContent = `R$ ${frete.toFixed(2)}`;
        
        // Adicionar classe para marcar que o frete foi calculado
        document.getElementById('valor-frete').classList.add('frete-calculado');

        calcularTotal();
    }

    function getCuponsUsados() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) return [];
        
        // Obter ou inicializar o registro de cupons usados
        if (!localStorage.getItem('cuponsUsados')) {
            localStorage.setItem('cuponsUsados', JSON.stringify({}));
        }
        
        const todosCuponsUsados = JSON.parse(localStorage.getItem('cuponsUsados'));
        return todosCuponsUsados[usuarioLogado.email] || [];
    }

    function marcarCupomComoUsado(codigoCupom) {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) return;
        
        const todosCuponsUsados = JSON.parse(localStorage.getItem('cuponsUsados') || '{}');
        
        if (!todosCuponsUsados[usuarioLogado.email]) {
            todosCuponsUsados[usuarioLogado.email] = [];
        }
        
        if (!todosCuponsUsados[usuarioLogado.email].includes(codigoCupom)) {
            todosCuponsUsados[usuarioLogado.email].push(codigoCupom);
            localStorage.setItem('cuponsUsados', JSON.stringify(todosCuponsUsados));
        }
    }

    // Adicionar produto ao carrinho (chamado da página de produtos)
    function adicionarAoCarrinho(nome, preco) {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
        if (!usuarioLogado) {
            mostrarFeedback('Por favor, faça login para adicionar produtos ao carrinho', 'erro');
            return;
        }
        
        const estoqueAtual = getEstoque();

        // Verificar estoque
        if (estoqueAtual[nome] <= 0) {
            mostrarFeedback(`Desculpe, ${nome} está esgotado no momento`, 'erro');
            return;
        }
        
        // Confirmar antes de adicionar
        const confirmar = confirm(`Deseja adicionar ${nome} ao carrinho por R$ ${parseFloat(preco).toFixed(2)}?`);
        
        if (!confirmar) {
            return;
        }
        
        const produtoExistente = carrinho.find(item => item.nome === nome);

        if (produtoExistente) {
            // Verificar se a quantidade no carrinho + 1 excede o estoque
            if (produtoExistente.quantidade >= estoqueAtual[nome]) {
                mostrarFeedback(`Quantidade máxima de ${nome} no estoque atingida (${estoqueAtual[nome]} unidades)`, 'erro');
                return;
            }
            produtoExistente.quantidade += 1;
        } else {
            carrinho.push({
                nome,
                preco: parseFloat(preco),
                quantidade: 1
            });
        }
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        mostrarFeedback(`${nome} adicionado ao carrinho!`, 'sucesso');
        atualizarCarrinho();
        calcularTotal();
    }

    // Atualizar a exibição do carrinho
    function atualizarCarrinho() {
        const carrinhoContainer = document.getElementById('itens-carrinho');

        if (carrinho.length === 0) {
            carrinhoContainer.innerHTML = `
                <div class="carrinho-vazio">
                    <p>Seu carrinho está vazio</p>
                    <a href="index.html" class="btn-continuar">Continuar comprando</a>
                </div>
            `;
            return;
        }
        
        carrinhoContainer.innerHTML = '';
        
        carrinho.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrinho';
            itemElement.innerHTML = `
                <div class="info-produto">
                    <h3 class="nome_produto">${item.nome}</h3>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                    <p class="estoque-disponivel">Estoque disponível: ${getEstoque()[item.nome]}</p>
                </div>
                <div class="controles">
                    <p>Quantidade: </p>
                    <button class="btn-quantidade btn-diminuir" data-index="${index}">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-quantidade btn-aumentar" data-index="${index}">+</button>
                </div>
                <div class="acoes">
                    <p class="preco-total">R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
                    <button class="btn-remover" data-index="${index}">Remover</button>
                </div>
            `;
            
            carrinhoContainer.appendChild(itemElement);
        });
        
        document.querySelectorAll('.btn-diminuir').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                alterarQuantidade(index, -1);
            });
        });
        
        document.querySelectorAll('.btn-aumentar').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                alterarQuantidade(index, 1);
            });
        });
        
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removerItem(index);
            });
        });
    }
    
    // Se o usuário sair da página de carrinho o cupomAplicado é removido do LocalStorage
    window.addEventListener('beforeunload', function() {
        if (window.location.pathname.endsWith('carrinho_compras.html')) {
            localStorage.removeItem('cupomAplicado');
        }
    });

    // Alterar quantidade de um item
    function alterarQuantidade(index, mudanca) {
        const produto = carrinho[index];
        const novoValor = produto.quantidade + mudanca;
        
        // Não remover automaticamente quando chegar a zero
        if (novoValor < 1) {
            mostrarFeedback(`A quantidade mínima é 1. Clique em "Remover" se desejar excluir o item.`, 'erro');
            return;
        }
        
        const estoqueAtual = getEstoque();

        // Verificar estoque
        if (mudanca > 0 && novoValor > estoqueAtual[produto.nome]) {
            mostrarFeedback(`Quantidade máxima de ${produto.nome} no estoque é ${estoqueAtual[produto.nome]} unidades`, 'erro');

            return;
        }
        
        produto.quantidade = novoValor;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        atualizarCarrinho();
        calcularTotal();
        mostrarFeedback(`Quantidade de ${produto.nome} alterada para ${novoValor}`, 'sucesso');
    }
    
    // Remover item do carrinho
    function removerItem(index) {
        const nomeProduto = carrinho[index].nome;
        // Mostrar modal de confirmação
        const confirmar = confirm(`Tem certeza que deseja remover ${nomeProduto} do carrinho?`);
        
        if (confirmar) {
            carrinho.splice(index, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));

            atualizarCarrinho();
            calcularTotal();
            mostrarFeedback(`${nomeProduto} removido do carrinho`, 'sucesso');
        }
    }
    
    // Calcular total do carrinho
    function calcularTotal() {
        const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    
        // Aplicar desconto se houver cupom válido
        let valorDesconto = 0;
        if (cupomAplicado && cupons[cupomAplicado]) {
            if (cupons[cupomAplicado].desconto) {
                valorDesconto = subtotal * cupons[cupomAplicado].desconto;
            }
        }
      
        const total = subtotal - valorDesconto + frete;
      
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
        document.getElementById('frete-resumo').textContent = `R$ ${frete.toFixed(2)}`;
        descontoElement.textContent = `R$ ${valorDesconto.toFixed(2)}`;
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
        
        desconto = valorDesconto;

        // Sempre habilitar o botão de finalizar compra
        btnFinalizar.disabled = false;
        btnFinalizar.style.opacity = '1';
        btnFinalizar.title = '';
    }
    
    // Atualizar estoque quando houver mudanças
    document.addEventListener('estoqueAtualizado', function() {
        if (window.location.pathname.endsWith('carrinho_compras.html')) {
            document.querySelectorAll('.item-carrinho .estoque-disponivel').forEach(el => {
                const nome = el.closest('.item-carrinho').querySelector('h3').textContent;
                el.textContent = `Estoque disponível: ${getEstoque()[nome]}`;
            });
        }
    });

    // Aplicar cupom de desconto
    function aplicarCupom() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        if (!usuarioLogado) {
            mostrarFeedback('Por favor, faça login para aplicar cupons', 'erro');
            localStorage.removeItem('cupomAplicado');
            cupomAplicado = null;
            calcularTotal();
            return;
        }
        
        const codigo = inputCupom.value.trim().toUpperCase();
        
        if (!codigo) {
            mostrarFeedback('Por favor, insira um código de cupom', 'erro');
            return;
        }
        
        // Verificar se o cupom existe
        if (!cupons[codigo]) {
            mostrarFeedback('Cupom inválido ou expirado', 'erro');
            cupomAplicado = null;
            localStorage.removeItem('cupomAplicado');
            calcularTotal();
            return;
        }
        
        // Verificar se é um cupom único e já foi usado
        const cuponsUsados = getCuponsUsados();
        if (cupons[codigo].unico && cuponsUsados.includes(codigo)) {
            mostrarFeedback('Este cupom já foi utilizado e não pode ser usado novamente', 'erro');
            return;
        }
        
        // Aplicar o cupom
        cupomAplicado = codigo;
        localStorage.setItem('cupomAplicado', codigo);
        
        // Marcar como usado se for cupom único
        if (cupons[codigo].unico) {
            marcarCupomComoUsado(codigo);
        }
        
        // Mostrar feedback
        if (cupons[codigo].desconto) {
            const percentual = cupons[codigo].desconto * 100;
            mostrarFeedback(`Cupom aplicado: ${percentual}% de desconto!`, 'sucesso');
        } else if (cupons[codigo].tipo === 'frete') {
            mostrarFeedback('Cupom aplicado: Frete grátis!', 'sucesso');
        }
        
        calcularTotal();
    }
    
    function finalizarCompra() {
        try {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            
            if (!usuarioLogado) {
                mostrarFeedback('Por favor, faça login para finalizar a compra', 'erro');
                return;
            }
            
            if (carrinho.length === 0) {
                mostrarFeedback('Seu carrinho está vazio', 'erro');
                return;
            }
            
            // Verificar estoque antes de finalizar a compra
            const estoqueAtual = getEstoque();
            for (const item of carrinho) {
                if (item.quantidade > estoqueAtual[item.nome]) {
                    mostrarFeedback(`Desculpe, o estoque de ${item.nome} foi atualizado e não temos mais a quantidade desejada`, 'erro');
                    return;
                }
            }
            
            // Verificar frete
            const estadoElement = document.getElementById('estado-entrega');
            if (!estadoElement || !estadoElement.value) {
                mostrarFeedback('Selecione um estado para calcular o frete', 'erro');
                return;
            }
            
            const freteCalculado = document.getElementById('valor-frete').classList.contains('frete-calculado');
            if (!freteCalculado) {
                mostrarFeedback('Por favor, clique em "Calcular Frete" antes de finalizar a compra', 'erro');
                return;
            }

            // Obter método de pagamento selecionado
            const metodoSelecionado = document.querySelector('input[name="metodo-pagamento"]:checked');
            if (!metodoSelecionado) {
                mostrarFeedback('Selecione um método de pagamento', 'erro');
                return;
            }
            
            const metodoPagamento = metodoSelecionado.value;
            const total = parseFloat(totalElement.textContent.replace('R$ ', ''));
            
            // Atualizar estoque
            for (const item of carrinho) {
                const estoqueAtual = getEstoque();
                const novoEstoque = estoqueAtual[item.nome] - item.quantidade;
                updateEstoque(item.nome, novoEstoque);
                
            }
            
            // Método de pagamento
            if (metodoPagamento === 'pix') {
                mostrarFeedback('Pagamento via Pix realizado com sucesso!', 'sucesso');
            } else if (metodoPagamento === 'credito') {
                mostrarFeedback('Pagamento via Cartão de Crédito realizado com sucesso!', 'sucesso');
            } else if (metodoPagamento === 'dinheiro') {
                mostrarFeedback('Compra finalizada para pagamento em dinheiro na entrega!', 'sucesso');
            }
            
            // Criar pedido
            const pedido = {
                id: Date.now(),
                data: new Date().toISOString(),
                itens: [...carrinho],
                subtotal: parseFloat(subtotalElement.textContent.replace('R$ ', '')),
                desconto: parseFloat(descontoElement.textContent.replace('R$ ', '')),
                frete: frete,
                total: total,
                cupom: cupomAplicado,
                endereco: usuarioLogado.endereco,
                estado: estadoElement.value,
                status: 'pendente',
                metodoPagamento: metodoPagamento,
                email: usuarioLogado.email
            };
            
            const feedbackMsg = `
                Compra finalizada com sucesso!
                Número do pedido: #${pedido.id}
                Total: R$ ${pedido.total.toFixed(2)}
                Método de Pagamento: ${pedido.metodoPagamento}
                Entrega em: ${pedido.endereco}
            `;
            
            mostrarFeedback(feedbackMsg, 'sucesso');

            // Salvar pedido no histórico
            let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
            historico.push(pedido);
            localStorage.setItem('historicoPedidos', JSON.stringify(historico));
            
            // Limpar carrinho
            carrinho = [];
            localStorage.removeItem('carrinho');
            localStorage.removeItem('cupomAplicado');
            cupomAplicado = null;
            frete = 0;
            
            // Atualizar interface
            atualizarCarrinho();
            calcularTotal();
            inputCupom.value = '';
            

        } catch (error) {
            console.error('Erro ao finalizar compra:', error);
            mostrarFeedback('Ocorreu um erro ao finalizar sua compra. Por favor, tente novamente.', 'erro');
        }
    }
    
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
        btn.addEventListener('click', function() {
            const nome = this.getAttribute('data-nome');
            const preco = this.getAttribute('data-preco');
            adicionarAoCarrinho(nome, preco);
        });
    });
    
    document.querySelectorAll('.cupom').forEach(cupom => {
      cupom.addEventListener('click', function(e) {
            e.preventDefault();
            const codigo = this.id.toUpperCase();
      
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!usuarioLogado) {
                mostrarFeedback('Por favor, faça login para usar cupons', 'erro');
                localStorage.setItem('cupomParaAplicar', codigo);
                window.location.href = 'carrinho_compras.html';
                return;
            }
          
            const cuponsUsados = getCuponsUsados();
            if (cupons[codigo]?.unico && cuponsUsados.includes(codigo)) {
                mostrarFeedback('Você já usou este Cupom anteriormente', 'erro');
                return;
            }
            
            if (cupons[codigo]) {
                localStorage.setItem('cupomParaAplicar', codigo);
                window.location.href = 'carrinho_compras.html';
                
                try {
                    navigator.clipboard.writeText(codigo);
                } catch (err) {
                    console.error('Falha ao copiar cupom:', err);
                }
            } else {
                mostrarFeedback('Cupom inválido', 'erro');
            }
      });
    });
    
    // Inicializar o carrinho
    initCarrinho();
    adicionarSecaoUsuario();
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden' && 
        window.location.pathname.endsWith('carrinho_compras.html')) {
        localStorage.removeItem('cupomAplicado');
    }
});