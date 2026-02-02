// Script simplifié pour forcer les filtres par défaut
(function() {
    // Supprimer les filtres sauvegardés si c'est un chargement direct
    if (!document.referrer || document.referrer.indexOf(window.location.pathname) > -1) {
        sessionStorage.removeItem('sharedFilters');
    }
    
    // Appliquer les filtres par défaut
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            // Cocher uniquement le patrimoine architectural
            document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = (checkbox.dataset.category === 'patrimoine_architectural');
            });
            
            // Déclencher la mise à jour
            setTimeout(function() {
                if (typeof updateMarkers === 'function') {
                    updateMarkers();
                }
                // Pour la page liste
                document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(cb => {
                    cb.dispatchEvent(new Event('change'));
                });
            }, 500);
        }, 100);
    });
})();