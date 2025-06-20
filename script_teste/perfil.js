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
    
    // Carregar endereço do usuário
    if (document.getElementById('endereco')) {
        carregarEnderecoUsuario();
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
        document.getElementById('endereco').value = usuario.endereco || '';
        document.getElementById('data-nascimento').value = usuario.dataNascimento || '';
        document.getElementById('cpf').value = usuario.cpf || '';
        
        // Se o usuário tiver mais dados no localStorage, podemos carregá-los aqui
        if (usuario.endereco) {
            localStorage.setItem('enderecoUsuario', JSON.stringify(usuario.endereco));
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

    // Pega os novos dados do formulário
    const novoEmail = document.getElementById('email').value;

    usuarios[usuarioIndex].nome = document.getElementById('nome').value;
    usuarios[usuarioIndex].endereco = document.getElementById('endereco').value;
    usuarios[usuarioIndex].telefone = document.getElementById('telefone').value;
    usuarios[usuarioIndex].dataNascimento = document.getElementById('data-nascimento').value;
    usuarios[usuarioIndex].cpf = document.getElementById('cpf').value;
    usuarios[usuarioIndex].email = novoEmail;

    // Atualiza o localStorage com usuários atualizados
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Atualiza o usuarioLogado com o novo email e nome
    usuarioLogado.email = novoEmail;
    usuarioLogado.nome = usuarios[usuarioIndex].nome;
    usuarioLogado.endereco = usuarios[usuarioIndex].endereco;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

    mostrarFeedback('Perfil atualizado com sucesso!', 'sucesso');

    // Atualizar a navbar ou onde quiser mostrar o nome/email
    document.getElementById('perfil-nome').textContent = usuarios[usuarioIndex].nome;
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
        
        // Criar HTML do pedido
        pedidoElement.innerHTML = `
            <div class="pedido-header">
                <div>
                    <h3>Pedido #${pedido.id}</h3>
                    <p>Realizado em: ${dataFormatada}</p>
                </div>
                <span class="pedido-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="pedido-produtos">
                ${pedido.itens.map(item => `
                    <div class="produto-item">
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
            
        `;
        
        pedidosContainer.appendChild(pedidoElement);
    });
}

function carregarEnderecoUsuario() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const enderecoContainer = document.querySelector('#endereco .endereco-lista');
    
    // Criar elemento para o endereço principal
    const enderecoPrincipal = document.createElement('div');
    enderecoPrincipal.className = 'endereco-card';
    enderecoPrincipal.innerHTML = `
        <span class="endereco-padrao">Padrão</span>
        <h3>Endereço</h3>
        <p>${usuarioLogado.nome}</p>
        <p>${usuarioLogado.endereco}</p>
        
        <div class="endereco-acoes">
            <button class="btn btn-primary btn-sm">Editar</button>
        </div>
    `;
    
    enderecoContainer.appendChild(enderecoPrincipal);
    
}

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


// Lógica para alteração de senha
document.querySelector('.configuracoes-seguranca .btn.btn-primary').addEventListener('click', function () {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);

    if (usuarioIndex === -1) {
        mostrarFeedback('Usuário não encontrado', 'erro');
        return;
    }

    const usuario = usuarios[usuarioIndex];

    // Validar senha atual
    if (usuario.senha !== senhaAtual) {
        mostrarFeedback('Senha atual incorreta', 'erro');
        return;
    }

    // Validar nova senha
    if (novaSenha.length < 6) {
        mostrarFeedback('A nova senha deve ter pelo menos 6 caracteres', 'erro');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarFeedback('As senhas não coincidem', 'erro');
        return;
    }

    

    // Atualizar senha no array de usuários e localStorage
    usuarios[usuarioIndex].senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    mostrarFeedback('Senha alterada com sucesso!', 'sucesso');

    // Limpa os campos
    document.getElementById('senha-atual').value = '';
    document.getElementById('nova-senha').value = '';
    document.getElementById('confirmar-senha').value = '';
});

// Lógica para exclusão de conta
document.querySelector('.configuracoes-conta .btn.btn-secondary').addEventListener('click', function () {
    const confirmacao = confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.');

    if (!confirmacao) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Remove o usuário da lista
    usuarios = usuarios.filter(u => u.email !== usuarioLogado.email);

    // Atualiza localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('historicoPedidos');
    localStorage.removeItem('enderecoUsuario');

    mostrarFeedback('Conta excluída com sucesso!', 'sucesso');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
});
