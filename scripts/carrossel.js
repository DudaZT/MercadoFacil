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