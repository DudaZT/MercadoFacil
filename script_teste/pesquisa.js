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
    
    // Mostrar/ocultar carrossel baseado na pesquisa
    const carrossel = document.querySelector('.carrossel');
    if (termo !== '') {
        carrossel.style.display = 'none';
    } else {
        carrossel.style.display = 'block';
    }
}


// Event listener para o botão de pesquisa
document.getElementById('btn-pesquisar').addEventListener('click', function() {
    const termoPesquisa = document.getElementById('pesquisa').value.trim();
    filtrarProdutos(termoPesquisa);
});

// Permitir pesquisa ao pressionar Enter
document.getElementById('pesquisa').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const termoPesquisa = this.value.trim();
        filtrarProdutos(termoPesquisa);
    }
});

