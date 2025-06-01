// Estoque de produtos
const estoque = {
    'Açúcar': 10,
    'Azeite': 5,
    'Leite': 8,
    'Leite Condensado': 15,
    'Nescau': 7,
    'Sabonete': 20
};

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.produto').forEach(produto => {
        const nome = produto.querySelector('h3').textContent;
        const estoqueElement = document.createElement('p');
        estoqueElement.className = 'estoque-disponivel';
        estoqueElement.textContent = `Estoque: ${estoque[nome]}`;
        produto.insertBefore(estoqueElement, produto.querySelector('button'));
    });
});

// Mostrar feedback para o usuário
    function mostrarFeedback(mensagem, tipo) {
        // Remover feedbacks anteriores
        const feedbacks = document.querySelectorAll('.feedback-mensagem');
        feedbacks.forEach(fb => fb.remove());
        
        const feedback = document.createElement('div');
        feedback.className = `feedback-mensagem feedback-${tipo}`;
        feedback.textContent = mensagem;
        
        // Estilos para garantir visibilidade
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.padding = '15px 25px';
        feedback.style.borderRadius = '5px';
        feedback.style.color = 'white';
        feedback.style.fontWeight = 'bold';
        feedback.style.zIndex = '10000';
        feedback.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        feedback.style.opacity = '1';
        feedback.style.transition = 'opacity 0.5s ease';
        
        if (tipo === 'sucesso') {
            feedback.style.backgroundColor = '#4CAF50';
        } else {
            feedback.style.backgroundColor = '#f44336';
        }
        
        document.body.appendChild(feedback);
        
        // Remover após alguns segundos
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 500);
        }, 5000);
    }

// SISTEMA DE LOGIN

document.addEventListener('DOMContentLoaded', function() {
    // Elementos da Navbar
    const navDireita = document.getElementById('nav-direita');
    const navAutenticado = document.querySelector('.nav__direita.hidden');
    const btnEntrar = navDireita.querySelector('button:first-child');
    const btnCadastrar = navDireita.querySelector('button:last-child');
    const btnSair = navAutenticado.querySelector('button:last-child');

    // Elementos dos Modais
    const modalLogin = document.getElementById('modal-login');
    const modalCadastro = document.getElementById('modal-cadastro');
    const fecharLogin = document.getElementById('fechar-login');
    const fecharCadastro = document.getElementById('fechar-cadastro');
    const btnLogin = document.getElementById('btn-login');
    const btnCadastrarModal = document.getElementById('btn-cadastrar');
    const irCadastro = document.getElementById('ir-cadastro');
    const irLogin = document.getElementById('ir-login');

    // Verificar se há usuário logado ao carregar a página
    checkLoginStatus();

    // Event Listeners para abrir modais
    btnEntrar.addEventListener('click', () => toggleModal(modalLogin));
    btnCadastrar.addEventListener('click', () => toggleModal(modalCadastro));

    // Event Listeners para fechar modais
    fecharLogin.addEventListener('click', () => toggleModal(modalLogin));
    fecharCadastro.addEventListener('click', () => toggleModal(modalCadastro));
    window.addEventListener('click', (e) => {
        if (e.target === modalLogin) toggleModal(modalLogin);
        if (e.target === modalCadastro) toggleModal(modalCadastro);
    });

    // Alternar entre modais de login e cadastro
    irCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(modalLogin);
        toggleModal(modalCadastro);
    });

    irLogin.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(modalCadastro);
        toggleModal(modalLogin);
    });

    // Função para cadastrar usuário
    btnCadastrarModal.addEventListener('click', cadastrarUsuario);

    // Função para fazer login
    btnLogin.addEventListener('click', fazerLogin);

    // Função para sair
    btnSair.addEventListener('click', sair);

    // Função para alternar visibilidade do modal
    function toggleModal(modal) {
        modal.classList.toggle('hidden');
    }

    // Função para cadastrar usuário
    function cadastrarUsuario() {
        // Limpar mensagens de erro anteriores
        clearErrorMessages();
        
        // Obter valores dos campos
        const nome = document.getElementById('nome-cadastro').value.trim();
        const email = document.getElementById('email-cadastro').value.trim();
        const endereco = document.getElementById('endereco-cadastro').value.trim();
        const senha = document.getElementById('senha-cadastro').value;

        // Validar campos
        let isValid = true;
        
        // Validação do Nome (mínimo 3 caracteres)
        if (!nome || nome.length < 3) {
            showError('nome-cadastro', 'nome-error', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }
        
        // Validação do Email (formato padrão de email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError('email-cadastro', 'email-error', 'Por favor, insira um email válido');
            isValid = false;
        }
        
        // Validação do Endereço (mínimo 5 caracteres)
        if (!endereco || endereco.length < 5) {
            showError('endereco-cadastro', 'endereco-error', 'Endereço deve ter pelo menos 5 caracteres');
            isValid = false;
        }
        
        // Validação da Senha (mínimo 6 caracteres)
        if (!senha || senha.length < 6) {
            showError('senha-cadastro', 'senha-error', 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }

        // Verificar se o usuário já existe
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioExistente = usuarios.find(u => u.email === email);
        
        if (usuarioExistente) {
            showError('email-cadastro', 'email-error', 'Este email já está cadastrado!');
            return;
        }
        
        // Adicionar novo usuário
        usuarios.push({
            nome,
            email,
            endereco,
            senha
        });
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Mostrar feedback de sucesso
        mostrarFeedback('Cadastro realizado com sucesso!', 'sucesso');
        
        // Fechar modal e limpar formulário
        modalCadastro.classList.add('hidden'); // Fecha o modal diretamente
        document.getElementById('nome-cadastro').value = '';
        document.getElementById('email-cadastro').value = '';
        document.getElementById('endereco-cadastro').value = '';
        document.getElementById('senha-cadastro').value = '';
    }

    function showError(inputId, errorSpanId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorSpanId);
        
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorSpan.textContent = message;
    }

    function clearErrorMessages() {
        const inputs = document.querySelectorAll('#modal-cadastro input');
        const errorSpans = document.querySelectorAll('#modal-cadastro .error-message');
        
        inputs.forEach(input => {
            input.classList.remove('invalid', 'valid');
        });
        
        errorSpans.forEach(span => {
            span.textContent = '';
        });
    }

    // Função para fazer login
    function fazerLogin() {
        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarFeedback('Por favor, insira um email válido', 'erro');
            return;
        }

        if (!senha) {
            mostrarFeedback('Por favor, insira sua senha', 'erro');
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuario) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            mostrarFeedback('Login realizado com sucesso!', 'sucesso');
            toggleModal(modalLogin);
            checkLoginStatus();
            document.getElementById('email-login').value = '';
            document.getElementById('senha-login').value = '';
        } else {
            mostrarFeedback('Email ou senha incorretos!', 'erro');
        }
    }

    // Função para sair
    function sair() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('cupomAplicado'); 
        checkLoginStatus();

        window.location.href = 'index.html';
    }

    // Função para verificar status de login e atualizar a navbar
    function checkLoginStatus() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (usuarioLogado) {
            navDireita.classList.add('hidden');
            navAutenticado.classList.remove('hidden');
        } else {
            navDireita.classList.remove('hidden');
            navAutenticado.classList.add('hidden');
        }
    }
});

// SISTEMA DO CARROSSEL 

document.addEventListener('DOMContentLoaded', function() {
  // Selecionar elementos do carrossel
  const carrossel = document.querySelector('.carrossel');

  if (carrossel) {
    const slides = document.querySelectorAll('.slide');
    const btnAnterior = document.querySelector('.btn-anterior');
    const btnProximo = document.querySelector('.btn-proximo');
    
    let slideAtual = 0;
    const totalSlides = slides.length;
    
    function initCarrossel() {
        slides.forEach((slide, index) => {
            slide.style.display = index === 0 ? 'block' : 'none';
        });
        
        if (btnAnterior) btnAnterior.addEventListener('click', mostrarSlideAnterior);
        if (btnProximo) btnProximo.addEventListener('click', mostrarSlideProximo);
        
        setInterval(mostrarSlideProximo, 5000);
    }
    
    function mostrarSlideAnterior() {
        slides[slideAtual].style.display = 'none';
        slideAtual = (slideAtual - 1 + totalSlides) % totalSlides;
        slides[slideAtual].style.display = 'block';
    }
    
    function mostrarSlideProximo() {
        slides[slideAtual].style.display = 'none';
        slideAtual = (slideAtual + 1) % totalSlides;
        slides[slideAtual].style.display = 'block';
    }
    
    initCarrossel();
  }
});

// SISTEMA DE PESQUISA
function filtrarProdutos(termo) {
    const produtos = document.querySelectorAll('.produto');
    let encontrouResultado = false;
    
    produtos.forEach(produto => {
        const nomeProduto = produto.querySelector('h3').textContent.toLowerCase();
        const termoLower = termo.toLowerCase();
        
        if (nomeProduto.includes(termoLower)) {
            produto.style.display = 'flex';
            encontrouResultado = true;
        } else {
            produto.style.display = 'none';
        }
    });
    
    // Mostrar mensagem se nenhum produto for encontrado
    const mensagemNenhumResultado = document.getElementById('mensagem-nenhum-resultado');
    if (!encontrouResultado && termo !== '') {
        if (!mensagemNenhumResultado) {
            const gridProdutos = document.querySelector('.grid__produtos');
            const mensagem = document.createElement('p');
            mensagem.id = 'mensagem-nenhum-resultado';
            mensagem.textContent = 'Nenhum produto encontrado com esse termo.';
            mensagem.style.gridColumn = '1 / -1';
            mensagem.style.textAlign = 'center';
            mensagem.style.padding = '20px';
            gridProdutos.appendChild(mensagem);
        }
    } else {
        if (mensagemNenhumResultado) {
            mensagemNenhumResultado.remove();
        }
    }
}

// Event listener para a barra de pesquisa
document.getElementById('pesquisa').addEventListener('input', function(e) {
    const termoPesquisa = e.target.value.trim();
    filtrarProdutos(termoPesquisa);
    
    // Mostrar/ocultar carrossel baseado na pesquisa
    const carrossel = document.querySelector('.carrossel');
    if (termoPesquisa !== '') {
        carrossel.style.display = 'none';
    } else {
        carrossel.style.display = 'block';
    }
});



// SISTEMA DE CARRINHO E CUPONS
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do carrinho
    const carrinhoContainer = document.getElementById('itens-carrinho');
    const subtotalElement = document.getElementById('subtotal');
    const descontoElement = document.getElementById('desconto');
    const totalElement = document.getElementById('total');
    const btnFinalizar = document.getElementById('finalizar-compra');
    const btnAplicarCupom = document.getElementById('aplicar-cupom');
    const inputCupom = document.getElementById('codigo-cupom');
    
    // Cupons disponíveis
    const cupons = {
        'PROMO10': 0.1,   // 10% de desconto
        'PROMO20': 0.2,   // 20% de desconto
        'FRETEGRATIS': 'frete', // Frete grátis
        'PRIMEIRACOMPRA': 0.15, // 15% de desconto
        'SUPERPROMO': 0.25      // 25% de desconto
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
          inputCupom.value = cupomPendente;
          cupomAplicado = cupomPendente;
          localStorage.setItem('cupomAplicado', cupomPendente);
          localStorage.removeItem('cupomParaAplicar');
          
          // Mostra feedback visual
          if (typeof cupons[cupomPendente] === 'number') {
              const percentual = cupons[cupomPendente] * 100;
              mostrarFeedback(`Cupom aplicado automaticamente: ${percentual}% de desconto!`, 'sucesso');
          } else if (cupons[cupomPendente] === 'frete') {
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

        // Event listeners
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
                <p><strong>Endereço atual:</strong> ${usuarioLogado.endereco || 'Não informado'}</p>
                <select id="estado-entrega">
                    <option value="">Selecione seu estado</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="Outros">Outros estados</option>
                </select>
                <button id="calcular-frete">Calcular Frete</button>
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
      if (cupomAplicado && cupons[cupomAplicado] === 'frete') {
        frete = 0;
        mostrarFeedback('Frete grátis aplicado!', 'sucesso');
      }
      
      document.getElementById('valor-frete').textContent = `Frete: R$ ${frete.toFixed(2)}`;
      document.getElementById('frete-resumo').textContent = `R$ ${frete.toFixed(2)}`;
      
      // Adicionar classe para marcar que o frete foi calculado
      document.getElementById('valor-frete').classList.add('frete-calculado');

      calcularTotal();
    }

    // Adicionar produto ao carrinho (chamado da página de produtos)
    function adicionarAoCarrinho(nome, preco) {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        if (!usuarioLogado) {
            mostrarFeedback('Por favor, faça login para adicionar produtos ao carrinho', 'erro');
            return;
        }
        
        // Verificar se há estoque disponível
        if (estoque[nome] <= 0) {
            mostrarFeedback(`Desculpe, ${nome} está esgotado no momento`, 'erro');
            return;
        }
        
        const produtoExistente = carrinho.find(item => item.nome === nome);
        
        if (produtoExistente) {
            // Verificar se a quantidade no carrinho + 1 excede o estoque
            if (produtoExistente.quantidade >= estoque[nome]) {
                mostrarFeedback(`Quantidade máxima de ${nome} no estoque atingida (${estoque[nome]} unidades)`, 'erro');
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
                    <h3>${item.nome}</h3>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                    <p class="estoque-disponivel">Estoque disponível: ${estoque[item.nome]}</p>
                </div>
                <div class="controles">
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
        
        // Adicionar event listeners aos botões
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
    
    window.addEventListener('beforeunload', function() {
        if (window.location.pathname.includes('carrinho_compras.html')) {
            localStorage.removeItem('cupomAplicado');
        }
    });

    // Alterar quantidade de um item
    function alterarQuantidade(index, mudanca) {
        const produto = carrinho[index];
        const novoValor = produto.quantidade + mudanca;
        
        if (novoValor < 1) {
            removerItem(index);
            return;
        }
        
        // Se estiver aumentando a quantidade, verificar estoque
        if (mudanca > 0 && novoValor > estoque[produto.nome]) {
            mostrarFeedback(`Quantidade máxima de ${produto.nome} no estoque é ${estoque[produto.nome]} unidades`, 'erro');
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
        carrinho.splice(index, 1);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarCarrinho();
        calcularTotal();
        mostrarFeedback(`${nomeProduto} removido do carrinho`, 'sucesso');
    }
    
    // Calcular total do carrinho
    function calcularTotal() {
      const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    
      // Aplicar desconto se houver cupom válido
      let valorDesconto = 0;
      if (cupomAplicado && cupons[cupomAplicado]) {
          if (typeof cupons[cupomAplicado] === 'number') {
              valorDesconto = subtotal * cupons[cupomAplicado];
          }
      }
      
      const total = subtotal - valorDesconto + frete;
      
      subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
      document.getElementById('frete-resumo').textContent = `R$ ${frete.toFixed(2)}`;
      descontoElement.textContent = `R$ ${valorDesconto.toFixed(2)}`;
      totalElement.textContent = `R$ ${total.toFixed(2)}`;
      
      // Atualizar desconto global para uso no checkout
      desconto = valorDesconto;

      // Sempre habilitar o botão de finalizar compra
      btnFinalizar.disabled = false;
      btnFinalizar.style.opacity = '1';
      btnFinalizar.title = '';
    }
    
    // Aplicar cupom de desconto
    function aplicarCupom() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        if (!usuarioLogado) {
            mostrarFeedback('Por favor, faça login para aplicar cupons', 'erro');
            localStorage.removeItem('cupomAplicado'); // Limpa o cupom se não estiver logado
            cupomAplicado = null;
            calcularTotal();
            return;
        }
        
        const codigo = inputCupom.value.trim().toUpperCase();
        
        if (!codigo) {
            mostrarFeedback('Por favor, insira um código de cupom', 'erro');
            return;
        }
        
        if (cupons[codigo]) {
            cupomAplicado = codigo;
            localStorage.setItem('cupomAplicado', codigo);
            
            if (typeof cupons[codigo] === 'number') {
                const percentual = cupons[codigo] * 100;
                mostrarFeedback(`Cupom aplicado: ${percentual}% de desconto!`, 'sucesso');
            } else if (cupons[codigo] === 'frete') {
                mostrarFeedback('Cupom aplicado: Frete grátis!', 'sucesso');
            }
            
            calcularTotal();
        } else {
            mostrarFeedback('Cupom inválido ou expirado', 'erro');
            cupomAplicado = null;
            localStorage.removeItem('cupomAplicado');
            calcularTotal();
        }
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
        for (const item of carrinho) {
            if (item.quantidade > estoque[item.nome]) {
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
            estoque[item.nome] -= item.quantidade;
        }
        
        // Feedback baseado no método de pagamento
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
            metodoPagamento: metodoPagamento
        };
        
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
        
        // Redirecionar para home após 5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        mostrarFeedback('Ocorreu um erro ao finalizar sua compra. Por favor, tente novamente.', 'erro');
    }
}
    
    
    // Adicionar event listeners aos botões "Adicionar ao Carrinho" na página de produtos
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
        btn.addEventListener('click', function() {
            const nome = this.getAttribute('data-nome');
            const preco = this.getAttribute('data-preco');
            adicionarAoCarrinho(nome, preco);
        });
    });
    
    // Adicionar event listeners aos cupons na página de produtos
    document.querySelectorAll('.cupom').forEach(cupom => {
      cupom.addEventListener('click', function(e) {
          e.preventDefault();
          const codigo = this.id.toUpperCase();
      
          const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
          if (!usuarioLogado) {
              mostrarFeedback('Por favor, faça login para usar cupons', 'erro');
              // Redireciona para login e armazena o cupom para aplicar depois
              localStorage.setItem('cupomParaAplicar', codigo);
              window.location.href = 'carrinho_compras.html';
              return;
          }
          
          if (cupons[codigo]) {
              // Armazena o cupom e redireciona
              localStorage.setItem('cupomParaAplicar', codigo);
              window.location.href = 'carrinho_compras.html';
              
              // copiar para área de transferência
              try {
                  navigator.clipboard.writeText(codigo).then(() => {
                      console.log('Cupom copiado');
                  });
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
        window.location.pathname.includes('carrinho_compras.html')) {
        localStorage.removeItem('cupomAplicado');
    }
});

// CSS para os feedbacks
const style = document.createElement('style');
style.textContent = `
.feedback-mensagem {
    position: fixed !important;
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    padding: 15px 25px !important;
    border-radius: 5px !important;
    color: white !important;
    font-weight: bold !important;
    z-index: 10000 !important;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2) !important;
    opacity: 1 !important;
    transition: opacity 0.5s ease !important;
}

.feedback-sucesso {
    background-color: #4CAF50 !important;
}

.feedback-erro {
    background-color: #f44336 !important;
}

.feedback-info {
    background-color: #2196F3 !important;
}

.usuario-info {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #eee;
}

.usuario-info h3 {
    margin-top: 0;
    color: #333;
}

.endereco-area, .saldo-area {
    margin: 10px 0;
}

#estado-entrega {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
    margin-right: 10px;
}

#calcular-frete {
    padding: 8px 15px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

#calcular-frete:hover {
    background: #45a049;
}

#valor-frete {
    font-weight: bold;
    margin-top: 5px;
}

.btn-finalizar:disabled {
    cursor: not-allowed;
}

.produto .estoque-disponivel {
    margin: 5px 0;
    font-size: 0.9em;
    color: #666;
}
`;
document.head.appendChild(style);