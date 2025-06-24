// Dados (Objeto)
let dados = {
    usuarios: [], // clientes
    carrinho: [], // pedidos do cliente
    estoque: {}, // quantos produtos ainda tem (objeto)
    cupomAplicado: null, 
    historicoPedidos: [], // compras que já foram feitas
    frete: 0
};

// Reseta os dados
function resetarDados() {
    dados = {
        usuarios: [],
        carrinho: [],
        estoque: {},
        cupomAplicado: null,
        historicoPedidos: [],
        frete: 0
    };
}

// Sistema de Login/Cadastro (se algum dado estiver errado, o cadastro falha)
function validarCadastro(dadosUsuario) {
    // Nome não pode ser vazio
    if (!dadosUsuario.nome) {
        return false;
    }

    // Nome tem que ter 3 caracteres pelo menos
    if (dadosUsuario.nome.length < 3) {
        return false;
    }

    // Email não pode ser vazio
    if (!dadosUsuario.email) {
        return false;
    }

    // Não pode ter espaço e nem '@' antes do '@' Ex: maria de "maria@gmail.com"
    // Depois do '@' um ou mais caracteres que não pode ser espaços nem '@' Ex: gmail de "maria@gmail.com (domínio do email)
    // Ponto obrigatório e depois do ponto tem que ter pelo menos um caractere
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (regexEmail.test(dadosUsuario.email) === false) {
        return false;
    }

    // Não pode ser vazio
    if (!dadosUsuario.endereco) {
        return false;
    }

    // Tem que ter número
    const regexEndereco = /.*\d+.*/;

    if (regexEndereco.test(dadosUsuario.endereco) === false) {
        return false;
    }

    // Não pode ser vazio
    if (!dadosUsuario.senha) {
        return false;
    }

    // Tem que ter pelo menos 6 caracteres
    if (dadosUsuario.senha.length < 6) {
        return false;
    }

    // CPF não pode ser vazio
    if (!dadosUsuario.cpf) {
        return false;
    }

    // Chama a função validarCPF
    if (validarCPF(dadosUsuario.cpf) === false) {
        return false;
    }

    if (!dadosUsuario.telefone) {
        return false;
    }

    // Pode ter 10 ou 11 números
    if (validarTelefone(dadosUsuario.telefone) === false) {
        return false;
    }

    if (!dadosUsuario.dataNascimento) {
        return false;
    }

    // Tem que ter pelo menos 13 anos
    if (validarDataNascimento(dadosUsuario.dataNascimento) === false) {
        return false;
    }

    return true;
}

// só cadastra se o email não for repetido
function cadastrarUsuario(usuario) {
    if (validarCadastro(usuario) === false) {
        return false;
    }

    // Verifica se já tem usuário com mesmo email
    for (let i = 0; i < dados.usuarios.length; i++) {
        if (dados.usuarios[i].email === usuario.email) {
            return false;
        }
    }

    dados.usuarios.push(usuario);

    return true;
}

// Procura na lista de usuários um email e senha que combinem
function fazerLogin(email, senha) { 
    for (let i = 0; i < dados.usuarios.length; i++) {
        if (dados.usuarios[i].email === email) {
            if (dados.usuarios[i].senha === senha) {
                return true;
            }
        }
    }

    return false;
}

function validarCPF(cpf) {
    // Retira tudo que não for número
    let numeros = cpf.replace(/\D/g, '');

    if (numeros.length === 11) {
        return true;
    } else {
        return false;
    }
}

function validarTelefone(telefone) {
    let numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 10) {
        return true;
    } else if (numeros.length === 11) {
        return true;
    } else {
        return false;
    }
}

function validarDataNascimento(data) {
    const nascimento = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (idade > 13) 
    {
        return true;
    } 
    else if (idade === 13) 
    {
        if (mes >= 0) 
        {
            return true;
        } 
        else 
        {
            return false;
        }
    } 
    else
    {
        return false;
    }
}

// Sistema de Carrinho

// Só dá pra adicionar se tiver no estoque, se o produto já estiver no carrinho, aumenta a quantidade
//se não estiver, adiciona o item novo no carrinho
function adicionarAoCarrinho(nome, preco) {
    if (dados.estoque[nome] === undefined) {
        return false;
    }

    if (dados.estoque[nome] <= 0) {
        return false;
    }

    let itemExistente = null;

    for (let i = 0; i < dados.carrinho.length; i++) {
        if (dados.carrinho[i].nome === nome) {
            itemExistente = dados.carrinho[i];
        }
    }

    if (itemExistente !== null) {
        itemExistente.quantidade = itemExistente.quantidade + 1;
    } else {
        dados.carrinho.push({ nome: nome, preco: parseFloat(preco), quantidade: 1 });
    }

    return true;
}

// Dá pra excluir um item pela posição na lista
function removerItem(index) {
    if (index < 0) {
        return false;
    }

    if (index >= dados.carrinho.length) {
        return false;
    }

    dados.carrinho.splice(index, 1); // Remove um item do carrinho (posição, quantidade de itens que vai remover)

    return true;
}

// muda a quantidade de um item no carrinho.
// se colocar zero ou negativo, o item é removido.
function alterarQuantidade(index, novaQuantidade) {
    if (index < 0) {
        return false;
    }

    if (index >= dados.carrinho.length) {
        return false;
    }

    if (novaQuantidade <= 0) {
        return removerItem(index);
    }

    let nomeItem = dados.carrinho[index].nome;
    let estoqueDisponivel = dados.estoque[nomeItem];

    if (novaQuantidade > estoqueDisponivel) {
        return false;
    }

    dados.carrinho[index].quantidade = novaQuantidade;

    return true;
}

// Sistema de Pedido/Frete
function calcularFrete(estado) {
    let tabelaFrete = {
        'SP': 10.00,
        'RJ': 15.00,
        'MG': 12.00,
        'Outros': 20.00
    };

    if (tabelaFrete[estado] !== undefined) {
        dados.frete = tabelaFrete[estado];
    } else {
        dados.frete = tabelaFrete['Outros'];
    }

    return dados.frete;
}

function aplicarCupom(codigo) {
    let cupons = {
        'PROMO10': { desconto: 0.1, tipo: 'percentual' },
        'PROMO20': { desconto: 0.2, tipo: 'percentual' },
        'SUPERPROMO25': { desconto: 0.25, tipo: 'percentual' },
        'FRETEGRATIS': { desconto: 0, tipo: 'frete' }
    };

    if (cupons[codigo] !== undefined) {
        dados.cupomAplicado = cupons[codigo];
        return true;
    } 
    else 
    {
        return false;
    }
}


// Soma tudo que tem no carrinho, aplica o desconto (se tiver cupom), 
// calcula o frete (se o cupom não for FRETEGRATIS)
function calcularTotal() {
    let subtotal = 0;

    for (let i = 0; i < dados.carrinho.length; i++) {
        subtotal = subtotal + (dados.carrinho[i].preco * dados.carrinho[i].quantidade);
    }

    let desconto = 0;

    if (dados.cupomAplicado !== null) {
        if (dados.cupomAplicado.tipo === 'percentual') {
            desconto = subtotal * dados.cupomAplicado.desconto;
        }
    }

    let freteFinal = 0;

    if (dados.cupomAplicado !== null) 
    {
        if (dados.cupomAplicado.tipo === 'frete') 
        {
            freteFinal = 0;
        } 
        else 
        {
            freteFinal = dados.frete;
        }
    } 
    else 
    {
        freteFinal = dados.frete;
    }

    let total = subtotal - desconto + freteFinal;

    return {
        subtotal: subtotal,
        desconto: desconto,
        frete: freteFinal,
        total: total
    };
}

function finalizarCompra(metodoPagamento) {
    // Só pode finalizar se o carrinho tiver pelo menos 1 item
    if (dados.carrinho.length === 0) {
        return false;
    }

    // Atualiza o estoque (tira os produtos comprados)
    for (let i = 0; i < dados.carrinho.length; i++) {
        let nomeItem = dados.carrinho[i].nome;
        let quantidade = dados.carrinho[i].quantidade;

        if (dados.estoque[nomeItem] === undefined) {
            dados.estoque[nomeItem] = 0;
        }

        dados.estoque[nomeItem] = dados.estoque[nomeItem] - quantidade;
    }

    // Gera um pedido com ID, data, total e forma de pagamento (pix, dinheiro, crédito, etc)
    let pedido = {
        id: Date.now(),
        data: new Date().toISOString(),
        itens: [],
        total: 0,
        metodoPagamento: metodoPagamento,
        status: 'pendente'
    };

    // Copiar os itens do carrinho pro pedido
    for (let i = 0; i < dados.carrinho.length; i++) {
        pedido.itens.push(dados.carrinho[i]);
    }

    let totalCalculado = calcularTotal();
    pedido.total = totalCalculado.total;

    dados.historicoPedidos.push(pedido);

    // Limpar carrinho e cupom
    dados.carrinho = [];
    dados.cupomAplicado = null;

    return pedido.id;
}


// Sistema de Estoque
function inicializarEstoque() {
    dados.estoque = {
        'Azeite': 20,
        'Sabonete': 15,
        'Leite Condensado': 10,
        'Açúcar': 8,
        'Leite': 12,
        'Nescau': 5
    };
}

function getEstoque() {
    return dados.estoque;
}

function getCarrinho() {
    return dados.carrinho;
}

function getHistoricoPedidos() {
    return dados.historicoPedidos;
}

module.exports = {
    // Dados
    resetarDados,

    // Login
    validarCadastro,
    cadastrarUsuario,
    fazerLogin,
    validarCPF,
    validarTelefone,
    validarDataNascimento,

    // Carrinho
    adicionarAoCarrinho,
    removerItem,
    alterarQuantidade,
    getCarrinho,

    // Pedido
    calcularFrete,
    aplicarCupom,
    calcularTotal,
    finalizarCompra,
    getHistoricoPedidos,

    // Estoque
    inicializarEstoque,
    getEstoque
};
