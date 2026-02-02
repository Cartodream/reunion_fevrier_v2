// Script pour charger les ressources de manière différée

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour charger les ressources non critiques après le chargement initial
    function loadDeferredResources() {
        // Charger les styles non critiques
        const deferredStyles = [
            'css/mobile-fix.css',
            'css/map-controls.css'
        ];
        
        deferredStyles.forEach(function(href) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });
        
        // Précharger les images des marqueurs pour les catégories visibles
        const visibleCategories = [];
        document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(checkbox => {
            const subcategory = checkbox.dataset.subcategory;
            if (subcategory) {
                const normalizedName = normalizeString(subcategory);
                visibleCategories.push(normalizedName);
            }
        });
        
        // Précharger les images des marqueurs visibles
        visibleCategories.forEach(function(category) {
            const img = new Image();
            img.src = `image/${category}.png`;
        });
    }
    
    // Attendre que la carte soit chargée avant de charger les ressources différées
    if (typeof map !== 'undefined') {
        map.on('load', function() {
            // Attendre un peu pour s'assurer que la carte est bien affichée
            setTimeout(loadDeferredResources, 500);
        });
    } else {
        // Fallback si la carte n'est pas disponible
        setTimeout(loadDeferredResources, 1000);
    }
});