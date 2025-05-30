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

`;
document.head.appendChild(style);