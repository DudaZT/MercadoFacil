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

    document.querySelectorAll('#modal-cadastro input').forEach(input => {
        input.addEventListener('input', function() {
            const errorSpanId = this.id.replace('-cadastro', '-error');
            const errorSpan = document.getElementById(errorSpanId);
            if (errorSpan) {
                errorSpan.textContent = '';
                this.classList.remove('invalid');
            }
        });
    });

    // Função para cadastrar usuário
    function cadastrarUsuario() {
        // Limpar mensagens de erro anteriores
        clearErrorMessages();
        
        // Obter valores dos campos
        const nome = document.getElementById('nome-cadastro').value.trim();
        const email = document.getElementById('email-cadastro').value.trim();
        const endereco = document.getElementById('endereco-cadastro').value.trim();
        const senha = document.getElementById('senha-cadastro').value;
        const telefone = document.getElementById('telefone-cadastro').value;
        const dataNascimento = document.getElementById('data-cadastro').value;
        const cpf = document.getElementById('cpf-cadastro').value;

        // Validar campos
        let isValid = true;
        
        // Validação do Nome (mínimo 3 caracteres)
        if (!nome || nome.length < 3) {
            showError('nome-cadastro', 'nome-error', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }
        
        // Validação do Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError('email-cadastro', 'email-error', 'Por favor, insira um email válido');
            isValid = false;
        }
        
        // Validação do Endereço (deve conter número e complemento)
        const enderecoRegex = /^.*\d+.*$/; // Verifica se tem pelo menos um número
        if (!endereco || endereco.length < 10 || !enderecoRegex.test(endereco)) {
            showError('endereco-cadastro', 'endereco-error', 'Endereço deve ter pelo menos 10 caracteres e conter número');
            isValid = false;
        }
        
        // Validação da Senha (mínimo 6 caracteres)
        if (!senha || senha.length < 6) {
            showError('senha-cadastro', 'senha-error', 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
        
        // Validação da Confirmação de Senha 
        const confirmarSenha = document.getElementById('confirmar-senha-cadastro').value;
        if (senha !== confirmarSenha) {
            showError('confirmar-senha-cadastro', 'confirmar-senha-error', 'As senhas não coincidem');
            isValid = false;
        }

        // CPF
        if (!cpf || !validarCPF(cpf)) {
            showError('cpf-cadastro', 'cpf-error', 'CPF inválido');
            isValid = false;
        }

        // Telefone
        if (!telefone || !validarTelefone(telefone)) {
            showError('telefone-cadastro', 'telefone-error', 'Telefone deve ter 10 ou 11 dígitos');
            isValid = false;
        }

        // Data de nascimento
        if (!dataNascimento || !validarDataNascimento(dataNascimento)) {
            showError('data-cadastro', 'data-error', 'Você deve ter pelo menos 13 anos');
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
            senha,
            telefone,
            dataNascimento,
            cpf
        });
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Mostrar feedback de sucesso
        mostrarFeedback('Cadastro realizado com sucesso!', 'sucesso');
        
        // Fechar modal e limpar formulário
        modalCadastro.classList.add('hidden'); 
        document.getElementById('nome-cadastro').value = '';
        document.getElementById('email-cadastro').value = '';
        document.getElementById('endereco-cadastro').value = '';
        document.getElementById('senha-cadastro').value = '';
        document.getElementById('telefone-cadastro').value = '';
        document.getElementById('data-cadastro').value = '';
        document.getElementById('cpf-cadastro').value = '';
    }

    function showError(inputId, errorSpanId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorSpanId);
        
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorSpan.textContent = message;
        errorSpan.style.color = '#f44336';
        errorSpan.style.fontSize = '0.8em';
        errorSpan.style.marginTop = '5px';
        errorSpan.style.display = 'block';
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

// Validação do CPF
function validarCPF(cpf) {
    // Remove tudo que não for número
    cpf = cpf.replace(/\D/g, '');

    // Verifica se tem exatamente 11 dígitos
    return cpf.length === 11;
}


// Validação do Telefone (10 ou 11 dígitos)
function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');

    return numeros.length === 10 || numeros.length === 11;
}

// Validação da Data de Nascimento (mínimo 13 anos)
function validarDataNascimento(data) {
    const nascimento = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    return idade > 13 || (idade === 13 && mes >= 0 && hoje.getDate() >= nascimento.getDate());
}
