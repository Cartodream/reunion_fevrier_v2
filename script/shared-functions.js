// Fonctions partagées pour éviter les doublons
window.sharedFunctions = {
    // Fonction pour normaliser une chaîne
    normalizeString: function(str) {
        if (!str) return 'default';
        
        return str.toLowerCase()
            .replace(/ /g, '_')
            .replace(/[àáâãäå]/g, 'a')
            .replace(/æ/g, 'ae')
            .replace(/ç/g, 'c')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/ñ/g, 'n')
            .replace(/[òóôõö]/g, 'o')
            .replace(/œ/g, 'oe')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/'/g, '');
    },
    
    // Fonction pour sauvegarder les filtres
    saveFilters: function() {
        const filters = [];
        document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(cb => {
            filters.push({
                category: cb.dataset.category,
                subcategory: cb.dataset.subcategory
            });
        });
        sessionStorage.setItem('sharedFilters', JSON.stringify(filters));
    }
};

// Rendre normalizeString disponible globalement pour compatibilité
window.normalizeString = window.sharedFunctions.normalizeString;