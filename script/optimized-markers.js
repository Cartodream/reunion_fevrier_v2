// Fonction optimisée pour créer les marqueurs
function createOptimizedMarkers() {
    // Créer un cache pour les icônes
    const iconCache = {};
    
    // Fonction pour obtenir une icône du cache ou en créer une nouvelle
    function getIcon(category) {
        const iconName = normalizeString(category);
        
        // Cas spéciaux pour certaines icônes SVG
        let iconUrl = `image/${iconName}.png`;
        if (iconName === 'apiculteur') {
            iconUrl = `image/apiculteur_V3.svg`;
        } else if (iconName === 'forets_et_parcs') {
            iconUrl = `image/arbre_V01.svg`;
        }
        
        if (!iconCache[iconName]) {
            iconCache[iconName] = L.icon({
                iconUrl: iconUrl,
                iconSize: [25, 25],
                iconAnchor: [12, 12],
                popupAnchor: [15, 0]
            });
        }
        return iconCache[iconName];
    }
    
    // Créer les marqueurs par lots
    const markersToAdd = [];
    
    // Parcourir tous les POIs
    poi.features.forEach(feature => {
        // Création de l'icône personnalisée depuis le cache
        const icon = getIcon(feature.properties.sous_cat);
        
        // Création du marqueur
        const marker = L.marker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
            { icon: icon }
        );
        
        // Stockage des données pour la popup sans la créer immédiatement
        marker.poiData = feature.properties;
        

        
        // Gestion spéciale pour les bassins
        if (feature.properties.nom === "Orchidées sauvages - Bassin de la Vaucouleurs") {
            setupBassinHandler(marker, bassinVaucouleursLayer);
        } else if (feature.properties.nom === "Orchidées sauvages - Bassin de la Vesgre") {
            setupBassinHandler(marker, bassinVesgreLayer);
        } else {
            // Ajouter un gestionnaire d'événements pour créer la popup à la demande
            marker.on('click', function(e) {
                // Vérifier s'il y a un événement lié à ce POI ET si on est en mode filtrage calendrier
                if (typeof events !== 'undefined' && selectedStart) {
                    const eventData = events.features.find(event => String(event.properties.poi_id) === String(this.poiData.id));
                    if (eventData) {
                        openEventPanel(eventData);
                        return;
                    }
                }
                
                // Effet sur l'icône
                const iconElement = this.getElement();
                if (iconElement) {
                    iconElement.classList.add('marker-active');
                    
                    // Cas spécial pour forêts et parcs : changer l'icône en rouge
                    if (this.poiData.sous_cat === 'Forêts et Parcs') {
                        this.setIcon(L.icon({
                            iconUrl: `image/arbre_V01_rouge.svg`,
                            iconSize: [25, 25],
                            iconAnchor: [12, 12],
                            popupAnchor: [15, 0]
                        }));
                    }
                }
                
                // Supprimer l'effet des autres marqueurs
                document.querySelectorAll('.marker-active').forEach(el => {
                    if (el !== iconElement) {
                        el.classList.remove('marker-active');
                    }
                });
                
                // Afficher dans le volet droit
                showPoiInSidePanel(this.poiData);
            });
        }
        
        // Stockage du marqueur avec ses catégories pour le filtrage
        const category = mapToFilterCategory(feature.properties.categorie);
        const subcategory = mapToFilterSubcategory(feature.properties.sous_cat);
        
        if (!allMarkers[category]) {
            allMarkers[category] = {};
        }
        
        if (!allMarkers[category][subcategory]) {
            allMarkers[category][subcategory] = [];
        }
        
        allMarkers[category][subcategory].push(marker);
        
        // Ajouter à la liste des marqueurs à ajouter
        markersToAdd.push(marker);
    });
    
    // Ajouter tous les marqueurs au cluster en une seule opération
    markers.addLayers(markersToAdd);
    
    // Ajouter le cluster à la carte
    map.addLayer(markers);
}

// Fonction pour afficher un POI dans le volet droit
function showPoiInSidePanel(poiData) {
    const sidePanel = document.getElementById('side-panel');
    const poiList = document.getElementById('poi-list');
    const panelHeader = sidePanel.querySelector('.side-panel-header h2');
    
    // Changer le titre
    panelHeader.textContent = 'Point d\'Intérêt';
    
    // Créer le contenu du POI
    let content = `<div class="poi-detail">`;
    content += `<h3>${poiData.nom}</h3>`;
    
    if (poiData.photo) {
        content += `<img src="${poiData.photo}" alt="${poiData.nom}" class="poi-detail-image popup-thumbnail" 
                     data-full-img="${poiData.photo}"
                     data-photo2="${poiData.photo2 || ''}"
                     data-photo3="${poiData.photo3 || ''}"
                     data-photo4="${poiData.photo4 || ''}"
                     data-photo5="${poiData.photo5 || ''}"
                     data-photo6="${poiData.photo6 || ''}"
                     data-photo7="${poiData.photo7 || ''}"
                     data-photo8="${poiData.photo8 || ''}"
                     data-photo9="${poiData.photo9 || ''}"
                     data-photo10="${poiData.photo10 || ''}"
                     data-photo11="${poiData.photo11 || ''}"
                     data-photo12="${poiData.photo12 || ''}"
                     data-photo13="${poiData.photo13 || ''}">`;
    }
    
    if (poiData.descriptif) {
        content += `<p>${poiData.descriptif}</p>`;
    }
    
    if (poiData.tel) {
        content += `<p><strong>Tél :</strong> ${poiData.tel}</p>`;
    }
    
    if (poiData.mail) {
        content += `<p><strong>Email :</strong> ${poiData.mail}</p>`;
    }
    
    if (poiData.site_web) {
        content += `<p><a href="${poiData.site_web}" target="_blank">Plus d'informations</a></p>`;
    }
    
    content += `</div>`;
    
    // Remplacer le contenu du volet
    poiList.innerHTML = content;
    
    // Ouvrir le volet
    sidePanel.classList.add('active');
}

// Fonction pour afficher un événement dans le volet droit
function openEventPanel(eventData) {
    const sidePanel = document.getElementById('side-panel');
    const poiList = document.getElementById('poi-list');
    const panelHeader = sidePanel.querySelector('.side-panel-header h2');
    
    // Trouver le POI correspondant
    let poiData = null;
    if (poi && poi.features) {
        poiData = poi.features.find(p => String(p.properties.id) === String(eventData.properties.poi_id));
    }
    if (!poiData && typeof rivieres_opth !== 'undefined' && rivieres_opth.features) {
        poiData = rivieres_opth.features.find(r => String(r.properties.ID) === String(eventData.properties.poi_id));
    }
    
    // Changer le titre
    panelHeader.textContent = 'Événement';
    
    // Créer le contenu de l'événement
    let content = `<div class="poi-detail">`;
    content += `<h3>${poiData ? poiData.properties.nom : 'Lieu inconnu'}</h3>`;
    
    // Priorité aux photos de l'événement, sinon celles du POI
    if (eventData.properties.image) {
        content += `<img src="${eventData.properties.image}" alt="Événement" class="poi-detail-image popup-thumbnail" 
                     data-full-img="${eventData.properties.image}">`;
    } else if (poiData && poiData.properties.photo) {
        content += `<img src="${poiData.properties.photo}" alt="${poiData.properties.nom}" class="poi-detail-image popup-thumbnail" 
                     data-full-img="${poiData.properties.photo}"
                     data-photo2="${poiData.properties.photo2 || ''}"
                     data-photo3="${poiData.properties.photo3 || ''}"
                     data-photo4="${poiData.properties.photo4 || ''}"
                     data-photo5="${poiData.properties.photo5 || ''}"
                     data-photo6="${poiData.properties.photo6 || ''}"
                     data-photo7="${poiData.properties.photo7 || ''}"
                     data-photo8="${poiData.properties.photo8 || ''}"
                     data-photo9="${poiData.properties.photo9 || ''}"
                     data-photo10="${poiData.properties.photo10 || ''}"
                     data-photo11="${poiData.properties.photo11 || ''}"
                     data-photo12="${poiData.properties.photo12 || ''}"
                     data-photo13="${poiData.properties.photo13 || ''}">`;
    }
    
    // Formatage des dates
    const startDate = new Date(eventData.properties.debut).toLocaleDateString('fr-FR');
    const endDate = new Date(eventData.properties.fin).toLocaleDateString('fr-FR');
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    
    content += `<p><strong>Date :</strong> ${dateRange}</p>`;
    
    if (eventData.properties.description_event) {
        content += `<p><strong>Événement :</strong> ${eventData.properties.description_event}</p>`;
    }
    
    if (poiData && poiData.properties.descriptif) {
        content += `<p><strong>Lieu :</strong> ${poiData.properties.descriptif}</p>`;
    }
    
    if (poiData && poiData.properties.tel) {
        content += `<p><strong>Tél :</strong> ${poiData.properties.tel}</p>`;
    }
    
    if (poiData && poiData.properties.mail) {
        content += `<p><strong>Email :</strong> ${poiData.properties.mail}</p>`;
    }
    
    if (poiData && poiData.properties.site_web) {
        content += `<p><a href="${poiData.properties.site_web}" target="_blank">Plus d'informations</a></p>`;
    }
    
    content += `</div>`;
    
    // Remplacer le contenu du volet
    poiList.innerHTML = content;
    
    // Ouvrir le volet
    sidePanel.classList.add('active');
}

// Fonction pour supprimer les zones d'orchidées
function removeOrchideeZones() {
    if (bassinVesgreLayer && map.hasLayer(bassinVesgreLayer)) {
        map.removeLayer(bassinVesgreLayer);
    }
    if (bassinVaucouleursLayer && map.hasLayer(bassinVaucouleursLayer)) {
        map.removeLayer(bassinVaucouleursLayer);
    }
}

// Fonction pour créer le contenu de la popup à la demande
function createPopupContent(properties) {
    let popupContent = `<h3>${properties.nom}</h3>`;
    
    // Conteneur pour la mise en page à deux colonnes
    popupContent += `<div class="popup-container">`;
    
    // Colonne de gauche pour le descriptif
    popupContent += `<div class="popup-text">`;
    if (properties.descriptif) {
        popupContent += `<p>${properties.descriptif}</p>`;
    }
    popupContent += `</div>`;
    
    // Colonne de droite pour l'image
    if (properties.photo) {
        popupContent += `
            <div class="popup-image">
                <img src="${properties.photo}" alt="${properties.nom}" class="popup-thumbnail" 
                     data-full-img="${properties.photo}" 
                     data-photo2="${properties.photo2 || ''}"
                     data-photo3="${properties.photo3 || ''}"
                     data-photo4="${properties.photo4 || ''}"
                     data-photo5="${properties.photo5 || ''}"
                     data-photo6="${properties.photo6 || ''}"
                     data-photo7="${properties.photo7 || ''}"
                     data-photo8="${properties.photo8 || ''}"
                     data-photo9="${properties.photo9 || ''}"
                     data-photo10="${properties.photo10 || ''}"
                     data-photo11="${properties.photo11 || ''}"
                     data-photo12="${properties.photo12 || ''}"
                     data-photo13="${properties.photo13 || ''}">
            </div>
        `;
    } else {
        // Si pas d'image, ajuster l'espace pour le texte
        popupContent = popupContent.replace('<div class="popup-text">', '<div class="popup-text" style="width:100%">');
    }
    
    popupContent += `</div>`; // Fin du conteneur à deux colonnes
    
    // Section pour les liens et informations supplémentaires
    popupContent += `<div class="popup-links">`;
    
    if (properties.tel) {
        popupContent += `<p><strong>Tél :</strong> ${properties.tel}</p>`;
    }
    
    if (properties.mail) {
        popupContent += `<p><strong>Email :</strong> ${properties.mail}</p>`;
    }
    
    if (properties.site_web) {
        popupContent += `<p><a href="${properties.site_web}" target="_blank">Plus d'informations</a></p>`;
    }
    
    if (properties.accessibilité) {
        popupContent += `<p><strong>Accessible :</strong> ${properties.accessibilité}</p>`;
    }
    
    if (properties.Latitude && properties.Longitude) {
        popupContent += `<p><a href="https://www.google.com/maps/dir//${properties.Latitude},${properties.Longitude}" target="_blank">Itinéraire</a></p>`;
    }
    
    popupContent += `</div>`; // Fin de la section des liens
    
    return popupContent;
}

// Fonction pour configurer les gestionnaires d'événements pour les bassins
function setupBassinHandler(marker, bassinLayer) {
    marker.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        
        // Fermer toutes les popups existantes
        map.closePopup();
        
        // Effet sur l'icône
        const iconElement = this.getElement();
        if (iconElement) {
            iconElement.classList.add('marker-active');
        }
        
        // Supprimer l'effet des autres marqueurs
        document.querySelectorAll('.marker-active').forEach(el => {
            if (el !== iconElement) el.classList.remove('marker-active');
        });
        
        // Afficher SEULEMENT dans le volet droit (pas de popup Leaflet)
        showPoiInSidePanel(this.poiData);
        
        if (bassinLayer) {
            // Supprimer d'abord toutes les zones d'orchidées existantes
            if (typeof removeOrchideeZones === 'function') {
                removeOrchideeZones();
            }
            
            // Retirer temporairement le marqueur du cluster
            markers.removeLayer(marker);
            // Ajouter le marqueur directement à la carte
            marker.addTo(map);
            // Ajouter la couche du bassin
            map.addLayer(bassinLayer);
            // Puis ajuster la vue avec un délai pour éviter les conflits
            setTimeout(function() {
                map.fitBounds(bassinLayer.getBounds(), {animate: false});
            }, 100);
        }
    });
    
    // Supprimer la zone quand le volet se ferme
    document.addEventListener('DOMContentLoaded', function() {
        const closeSidePanel = document.querySelector('.close-side-panel');
        if (closeSidePanel) {
            closeSidePanel.addEventListener('click', function() {
                if (bassinLayer && map.hasLayer(bassinLayer)) {
                    map.removeLayer(bassinLayer);
                    // Remettre le marqueur dans le cluster
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                        markers.addLayer(marker);
                    }
                }
                // Supprimer l'effet de l'icône
                const iconElement = marker.getElement();
                if (iconElement) {
                    iconElement.classList.remove('marker-active');
                }
            });
        }
    });
}