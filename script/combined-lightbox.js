/**
 * Script combiné pour la gestion de la lightbox et du diaporama
 */
document.addEventListener('DOMContentLoaded', function() {
    // Variables pour le diaporama
    let currentSlideIndex = 0;
    let slideImages = [];

    // Éléments du DOM
    const modal = document.querySelector('.image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const imageCaption = document.querySelector('.image-caption');
    const slideshowControls = document.querySelector('.slideshow-controls');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const slideCounter = document.querySelector('.slide-counter');
    
    // Fermer le modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fermer le modal en cliquant en dehors de l'image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Navigation dans le diaporama
    prevButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (slideImages.length <= 1) return;
        
        // Basculer entre les images
        currentSlideIndex = (currentSlideIndex === 0) ? (slideImages.length - 1) : (currentSlideIndex - 1);
        modalImg.src = slideImages[currentSlideIndex];
        slideCounter.textContent = `${currentSlideIndex + 1}/${slideImages.length}`;
    });
    
    nextButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (slideImages.length <= 1) return;
        
        // Basculer entre les images
        currentSlideIndex = (currentSlideIndex === slideImages.length - 1) ? 0 : (currentSlideIndex + 1);
        modalImg.src = slideImages[currentSlideIndex];
        slideCounter.textContent = `${currentSlideIndex + 1}/${slideImages.length}`;
    });
    
    // Délégation d'événements pour les images dans les popups
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('popup-thumbnail')) {
            const img1 = event.target.getAttribute('data-full-img');
            slideImages = [img1];
            
            // Ajouter toutes les photos supplémentaires si elles existent
            for (let i = 2; i <= 13; i++) {
                const img = event.target.getAttribute(`data-photo${i}`);
                if (img && img !== '' && img !== 'null') {
                    slideImages.push(img);
                }
            }
            
            currentSlideIndex = 0;
            modalImg.src = slideImages[0];
            modal.style.display = 'flex';
            
            // Afficher les contrôles du diaporama uniquement s'il y a plus d'une image
            if (slideImages.length > 1) {
                slideshowControls.style.display = 'flex';
                slideCounter.textContent = `1/${slideImages.length}`;
            } else {
                slideshowControls.style.display = 'none';
            }
        }
    });
    
    // Ajouter la navigation par clavier
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                prevButton.click();
            } else if (e.key === 'ArrowRight') {
                nextButton.click();
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
        }
    });
});