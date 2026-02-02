document.addEventListener('DOMContentLoaded', function() {
    // Référence à la liste des POI
    const poiListContainer = document.getElementById('poi-list');
    const modal = document.getElementById('poi-detail-modal');
    const modalContent = document.getElementById('poi-detail-content');
    
    // Fonction pour créer les cartes de POI
    function createPoiCards(poiData) {
        poiListContainer.innerHTML = '';
        
        if (poiData.length === 0) {
            poiListContainer.innerHTML = '<div class="no-results">Aucun point d\'intérêt ne correspond à votre recherche.</div>';
            return;
        }
        
        poiData.forEach(poi => {
            const properties = poi.properties;
            
            // Création de la carte
            const card = document.createElement('div');
            card.className = 'poi-card';
            card.dataset.category = properties.categorie;
            card.dataset.subcategory = properties.sous_cat.toLowerCase().replace(/ /g, '_');
            
            // Image
            let imageHtml = '';
            if (properties.photo) {
                imageHtml = `<img src="${properties.photo}" alt="${properties.nom}" class="poi-image">`;
            } else {
                imageHtml = `<div class="poi-image-placeholder"></div>`;
            }
            
            // Contenu de la carte
            card.innerHTML = `
                ${imageHtml}
                <div class="poi-content">
                    <h3 class="poi-title">${properties.nom}</h3>
                    <span class="poi-category">${properties.sous_cat}</span>
                    <p class="poi-description">${properties.descriptif || 'Aucune description disponible.'}</p>
                    <div class="poi-location">
                        <i class="fas fa-map-marker-alt"></i> ${properties.commune || ''}
                        ${properties.adresse ? ` - ${properties.adresse}` : ''}
                    </div>
                    <a href="#" class="poi-button" data-id="${properties.id}">Voir détails</a>
                </div>
            `;
            
            // Ajouter un gestionnaire d'événements pour le bouton "Voir détails"
            const detailButton = card.querySelector('.poi-button');
            detailButton.addEventListener('click', function(e) {
                e.preventDefault();
                showPoiDetail(poi);
            });
            
            poiListContainer.appendChild(card);
        });
    }
    
    // Fonction pour afficher les détails d'un POI
    function showPoiDetail(poi) {
        const properties = poi.properties;
        
        // Construire le contenu de la modal
        let detailHtml = `
            <div class="poi-detail">
                ${properties.photo ? `<img src="${properties.photo}" alt="${properties.nom}" class="poi-detail-image">` : ''}
                <h2 class="poi-detail-title">${properties.nom}</h2>
                <span class="poi-detail-category">${properties.categorie} - ${properties.sous_cat}</span>
                
                <div class="poi-detail-info">
                    <div class="poi-detail-description">${properties.descriptif || 'Aucune description disponible.'}</div>
                    
                    <div class="poi-detail-location">
                        <p><strong>Commune:</strong> ${properties.commune || 'Non spécifié'}</p>
                        ${properties.adresse ? `<p><strong>Adresse:</strong> ${properties.adresse}</p>` : ''}
                        ${properties.coordonnées ? `<p><strong>Coordonnées:</strong> ${properties.coordonnées}</p>` : ''}
                    </div>
                    
                    <div class="poi-detail-contact">
                        ${properties.tel ? `<a href="tel:${properties.tel}"><i class="fas fa-phone"></i> ${properties.tel}</a>` : ''}
                        ${properties.mail ? `<a href="mailto:${properties.mail}"><i class="fas fa-envelope"></i> Contact par email</a>` : ''}
                        ${properties.site_web ? `<a href="${properties.site_web}" target="_blank"><i class="fas fa-globe"></i> Site web</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = detailHtml;
        modal.style.display = 'block';
    }
    
    // Fermer la modal quand on clique sur la croix
    document.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fermer la modal quand on clique en dehors
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Fonction pour filtrer les POI
    function filterPois() {
        const checkedFilters = document.querySelectorAll('.filter-options input[type="checkbox"]:checked');
        
        if (checkedFilters.length === 0) {
            // Si aucun filtre n'est sélectionné, afficher tous les POI
            createPoiCards(poi.features);
            return;
        }
        
        // Créer un tableau des sous-catégories sélectionnées
        const selectedSubcategories = Array.from(checkedFilters).map(checkbox => checkbox.dataset.subcategory);
        
        // Filtrer les POI selon les sous-catégories sélectionnées
        const filteredPois = poi.features.filter(poi => {
            const subcategory = poi.properties.sous_cat.toLowerCase().replace(/ /g, '_');
            return selectedSubcategories.includes(subcategory);
        });
        
        createPoiCards(filteredPois);
        
        // Sauvegarder l'état des filtres
        const filters = [];
        checkedFilters.forEach(checkbox => {
            filters.push({
                category: checkbox.dataset.category,
                subcategory: checkbox.dataset.subcategory
            });
        });
        sessionStorage.setItem('sharedFilters', JSON.stringify(filters));
    }
    
    // Initialisation des filtres
    function initFilters() {
        // Gestion des titres de filtres (afficher/masquer les options)
        const filterTitles = document.querySelectorAll('.filter-title');
        filterTitles.forEach(title => {
            title.addEventListener('click', function() {
                this.classList.toggle('active');
                const options = this.nextElementSibling;
                options.style.display = options.style.display === 'none' ? 'block' : 'none';
            });
        });
        
        // Gestion des cases à cocher
        const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', filterPois);
        });
        
        // Boutons "Tout sélectionner" et "Tout désélectionner"
        document.querySelector('.select-all').addEventListener('click', function() {
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            filterPois();
        });
        
        document.querySelector('.deselect-all').addEventListener('click', function() {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            filterPois();
        });
        
        // Gestion du bouton de fermeture des filtres (mobile)
        document.querySelector('.close-filters').addEventListener('click', function() {
            document.querySelector('.filters-panel').style.display = 'none';
        });
        
        // Charger les filtres sauvegardés
        const savedFilters = sessionStorage.getItem('sharedFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                
                // Décocher toutes les cases d'abord
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Cocher les cases sauvegardées
                filters.forEach(filter => {
                    const checkbox = document.querySelector(`.filter-options input[data-category="${filter.category}"][data-subcategory="${filter.subcategory}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                
                // Appliquer les filtres
                filterPois();
                
                // Ouvrir les groupes de filtres qui contiennent des filtres sélectionnés
                document.querySelectorAll('.filter-group').forEach(group => {
                    const hasCheckedFilters = group.querySelector('input[type="checkbox"]:checked');
                    if (hasCheckedFilters) {
                        const filterTitle = group.querySelector('.filter-title');
                        const filterOptions = group.querySelector('.filter-options');
                        filterTitle.classList.add('active');
                        filterOptions.style.display = 'block';
                    }
                });
            } catch (e) {
                console.error("Erreur lors du chargement des filtres:", e);
            }
        }
        
        // Sauvegarder les filtres lors du clic sur le lien vers index.html
        const link = document.querySelector('a[href="index.html"]');
        if (link) {
            link.addEventListener('click', function() {
                const filters = [];
                document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(cb => {
                    filters.push({
                        category: cb.dataset.category,
                        subcategory: cb.dataset.subcategory
                    });
                });
                sessionStorage.setItem('sharedFilters', JSON.stringify(filters));
            });
        }
    }
    
    // Initialisation de la page
    function init() {
        // Vérifier si les données POI sont disponibles
        if (typeof poi !== 'undefined' && poi.features) {
            createPoiCards(poi.features);
            initFilters();
        } else {
            console.error('Les données POI ne sont pas disponibles.');
            poiListContainer.innerHTML = '<div class="error-message">Impossible de charger les points d\'intérêt.</div>';
        }
    }
    
    // Lancer l'initialisation
    init();
});