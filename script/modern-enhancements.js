// Améliorations modernes pour la carte interactive

document.addEventListener('DOMContentLoaded', function() {
    // Animation du titre de la page
    animatePageTitle();
    
    // Amélioration des interactions avec les filtres
    enhanceFilterInteractions();
    
    // Ajout d'effets de survol sur les boutons
    addButtonHoverEffects();
});

// Animation du titre de la page
function animatePageTitle() {
    const title = document.querySelector('.page-title h1');
    const subtitle = document.querySelector('.page-title p');
    
    if (title && subtitle) {
        title.style.opacity = '0';
        subtitle.style.opacity = '0';
        title.style.transform = 'translateY(-20px)';
        subtitle.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            title.style.transition = 'all 0.8s ease';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                subtitle.style.transition = 'all 0.8s ease';
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 300);
        }, 300);
    }
}

// Amélioration des interactions avec les filtres
function enhanceFilterInteractions() {
    const filterGroups = document.querySelectorAll('.filter-group');
    
    filterGroups.forEach(group => {
        const title = group.querySelector('.filter-title');
        const options = group.querySelector('.filter-options');
        
        // Ajouter un effet d'accordéon
        if (title && options) {
            title.addEventListener('click', () => {
                title.classList.toggle('active');
                
                if (options.style.maxHeight) {
                    options.style.maxHeight = null;
                } else {
                    options.style.maxHeight = options.scrollHeight + 'px';
                }
            });
        }
    });
}

// Ajout d'effets de survol sur les boutons
function addButtonHoverEffects() {
    const buttons = document.querySelectorAll('button, .footer-link, .social-icon');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}