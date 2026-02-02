document.addEventListener('DOMContentLoaded', function() {
    const explorerBtn = document.getElementById('toggle-explorer-btn');
    const explorerPanel = document.getElementById('explorer-panel');
    const closeBtn = document.querySelector('.close-explorer-panel');
    
    if (explorerBtn) {
        explorerBtn.addEventListener('click', function() {
            explorerPanel.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            explorerPanel.classList.remove('active');
        });
    }
    
    // Gestionnaires pour les titres de groupes (accordéon) dans le panneau explorer - DÉLÉGATION D'ÉVÉNEMENTS
    explorerPanel.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-title')) {
            e.target.classList.toggle('active');
            const options = e.target.nextElementSibling;
            if (options && options.classList.contains('filter-options')) {
                options.style.display = options.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
    
    // Gestionnaires pour les boutons dans le panneau explorer mobile
    const explorerSelectAll = explorerPanel.querySelector('.select-all');
    const explorerDeselectAll = explorerPanel.querySelector('.deselect-all');
    
    if (explorerSelectAll) {
        explorerSelectAll.addEventListener('click', function() {
            // Sélectionner toutes les cases dans le panneau explorer
            explorerPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = true;
                // Synchroniser avec le panneau principal
                const mainCheckbox = document.querySelector(`.filters-panel input[data-category="${checkbox.dataset.category}"][data-subcategory="${checkbox.dataset.subcategory}"]`);
                if (mainCheckbox) mainCheckbox.checked = true;
            });
            // Déclencher la mise à jour des filtres
            if (typeof selectAllFilters === 'function') {
                selectAllFilters();
            }
        });
    }
    
    if (explorerDeselectAll) {
        explorerDeselectAll.addEventListener('click', function() {
            // Désélectionner toutes les cases dans le panneau explorer
            explorerPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
                // Synchroniser avec le panneau principal
                const mainCheckbox = document.querySelector(`.filters-panel input[data-category="${checkbox.dataset.category}"][data-subcategory="${checkbox.dataset.subcategory}"]`);
                if (mainCheckbox) mainCheckbox.checked = false;
            });
            // Déclencher la mise à jour des filtres
            if (typeof deselectAllFilters === 'function') {
                deselectAllFilters();
            }
        });
    }
    
    // Synchroniser les changements de cases à cocher entre les deux panneaux
    explorerPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Synchroniser avec le panneau principal
            const mainCheckbox = document.querySelector(`.filters-panel input[data-category="${this.dataset.category}"][data-subcategory="${this.dataset.subcategory}"]`);
            if (mainCheckbox) {
                mainCheckbox.checked = this.checked;
                // Déclencher l'événement change sur la case principale
                mainCheckbox.dispatchEvent(new Event('change'));
            }
        });
    });
});