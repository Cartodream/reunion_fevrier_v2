// Variables globales
let map;
let markers = L.markerClusterGroup({
    showCoverageOnHover: false
});
let allMarkers = {};
let categoryFilters = {};
let rivieresLayer;
let bassinVesgreLayer;
let bassinVaucouleursLayer;

// Initialisation de la carte
function initMap() {
    // Création de la carte
    map = L.map('map', {
        center: [48.81826349423801, 1.6032443265782088],
        zoom: 11,
        zoomControl: false,
        maxZoom: 20,
        scrollWheelZoom: true
    });
    
    // Exposer la variable globalement
    window.map = map;

    // Ajout du fond de carte OpenStreetMap avec HTTPS pour éviter les problèmes de chargement mixte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Cartographie : <a href="https://informatique-m2i.fr/">M2i informatique </a>,Cartographie : <a href="https://www.linkedin.com/in/alexandreponchon/">Alexandre PONCHON </a> , <a href="https://www.openstreetmap.fr/">OSM</a>, iconographie : <a href="https://www.flaticon.com/fr/">Flaticon</a>'
    }).addTo(map);

    // Ajout des contrôles de zoom
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Ajout de l'échelle
    L.control.scale({
        position: 'bottomright',
        imperial: false
    }).addTo(map);

    // Ajout du périmètre (fond)
    if (typeof afond !== 'undefined') {
        const fondStyle = {
            weight: 2,
            opacity: 1,
            color: '#9f5cc0',
            fillColor: '#9f5cc0',
            fillOpacity: 0.2,
            interactive: false
        };

        L.geoJSON(afond, {
            style: fondStyle
        }).addTo(map);
    }
    
    // Initialisation de la couche du bassin de la Vesgre
    if (typeof json_COMMUNE_0 !== 'undefined') {
        bassinVesgreLayer = L.geoJSON(json_COMMUNE_0, {
            style: {
                fillColor: "#bdc05c",
                weight: 1,
                opacity: 0.5,
                color: "#bdc05c",
                fillOpacity: 0.5
            }
        });
    }
    // Initialisation de la couche du bassin de la Vaucouleurs
    if (typeof json_COMMUNE_1 !== 'undefined') {
        bassinVaucouleursLayer = L.geoJSON(json_COMMUNE_1, {
            style: {
                fillColor: "#306636",
                weight: 1,
                opacity: 0.5,
                color: "#306636",
                fillOpacity: 0.5
            }
        });
    }
    // Ajout des sentiers/rivières
    if (typeof rivieres_opth !== 'undefined') {
        const sentierStyle = {
            weight: 4,
            opacity: 1,
            color: '#3388ff',
            fillOpacity: 0
        };

        rivieresLayer = L.geoJSON(rivieres_opth, {
            style: sentierStyle,
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.nom) {
                    // Afficher dans le volet droit au lieu du popup
                    layer.on('click', function() {
                        // Vérifier s'il y a un événement lié à cette rivière ET si on est en mode filtrage calendrier
                        if (typeof events !== 'undefined' && selectedStart) {
                            const eventData = events.features.find(e => String(e.properties.poi_id) === String(feature.properties.ID));
                            if (eventData) {
                                openEventPanel(eventData);
                                return;
                            }
                        }
                        showPoiInSidePanel(feature.properties);
                    });
                }
            }
        });
        
        // Exposer la variable globalement pour le panneau latéral
        window.rivieresLayer = rivieresLayer;
    }

    // Chargement des points d'intérêt
    loadPOIs();
}

// Fonction pour charger les points d'intérêt
function loadPOIs() {
    if (typeof poi === 'undefined') {
        console.error("Les données POI ne sont pas disponibles");
        return;
    }

    // Utiliser la fonction optimisée pour créer les marqueurs
    createOptimizedMarkers();
    
    // Initialisation des filtres
    initFilters();
    
    // Mise à jour des marqueurs pour appliquer les filtres initiaux
    updateMarkers();
}

// Fonction pour créer une icône personnalisée
function createCustomIcon(category) {
    // Normalisation du nom de catégorie pour correspondre au nom de fichier
    const iconName = normalizeString(category);
    
    return L.icon({
        iconUrl: `image/${iconName}.png`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        popupAnchor: [15, 0]
    });
}

// Fonction normalizeString maintenant dans shared-functions.js

// Fonction pour mapper les catégories du jeu de données aux catégories de filtres
function mapToFilterCategory(category) {
    const categoryMap = {
        'Patrimoine Architectural': 'patrimoine_architectural',
        'Patrimoine Naturel': 'patrimoine_naturel',
        'Patrimoine Mémoriel': 'patrimoine_memoriel',
        'Autres Points': 'autres_points',
    };
    
    return categoryMap[category] || 'activites';
}

// Fonction pour mapper les sous-catégories du jeu de données aux sous-catégories de filtres
function mapToFilterSubcategory(subcategory) {
    const subcategoryMap = {
        'Châteaux, Manoirs...': 'patrimoine_bâti_monumental',
        'Patrimoine Religieux': 'patrimoine_religieux',
        'Bâti Traditionnel': 'bâti_traditionnel',
        'Etangs et Rivières': 'etangs_et_rivières',
        'Etangs': 'etangs_et_rivières',
        'Rivières': 'etangs_et_rivières',
        'Flore': 'flore',
        'Forêts et Parcs': 'forêts_et_parcs',
        'Rapace': 'rapace',
        'Heron': 'heron',
        'Effraie': 'effraie',
        'Chevêche': 'chevêche',
        'Chauve Souris': 'chauve_souris',
        'Cervidés': 'cervidés',
        'Hirondelle': 'hirondelle',
        'Personnages célèbres': 'personnages_célèbres',
        'Musées': 'musées',
        'Lieux de Mémoire': 'lieux_de_mémoire',
        'Curiosité': 'curiosité',
    };
    
    return subcategoryMap[subcategory] || subcategory.toLowerCase().replace(/ /g, '_');
}

// Initialisation des filtres
function initFilters() {
    // Initialiser les filtres par défaut
    categoryFilters = {
        'patrimoine_architectural': {
            'patrimoine_bâti_monumental': true,
            'patrimoine_religieux': true,
            'bâti_traditionnel': true
        },
        'patrimoine_naturel': {
            'etangs_et_rivières': false,
            'effraie': false,
            'chevêche': false,
            'flore': false,
            'rapace': false,
            'heron': false,
            'forêts_et_parcs': false,
            'chauve_souris': false,
            'cervidés': false,
            'hirondelle': false
        },
        'patrimoine_memoriel': {
            'personnages_célèbres': false,
            'musées': false,
            'lieux_de_mémoire': false
        },
        'autres_points': {
            'curiosité': false
        }
    };

    // Sélection de toutes les cases à cocher de filtre
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    
    // Vérifier si on vient de liste.html
    if (document.referrer.includes('liste.html')) {
        // Charger les filtres sauvegardés
        const savedFilters = sessionStorage.getItem('sharedFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                
                // Mettre à jour les cases à cocher et les filtres internes
                filterCheckboxes.forEach(checkbox => {
                    const category = checkbox.dataset.category;
                    const subcategory = checkbox.dataset.subcategory;
                    
                    // Vérifier si ce filtre est dans la liste sauvegardée
                    const isChecked = filters.some(f => f.category === category && f.subcategory === subcategory);
                    
                    // Mettre à jour la case à cocher
                    checkbox.checked = isChecked;
                    
                    // Mettre à jour les filtres internes
                    if (!categoryFilters[category]) {
                        categoryFilters[category] = {};
                    }
                    categoryFilters[category][subcategory] = isChecked;
                });
            } catch (e) {
                console.error("Erreur lors du chargement des filtres:", e);
            }
        }
    } else {
        // Utiliser les valeurs par défaut définies dans le HTML
        filterCheckboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            const subcategory = checkbox.dataset.subcategory;
            
            if (!categoryFilters[category]) {
                categoryFilters[category] = {};
            }
            
            categoryFilters[category][subcategory] = checkbox.checked;
        });
    }
    
    // Ajout des écouteurs d'événements pour les cases à cocher
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const category = this.dataset.category;
            const subcategory = this.dataset.subcategory;
            
            if (!categoryFilters[category]) {
                categoryFilters[category] = {};
            }
            
            categoryFilters[category][subcategory] = this.checked;
            
            updateMarkers();
        });
    });
    
    // Écouteurs pour les boutons "Tout sélectionner" et "Tout désélectionner"
    document.querySelector('.select-all').addEventListener('click', selectAllFilters);
    document.querySelector('.deselect-all').addEventListener('click', deselectAllFilters);
    
    // Écouteurs pour les titres de groupes de filtres (accordéon)
    document.querySelectorAll('.filter-title').forEach(title => {
        title.addEventListener('click', function() {
            this.classList.toggle('active');
            const options = this.nextElementSibling;
            options.style.display = options.style.display === 'none' ? 'block' : 'none';
        });
    });
    
    // Écouteur pour le bouton d'affichage/masquage des filtres (mobile)
    document.querySelector('.toggle-filters-btn').addEventListener('click', function() {
        document.querySelector('.filters-panel').classList.add('active');
    });
    
    // Écouteur pour le bouton de fermeture des filtres (mobile)
    document.querySelector('.close-filters').addEventListener('click', function() {
        document.querySelector('.filters-panel').classList.remove('active');
    });
    
    // Empêcher la fermeture du panneau quand on clique sur la carte
    document.addEventListener('click', function(e) {
        const filtersPanel = document.querySelector('.filters-panel');
        const toggleBtn = document.querySelector('.toggle-filters-btn');
        
        // Si on clique en dehors du panneau ET du bouton toggle
        if (!filtersPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
            // Ne fermer que sur mobile et seulement si le panneau est ouvert
            if (window.innerWidth <= 1024 && filtersPanel.classList.contains('active')) {
                // Vérifier si on clique sur la carte ou ses contrôles
                const mapContainer = document.getElementById('map-container');
                if (mapContainer.contains(e.target)) {
                    // Ne pas fermer automatiquement, laisser l'utilisateur contrôler
                    return;
                }
            }
        }
    });
    
    // Assurer que les filtres sont visibles par défaut sur desktop
    function adjustFiltersVisibility() {
        const filtersPanel = document.querySelector('.filters-panel');
        if (window.innerWidth > 1024) {
            filtersPanel.classList.add('active');
        } else {
            // Sur mobile, ne pas fermer automatiquement
            // filtersPanel.classList.remove('active');
        }
    }
    
    // Appliquer au chargement et au redimensionnement
    adjustFiltersVisibility();
    window.addEventListener('resize', adjustFiltersVisibility);
    
    // Sauvegarder les filtres lors du clic sur le lien vers liste.html
    const link = document.querySelector('a[href="liste.html"]');
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

// Mise à jour des marqueurs selon les filtres
function updateMarkers() {
    // Supprimer tous les marqueurs du cluster
    markers.clearLayers();
    
    // Supprimer aussi les marqueurs individuels (orchidées) qui pourraient être sur la carte
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && layer.poiData) {
            map.removeLayer(layer);
        }
    });
    
    // Supprimer les zones d'orchidées si elles sont affichées
    if (typeof removeOrchideeZones === 'function') {
        removeOrchideeZones();
    }
    
    // Sauvegarder les marqueurs actuels pour le calendrier
    if (typeof window.originalMarkers === 'undefined' || !window.originalMarkers) {
        window.originalMarkers = [];
    } else {
        window.originalMarkers = [];
    }
    
    // Parcourir toutes les catégories et sous-catégories
    for (const category in allMarkers) {
        for (const subcategory in allMarkers[category]) {
            // Vérifier si cette catégorie/sous-catégorie est activée
            if (categoryFilters[category] && categoryFilters[category][subcategory]) {
                // Ajouter tous les marqueurs de cette sous-catégorie
                allMarkers[category][subcategory].forEach(marker => {
                    markers.addLayer(marker);
                    window.originalMarkers.push(marker);
                });
            }
        }
    }
    
    // Gérer l'affichage des rivières
    if (rivieresLayer) {
        if (categoryFilters['patrimoine_naturel'] && categoryFilters['patrimoine_naturel']['etangs_et_rivières']) {
            if (!map.hasLayer(rivieresLayer)) {
                map.addLayer(rivieresLayer);
            }
        } else {
            if (map.hasLayer(rivieresLayer)) {
                map.removeLayer(rivieresLayer);
            }
        }
    }
}

// Sélectionner tous les filtres
function selectAllFilters() {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = true;
    });
    
    updateMarkers();
    
    // Mettre à jour le panneau latéral s'il est ouvert
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel && sidePanel.classList.contains('active')) {
        // Déclencher l'événement de mise à jour du panneau latéral
        const event = new CustomEvent('filtersChanged');
        document.dispatchEvent(event);
    }
}

// Désélectionner tous les filtres
function deselectAllFilters() {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = false;
    });
    
    updateMarkers();
    
    // Mettre à jour le panneau latéral s'il est ouvert
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel && sidePanel.classList.contains('active')) {
        // Déclencher l'événement de mise à jour du panneau latéral
        const event = new CustomEvent('filtersChanged');
        document.dispatchEvent(event);
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de la carte
    initMap();
});

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