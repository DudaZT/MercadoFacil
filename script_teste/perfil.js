document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado) {
        mostrarFeedback('Por favor, faça login para acessar esta página', 'erro');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Carregar dados do usuário
    carregarDadosUsuario();
    
    // Configurar navegação entre seções
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove a classe active de todos os itens
            document.querySelectorAll('.menu-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Adiciona a classe active apenas ao item clicado
            this.classList.add('active');
            
            // Oculta todas as seções
            document.querySelectorAll('.secao-perfil').forEach(secao => {
                secao.classList.remove('ativo');
            });
            
            // Mostra apenas a seção correspondente
            const secaoId = this.getAttribute('data-secao');
            document.getElementById(secaoId).classList.add('ativo');
        });
    });
    
    // Configurar envio do formulário de perfil
    document.getElementById('form-perfil').addEventListener('submit', function(e) {
        e.preventDefault();
        atualizarPerfil();
    });
    
    // Carregar pedidos do usuário
    if (document.getElementById('meus-pedidos')) {
        carregarPedidosUsuario();
    }
    
    // Carregar endereços do usuário
    if (document.getElementById('enderecos')) {
        carregarEnderecosUsuario();
    }
});

function carregarDadosUsuario() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === usuarioLogado.email);
    
    if (usuario) {
        // Atualizar cabeçalho
        document.getElementById('perfil-nome').textContent = usuario.nome || 'Usuário';
        document.getElementById('perfil-email').textContent = usuario.email;
        
        // Atualizar formulário
        document.getElementById('nome').value = usuario.nome || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefone').value = usuario.telefone || '';
        document.getElementById('data-nascimento').value = usuario.dataNascimento || '';
        document.getElementById('cpf').value = usuario.cpf || '';
        
        // Se o usuário tiver mais dados no localStorage, podemos carregá-los aqui
        if (usuario.enderecos) {
            localStorage.setItem('enderecosUsuario', JSON.stringify(usuario.enderecos));
        }
    }
}

function atualizarPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);
    
    if (usuarioIndex === -1) {
        mostrarFeedback('Erro ao atualizar perfil', 'erro');
        return;
    }
    
    // Obter valores do formulário
    usuarios[usuarioIndex].nome = document.getElementById('nome').value;
    usuarios[usuarioIndex].telefone = document.getElementById('telefone').value;
    usuarios[usuarioIndex].dataNascimento = document.getElementById('data-nascimento').value;
    usuarios[usuarioIndex].cpf = document.getElementById('cpf').value;
    
    // Atualizar localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarios[usuarioIndex]));
    
    // Atualizar cabeçalho
    document.getElementById('perfil-nome').textContent = usuarios[usuarioIndex].nome;
    
    mostrarFeedback('Perfil atualizado com sucesso!', 'sucesso');
}

function carregarPedidosUsuario() {
    const historicoPedidos = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    // Filtrar pedidos do usuário atual (pode ser por email ou outro identificador)
    const pedidosUsuario = historicoPedidos.filter(pedido => 
        pedido.email === usuarioLogado.email
    );
    
    const pedidosContainer = document.querySelector('#meus-pedidos .pedidos-lista');
    
    if (pedidosUsuario.length === 0) {
        pedidosContainer.innerHTML = '<p>Nenhum pedido encontrado.</p>';
        return;
    }
    
    pedidosUsuario.forEach(pedido => {
        const pedidoElement = document.createElement('div');
        pedidoElement.className = 'pedido-card';
        
        // Formatar data
        const dataPedido = new Date(pedido.data);
        const dataFormatada = dataPedido.toLocaleDateString('pt-BR');
        
        // Determinar status
        let statusClass = 'status-processando';
        let statusText = 'Processando';
        if (pedido.status === 'entregue') {
            statusClass = 'status-entregue';
            statusText = 'Entregue';
        } else if (pedido.status === 'cancelado') {
            statusClass = 'status-cancelado';
            statusText = 'Cancelado';
        }
        
        // Criar HTML do pedido
        pedidoElement.innerHTML = `
            <div class="pedido-header">
                <div>
                    <h3>Pedido #MF${pedido.id.toString().slice(-5)}</h3>
                    <p>Realizado em: ${dataFormatada}</p>
                </div>
                <span class="pedido-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="pedido-produtos">
                ${pedido.itens.map(item => `
                    <div class="produto-item">
                        <img src="https://via.placeholder.com/60" alt="${item.nome}" class="produto-img">
                        <div class="produto-info">
                            <h4>${item.nome}</h4>
                            <p>Quantidade: ${item.quantidade}</p>
                            <p>R$ ${item.preco.toFixed(2)} cada</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="pedido-total">
                <p>Total: R$ ${pedido.total.toFixed(2)}</p>
            </div>
            
            <button class="btn btn-secondary">Detalhes do Pedido</button>
            ${pedido.status === 'entregue' ? '<button class="btn btn-secondary">Comprar Novamente</button>' : ''}
        `;
        
        pedidosContainer.appendChild(pedidoElement);
    });
}

function carregarEnderecosUsuario() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const enderecosContainer = document.querySelector('#enderecos .enderecos-lista');
    
    // Criar elemento para o endereço principal
    const enderecoPrincipal = document.createElement('div');
    enderecoPrincipal.className = 'endereco-card';
    enderecoPrincipal.innerHTML = `
        <span class="endereco-padrao">Padrão</span>
        <h3>Endereço Principal</h3>
        <p>${usuarioLogado.nome}</p>
        <p>${usuarioLogado.endereco}</p>
        
        <div class="endereco-acoes">
            <button class="btn btn-primary btn-sm">Editar</button>
        </div>
    `;
    
    enderecosContainer.appendChild(enderecoPrincipal);
    
    // Adicionar event listener para o botão de novo endereço
    document.getElementById('btn-novo-endereco').addEventListener('click', function() {
        adicionarNovoEndereco();
    });
}

function mostrarFeedback(mensagem, tipo) {
    const feedbacks = document.querySelectorAll('.feedback-mensagem');
    feedbacks.forEach(fb => fb.remove());
    
    const feedback = document.createElement('div');
    feedback.className = `feedback-mensagem feedback-${tipo}`;
    feedback.textContent = mensagem;
    
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
    feedback.style.textAlign = 'center';

    feedback.style.backgroundColor = tipo === 'sucesso' ? '#4CAF50' : '#f44336';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 500);
    }, 5000);
}