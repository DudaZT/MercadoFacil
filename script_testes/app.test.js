const funcoes = require('./app');

// antes de cada teste
beforeEach(() => {
    funcoes.resetarDados();
    funcoes.inicializarEstoque();

    funcoes.cadastrarUsuario({
        nome: 'Usuário Teste',
        email: 'teste@example.com',
        senha: 'senha123',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999',
        dataNascimento: '1990-01-01',
        cpf: '12345678901'
    });
});

// ATV1 - Criação e uso de credenciais de login (usuário e senha).
test('Cadastra novo usuário com dados válidos', () => {
    const dadosValidos = {
        nome: 'Novo Usuário',
        email: 'novo@example.com',
        senha: 'senha123',
        endereco: 'Rua Nova, 456',
        telefone: '11988888888',
        dataNascimento: '1995-05-05',
        cpf: '98765432109'
    };

    expect(funcoes.validarCadastro(dadosValidos)).toBe(true);
    expect(funcoes.cadastrarUsuario(dadosValidos)).toBe(true);
});

test('Faz login com credenciais corretas', () => {
    expect(funcoes.fazerLogin('teste@example.com', 'senha123')).toBe(true);
});

test('Rejeita login com credenciais incorretas', () => {
    expect(funcoes.fazerLogin('teste@example.com', 'senhaerrada')).toBe(false);
});

// ATV2 - Execução de Compras no Sistema
test('Adiciona itens ao carrinho corretamente', () => {
    expect(funcoes.adicionarAoCarrinho('Azeite', 10.90)).toBe(true);
    expect(funcoes.adicionarAoCarrinho('Azeite', 10.90)).toBe(true);
    expect(funcoes.adicionarAoCarrinho('Sabonete', 2.50)).toBe(true);

    const carrinho = funcoes.getCarrinho();
    expect(carrinho.length).toBe(2); // 3 itens no carrinho
    expect(carrinho.find(i => i.nome === 'Azeite').quantidade).toBe(2); // Verifica se tem 2 azeites
});

test('Calcula frete para RJ corretamente', () => {
    expect(funcoes.calcularFrete('RJ')).toBe(15.00);
});

test('Finaliza compra com pagamento em dinheiro', () => {
    funcoes.adicionarAoCarrinho('Azeite', 10.90);
    funcoes.adicionarAoCarrinho('Sabonete', 2.50);
    funcoes.calcularFrete('RJ');

    const pedidoId = funcoes.finalizarCompra('dinheiro');
    expect(pedidoId).toBeTruthy(); // tem que ser verdadeiro (não pode ser vazio)

    const historico = funcoes.getHistoricoPedidos();
    expect(historico.length).toBe(1); // verifica se tem 1 pedido
    expect(historico[0].metodoPagamento).toBe('dinheiro'); // veifica se no pedido o método de pagamento é dinheiro
});

// ATV3 - Manipulação de Produtos
test('Gerencia quantidades no carrinho corretamente', () => {
    funcoes.adicionarAoCarrinho('Leite Condensado', 6.50);
    funcoes.alterarQuantidade(0, 4); // Muda a quantidade do leite condensado para 4

    funcoes.adicionarAoCarrinho('Sabonete', 2.50); 
    funcoes.adicionarAoCarrinho('Sabonete', 2.50);

    funcoes.removerItem(1); // Remove sabonete
    funcoes.alterarQuantidade(0, 2); // Altera a quantidade do leite condensado para 2

    const carrinho = funcoes.getCarrinho();
    expect(carrinho.length).toBe(1); // verifica se tem 1 item no carrinho
    expect(carrinho.find(i => i.nome === 'Leite Condensado').quantidade).toBe(2); // Verifica se tem 2 leite condensado
});

test('Finaliza compra com pagamento via Pix', () => {
    funcoes.adicionarAoCarrinho('Leite Condensado', 6.50);
    funcoes.calcularFrete('MG');

    const pedidoId = funcoes.finalizarCompra('pix');
    expect(pedidoId).toBeTruthy();

    const historico = funcoes.getHistoricoPedidos();
    expect(historico[0].metodoPagamento).toBe('pix');
});

// ATV4 - Cupons de Desconto
test('Aplica cupom de 25% corretamente', () => {
    funcoes.adicionarAoCarrinho('Azeite', 10.00);
    funcoes.alterarQuantidade(0, 5); // 50
    expect(funcoes.aplicarCupom('SUPERPROMO25')).toBe(true);

    funcoes.calcularFrete('SP');
    const total = funcoes.calcularTotal();

    expect(total.desconto).toBe(12.50); // (25% de R$50,00)
    expect(total.total).toBe(37.50 + 10.00);  // (R$50 - R$12,50 + R$10 de frete.)
});

test('Finaliza compra com cartão de crédito', () => {
    funcoes.adicionarAoCarrinho('Azeite', 10.00);
    funcoes.alterarQuantidade(0, 5);
    funcoes.aplicarCupom('SUPERPROMO25');
    funcoes.calcularFrete('SP');

    const pedidoId = funcoes.finalizarCompra('credito');
    expect(pedidoId).toBeTruthy();

    const historico = funcoes.getHistoricoPedidos();
    expect(historico[0].metodoPagamento).toBe('credito');
});
