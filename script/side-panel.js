// Script pour gérer le panneau latéral et afficher les POIs
document.addEventListener('DOMContentLoaded', function() {
    // Références aux éléments
    const toggleListBtn = document.getElementById('toggle-list-btn');
    const sidePanel = document.getElementById('side-panel');
    const closeSidePanel = document.querySelector('.close-side-panel');
    const poiListContainer = document.getElementById('poi-list');
    
    // Fonction pour ouvrir/fermer le panneau
    toggleListBtn.addEventListener('click', function() {
        const panelHeader = sidePanel.querySelector('.side-panel-header h2');
        panelHeader.textContent = 'Liste des points d\'intérêt';
        sidePanel.classList.toggle('active');
        updatePoiList();
    });
    
    // Fonction pour fermer le panneau
    closeSidePanel.addEventListener('click', function() {
        sidePanel.classList.remove('active');
        // Supprimer l'effet de toutes les icônes
        document.querySelectorAll('.marker-active').forEach(el => {
            el.classList.remove('marker-active');
        });
        // Supprimer les zones d'orchidées
        if (typeof removeOrchideeZones === 'function') {
            removeOrchideeZones();
        }
    });
    
    // Fonction pour mettre à jour la liste des POIs en fonction des filtres
    function updatePoiList() {
        // Vider la liste
        poiListContainer.innerHTML = '';
        
        // Récupérer les filtres actifs
        const activeFilters = {};
        if (typeof categoryFilters !== 'undefined') {
            for (const category in categoryFilters) {
                for (const subcategory in categoryFilters[category]) {
                    if (categoryFilters[category][subcategory]) {
                        if (!activeFilters[category]) {
                            activeFilters[category] = [];
                        }
                        activeFilters[category].push(subcategory);
                    }
                }
            }
        }
        
        // Filtrer les POIs
        const filteredPois = poi.features.filter(feature => {
            const category = mapToFilterCategory(feature.properties.categorie);
            const subcategory = mapToFilterSubcategory(feature.properties.sous_cat);
            
            return activeFilters[category] && activeFilters[category].includes(subcategory);
        });
        
        // Ajouter les rivières si le filtre "etangs_et_rivières" est actif
        let filteredRivieres = [];
        if (activeFilters['patrimoine_naturel'] && activeFilters['patrimoine_naturel'].includes('etangs_et_rivières') && typeof rivieres_opth !== 'undefined') {
            filteredRivieres = rivieres_opth.features.filter(feature => feature.properties.nom);
        }
        
        // Vérifier s'il y a des éléments à afficher
        const totalItems = filteredPois.length + filteredRivieres.length;
        if (totalItems === 0) {
            poiListContainer.innerHTML = '<div class="no-results">Aucun point d\'intérêt ne correspond à votre recherche.</div>';
            return;
        }
        
        // Afficher les POIs filtrés
        filteredPois.forEach(poi => {
            const properties = poi.properties;
            
            // Création de la carte
            const card = document.createElement('div');
            card.className = 'poi-card';
            
            // Image
            let imageHtml = '';
            if (properties.photo) {
                imageHtml = `<img src="${properties.photo}" alt="${properties.nom}" class="poi-card-image">`;
            } else {
                imageHtml = `<div class="poi-image-placeholder"></div>`;
            }
            
            // Contenu de la carte
            card.innerHTML = `
                ${imageHtml}
                <div class="poi-content">
                    <h3 class="poi-title">${properties.nom}</h3>
                    <span class="poi-category">${properties.sous_cat === 'Patrimoine bâti monumental' ? 'Châteaux, Manoirs...' : properties.sous_cat === 'Patrimoine Religieux' ? 'Eglises, Chapelles...' : properties.sous_cat === 'Bâti Traditionnel' ? 'Maisons, Moulins, Lavoirs...' : properties.sous_cat}</span>
                    <div class="poi-location">
                        <i class="fas fa-map-marker-alt"></i> ${properties.commune || ''}
                        ${properties.adresse ? ` - ${properties.adresse}` : ''}
                    </div>
                    <a href="#" class="poi-button" data-id="${properties.id}">Plus d'informations</a>
                </div>
            `;
            
            // Ajouter un gestionnaire d'événements pour le bouton "Plus d'informations"
            const viewButton = card.querySelector('.poi-button');
            viewButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Centrer la carte sur ce POI
                map.setView([poi.geometry.coordinates[1], poi.geometry.coordinates[0]], 16);
                
                // Afficher dans le volet droit
                showPoiInSidePanel(properties);
            });
            
            poiListContainer.appendChild(card);
        });
        
        // Afficher les rivières filtrées
        filteredRivieres.forEach(riviere => {
            const properties = riviere.properties;
            
            // Création de la carte pour les rivières
            const card = document.createElement('div');
            card.className = 'poi-card';
            
            // Image
            let imageHtml = '';
            if (properties.photo) {
                imageHtml = `<img src="${properties.photo}" alt="${properties.nom}" class="poi-card-image">`;
            } else {
                imageHtml = `<div class="poi-image-placeholder"></div>`;
            }
            
            // Contenu de la carte
            card.innerHTML = `
                ${imageHtml}
                <div class="poi-content">
                    <h3 class="poi-title">${properties.nom}</h3>
                    <span class="poi-category">Etangs et Rivières</span>
                    <div class="poi-location">
                        <i class="fas fa-water"></i> Cours d'eau
                    </div>
                    <a href="#" class="poi-button riviere-button">Plus d'informations</a>
                </div>
            `;
            
            // Ajouter un gestionnaire d'événements pour le bouton "Plus d'informations"
            const viewButton = card.querySelector('.poi-button');
            viewButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Afficher dans le volet droit
                showPoiInSidePanel(properties);
                
                // Calculer les limites de la rivière pour l'afficher entièrement
                if (riviere.geometry) {
                    let allCoords = [];
                    
                    if (riviere.geometry.type === 'LineString') {
                        allCoords = riviere.geometry.coordinates;
                    } else if (riviere.geometry.type === 'MultiLineString') {
                        // Pour MultiLineString, concaténer toutes les coordonnées
                        riviere.geometry.coordinates.forEach(line => {
                            allCoords = allCoords.concat(line);
                        });
                    }
                    
                    if (allCoords.length > 0) {
                        // Calculer les limites (bounds) de la rivière
                        let minLat = allCoords[0][1], maxLat = allCoords[0][1];
                        let minLng = allCoords[0][0], maxLng = allCoords[0][0];
                        
                        allCoords.forEach(coord => {
                            minLat = Math.min(minLat, coord[1]);
                            maxLat = Math.max(maxLat, coord[1]);
                            minLng = Math.min(minLng, coord[0]);
                            maxLng = Math.max(maxLng, coord[0]);
                        });
                        
                        // Ajuster la vue pour montrer toute la rivière
                        const bounds = [[minLat, minLng], [maxLat, maxLng]];
                        map.fitBounds(bounds, {padding: [20, 20]});
                    }
                }
            });
            
            poiListContainer.appendChild(card);
        });
    }
    
    // Mettre à jour la liste des POIs lorsque les filtres changent
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (sidePanel.classList.contains('active')) {
                updatePoiList();
            }
        });
    });
    
    // Écouter l'événement personnalisé pour les changements de filtres
    document.addEventListener('filtersChanged', function() {
        if (sidePanel.classList.contains('active')) {
            updatePoiList();
        }
    });
});