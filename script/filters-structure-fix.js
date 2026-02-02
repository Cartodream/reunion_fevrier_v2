/**
 * Script pour restructurer le panneau des filtres
 */
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner le panneau des filtres
    const filtersPanel = document.querySelector('.filters-panel');
    
    if (filtersPanel) {
        // Sauvegarder le contenu original
        const filtersHeader = filtersPanel.querySelector('.filters-header');
        const filterGroups = Array.from(filtersPanel.querySelectorAll('.filter-group'));
        const filterButtons = filtersPanel.querySelector('.filter-buttons');
        
        // Vider le panneau
        filtersPanel.innerHTML = '';
        
        // Réinsérer l'en-tête
        if (filtersHeader) {
            filtersPanel.appendChild(filtersHeader);
        }
        
        // Créer un conteneur pour les groupes de filtres
        const filtersContent = document.createElement('div');
        filtersContent.className = 'filters-content';
        
        // Ajouter les groupes de filtres au conteneur
        filterGroups.forEach(group => {
            filtersContent.appendChild(group);
        });
        
        // Ajouter le conteneur au panneau
        filtersPanel.appendChild(filtersContent);
        
        // Réinsérer les boutons
        if (filterButtons) {
            filtersPanel.appendChild(filterButtons);
        }
    }
});