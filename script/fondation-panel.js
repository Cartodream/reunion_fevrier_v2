// Gestion du panneau de fondation
document.addEventListener('DOMContentLoaded', function() {
    const toggleFondationBtn = document.getElementById('toggle-fondation-btn');
    const fondationPanel = document.getElementById('fondation-panel');
    const closeFondationPanel = document.querySelector('.close-fondation-panel');
    const fondationPoiList = document.getElementById('fondation-poi-list');

    // Ouvrir le panneau de fondation
    toggleFondationBtn.addEventListener('click', function() {
        fondationPanel.classList.add('active');
        loadFondationPOIs();
    });

    // Fermer le panneau de fondation
    closeFondationPanel.addEventListener('click', function() {
        fondationPanel.classList.remove('active');
    });

    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (!fondationPanel.contains(event.target) && !toggleFondationBtn.contains(event.target)) {
            fondationPanel.classList.remove('active');
        }
    });

    // Charger les POIs avec fondation_courant
    function loadFondationPOIs() {
        if (typeof poi === 'undefined') return;
        
        const fondationPOIs = poi.features.filter(feature => 
            feature.properties.fondation_courant && feature.properties.fondation_courant !== null
        );
        
        fondationPoiList.innerHTML = '';
        
        if (fondationPOIs.length === 0) {
            fondationPoiList.innerHTML = '<div class="no-results">Aucun point d\'intérêt lié à la fondation.</div>';
            return;
        }
        
        fondationPOIs.forEach(feature => {
            const properties = feature.properties;
            
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
                    <span class="poi-category">${properties.sous_cat}</span>
                    <p class="poi-description">${properties.descriptif || 'Aucune description disponible.'}</p>
                    <div class="poi-location">
                        <i class="fas fa-map-marker-alt"></i> ${properties.commune || ''}
                        ${properties.adresse ? ` - ${properties.adresse}` : ''}
                    </div>
                    <div class="fondation-link">
                        <a href="${properties.fondation_courant}" target="_blank">Lien vers le site de la Fondation du Patrimoine</a>
                    </div>
                    <a href="#" class="poi-button" data-id="${properties.id}">Voir sur la carte</a>
                </div>
            `;
            
            // Ajouter un gestionnaire d'événements pour le bouton "Voir sur la carte"
            const viewButton = card.querySelector('.poi-button');
            viewButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Réactiver le filtre si nécessaire
                const category = mapToFilterCategory(properties.categorie);
                const subcategory = mapToFilterSubcategory(properties.sous_cat);
                
                if (!categoryFilters[category] || !categoryFilters[category][subcategory]) {
                    // Activer le filtre
                    if (!categoryFilters[category]) categoryFilters[category] = {};
                    categoryFilters[category][subcategory] = true;
                    
                    // Cocher la case correspondante
                    const checkbox = document.querySelector(`input[data-category="${category}"][data-subcategory="${subcategory}"]`);
                    if (checkbox) checkbox.checked = true;
                    
                    // Mettre à jour les marqueurs
                    updateMarkers();
                }
                
                // Centrer la carte sur ce POI
                map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 16);
                
                // Trouver le marqueur correspondant
                if (typeof allMarkers !== 'undefined') {
                    for (const category in allMarkers) {
                        for (const subcategory in allMarkers[category]) {
                            const marker = allMarkers[category][subcategory].find(m => 
                                m.getLatLng().lat === feature.geometry.coordinates[1] && 
                                m.getLatLng().lng === feature.geometry.coordinates[0]
                            );
                            if (marker) {
                                marker.openPopup();
                                return;
                            }
                        }
                    }
                }
            });
            
            fondationPoiList.appendChild(card);
        });
    }
});