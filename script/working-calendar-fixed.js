// CALENDRIER ULTRA-SIMPLE
let currentDate = new Date();
let selectedStart = null;
let selectedEnd = null;

function prevMonth() {
    console.log('Mois précédent');
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    console.log('Mois suivant');
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

// Fonctions pour le calendrier latéral
function prevMonthSide() {
    console.log('Mois précédent - latéral');
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonthSide() {
    console.log('Mois suivant - latéral');
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function searchEventsSide() {
    searchEvents();
}

function clearEventsSide() {
    clearEvents();
}

function updateCalendar() {
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    // Mettre à jour les deux calendriers
    const monthYearEl = document.getElementById('month-year');
    const monthYearSideEl = document.getElementById('month-year-side');
    
    if (monthYearEl) {
        monthYearEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (monthYearSideEl) {
        monthYearSideEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    
    // Mettre à jour les deux conteneurs de jours
    const daysContainer = document.getElementById('calendar-days');
    const daysContainerSide = document.getElementById('calendar-days-side');
    
    [daysContainer, daysContainerSide].forEach(container => {
        if (!container) return;
        
        container.innerHTML = '';
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = date.getDate();
            dayEl.onclick = function() {
                selectDate(date);
            };
            
            if (date.getMonth() !== currentDate.getMonth()) {
                dayEl.style.color = '#999';
            }
            
            if (selectedStart && date.toDateString() === selectedStart.toDateString()) {
                dayEl.style.background = '#500878';
                dayEl.style.color = 'white';
            }
            
            if (selectedEnd && date.toDateString() === selectedEnd.toDateString()) {
                dayEl.style.background = '#500878';
                dayEl.style.color = 'white';
            }
            
            if (selectedStart && selectedEnd && date > selectedStart && date < selectedEnd) {
                dayEl.style.background = '#9f5cc0';
                dayEl.style.color = 'white';
            }
            
            container.appendChild(dayEl);
        }
    });
}

function selectDate(date) {
    console.log('Date sélectionnée:', date);
    
    if (!selectedStart) {
        // Premier clic - un seul jour
        selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        selectedEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        console.log('Premier jour sélectionné:', selectedStart);
    } else if (selectedStart && selectedEnd && selectedStart.getTime() === selectedEnd.getTime()) {
        // Deuxième clic après un seul jour - créer une période
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (newDate.getTime() === selectedStart.getTime()) {
            // Même date cliquée - garder un seul jour
            console.log('Même jour recliqué');
        } else {
            // Date différente - créer une période
            selectedEnd = newDate;
            if (selectedEnd < selectedStart) {
                [selectedStart, selectedEnd] = [selectedEnd, selectedStart];
            }
            console.log('Période créée:', selectedStart, 'à', selectedEnd);
        }
    } else {
        // Troisième clic ou plus - recommencer
        selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        selectedEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        console.log('Nouvelle sélection:', selectedStart);
    }
    
    updateCalendar();
}

function searchEvents() {
    if (selectedStart) { // Plus besoin de vérifier selectedEnd
        // Formatage manuel pour éviter les problèmes de timezone
        const startStr = selectedStart.getFullYear() + '-' + 
                        String(selectedStart.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(selectedStart.getDate()).padStart(2, '0');
        const endStr = selectedEnd.getFullYear() + '-' + 
                      String(selectedEnd.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(selectedEnd.getDate()).padStart(2, '0');
        
        console.log('Recherche événements du', startStr, 'au', endStr);
        
        // Vérifier si le filtre doit être appliqué
        const applyFilterMain = document.getElementById('apply-filter-main');
        const applyFilterSide = document.getElementById('apply-filter-side');
        const shouldApplyFilter = (applyFilterMain && applyFilterMain.checked) || (applyFilterSide && applyFilterSide.checked);
        
        // FILTRAGE RÉEL DES MARQUEURS
        if (typeof events !== 'undefined' && typeof markers !== 'undefined') {
            const filteredPOIs = [];
            
            events.features.forEach(event => {
                const eventStart = new Date(event.properties.debut);
                const eventEnd = new Date(event.properties.fin);
                const filterStart = new Date(startStr);
                const filterEnd = new Date(endStr);
                
                if (eventStart <= filterEnd && eventEnd >= filterStart) {
                    filteredPOIs.push(String(event.properties.poi_id));
                    console.log('Événement trouvé:', event.properties.description_event);
                }
            });
            
            console.log('POI avec événements:', filteredPOIs);
            
            // Sauvegarder les marqueurs actuels si pas déjà fait
            if (typeof originalMarkers === 'undefined' || !originalMarkers) {
                window.originalMarkers = [];
                markers.eachLayer(function(layer) {
                    window.originalMarkers.push(layer);
                });
                console.log('Marqueurs actuels sauvegardés:', window.originalMarkers.length);
            }
            
            // Effacer tous les marqueurs
            markers.clearLayers();
            
            // Masquer les rivières lors du filtrage par événements
            if (rivieresLayer && map.hasLayer(rivieresLayer)) {
                map.removeLayer(rivieresLayer);
            }
            
            let addedCount = 0;
            
            if (shouldApplyFilter) {
                // Appliquer le filtre : croiser événements ET catégories cochées
                const checkedCategories = [];
                document.querySelectorAll('input[type="checkbox"][data-category]:checked').forEach(checkbox => {
                    checkedCategories.push({
                        category: checkbox.dataset.category,
                        subcategory: checkbox.dataset.subcategory
                    });
                });
                
                window.originalMarkers.forEach(function(layer) {
                    if (layer.poiData && layer.poiData.id) {
                        const poiId = String(layer.poiData.id);
                        const hasEvent = filteredPOIs.includes(poiId);
                        
                        // Vérifier si le POI correspond aux catégories cochées
                        const matchesCategory = checkedCategories.some(cat => 
                            layer.poiData.categorie === cat.category && 
                            layer.poiData.sous_cat === cat.subcategory
                        );
                        
                        if (hasEvent && matchesCategory) {
                            layer.hasEvents = true;
                            
                            layer.off('click');
                            layer.on('click', function() {
                                const eventData = events.features.find(e => String(e.properties.poi_id) === poiId);
                                if (eventData) {
                                    openEventPanel(eventData);
                                }
                            });
                            
                            markers.addLayer(layer);
                            addedCount++;
                        }
                    }
                });
                
                // Vérifier aussi dans les rivières si elles sont cochées
                if (rivieresLayer && checkedCategories.some(cat => cat.category === 'patrimoine_naturel' && cat.subcategory === 'etangs_et_rivières')) {
                    rivieresLayer.eachLayer(function(layer) {
                        if (layer.feature && layer.feature.properties && layer.feature.properties.ID) {
                            const rivId = String(layer.feature.properties.ID);
                            if (filteredPOIs.includes(rivId)) {
                                const riverMarker = L.geoJSON(layer.feature, {
                                    style: {
                                        weight: 4,
                                        opacity: 1,
                                        color: 'blue',
                                        fillOpacity: 0
                                    }
                                });
                                
                                riverMarker.on('click', function() {
                                    const eventData = events.features.find(e => String(e.properties.poi_id) === rivId);
                                    if (eventData) {
                                        openEventPanel(eventData);
                                    }
                                });
                                
                                markers.addLayer(riverMarker);
                                addedCount++;
                            }
                        }
                    });
                }
            } else {
                // Sans filtre : rechercher dans TOUS les marqueurs
                if (typeof allMarkers !== 'undefined') {
                    for (const category in allMarkers) {
                        for (const subcategory in allMarkers[category]) {
                            allMarkers[category][subcategory].forEach(function(layer) {
                                if (layer.poiData && layer.poiData.id) {
                                    const poiId = String(layer.poiData.id);
                                    if (filteredPOIs.includes(poiId)) {
                                        layer.hasEvents = true;
                                        
                                        layer.off('click');
                                        layer.on('click', function() {
                                            const eventData = events.features.find(e => String(e.properties.poi_id) === poiId);
                                            if (eventData) {
                                                openEventPanel(eventData);
                                            }
                                        });
                                        
                                        markers.addLayer(layer);
                                        addedCount++;
                                    }
                                }
                            });
                        }
                    }
                }
                
                // Vérifier aussi dans les rivières
                if (rivieresLayer) {
                    rivieresLayer.eachLayer(function(layer) {
                        if (layer.feature && layer.feature.properties && layer.feature.properties.ID) {
                            const rivId = String(layer.feature.properties.ID);
                            if (filteredPOIs.includes(rivId)) {
                                const riverMarker = L.geoJSON(layer.feature, {
                                    style: {
                                        weight: 4,
                                        opacity: 1,
                                        color: 'blue',
                                        fillOpacity: 0
                                    }
                                });
                                
                                riverMarker.on('click', function() {
                                    const eventData = events.features.find(e => String(e.properties.poi_id) === rivId);
                                    if (eventData) {
                                        openEventPanel(eventData);
                                    }
                                });
                                
                                markers.addLayer(riverMarker);
                                addedCount++;
                            }
                        }
                    });
                }
            }
            
            console.log('Marqueurs ajoutés:', addedCount);
            console.log('Événements trouvés:', filteredPOIs.length);
        }
        
        // Fermer le panneau Explorer après la recherche
        const explorerPanel = document.getElementById('explorer-panel');
        if (explorerPanel && explorerPanel.classList.contains('active')) {
            explorerPanel.classList.remove('active');
        }
    }
}

function clearEvents() {
    selectedStart = null;
    selectedEnd = null;
    
    // Supprimer la marque hasEvents de tous les marqueurs
    if (typeof window.originalMarkers !== 'undefined' && window.originalMarkers) {
        window.originalMarkers.forEach(function(layer) {
            delete layer.hasEvents;
            // Restaurer les événements de clic originaux
            layer.off('click');
        });
    }
    
    // Appliquer les filtres de catégories actuels au lieu de restaurer tous les marqueurs
    if (typeof updateMarkers === 'function') {
        updateMarkers();
        console.log('Filtres de catégories réappliqués après effacement du filtre événements');
    } else {
        console.error('Fonction updateMarkers non disponible');
    }
    
    updateCalendar();
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updateCalendar();
});

// Fonction pour ouvrir le volet Event
function openEventPanel(eventData) {
    const eventPanel = document.getElementById('event-panel');
    if (!eventPanel) return;
    
    // Remplir les informations de l'événement
    const eventTitle = document.getElementById('event-title');
    const eventDates = document.getElementById('event-dates');
    const eventDescription = document.getElementById('event-description');
    const eventImage = document.getElementById('event-image');
    
    if (eventTitle) eventTitle.textContent = eventData.properties.description_event || 'Événement';
    
    if (eventDates) {
        const debut = new Date(eventData.properties.debut).toLocaleDateString('fr-FR');
        const fin = new Date(eventData.properties.fin).toLocaleDateString('fr-FR');
        eventDates.textContent = debut === fin ? debut : `Du ${debut} au ${fin}`;
    }
    
    if (eventDescription) eventDescription.textContent = eventData.properties.description_event || '';
    
    if (eventImage && eventData.properties.image) {
        eventImage.src = eventData.properties.image;
        eventImage.style.display = 'block';
    } else if (eventImage) {
        eventImage.style.display = 'none';
    }
    
    // Ouvrir le volet
    eventPanel.classList.add('active');
}

// Fonction pour fermer le volet Event
function closeEventPanel() {
    const eventPanel = document.getElementById('event-panel');
    if (eventPanel) {
        eventPanel.classList.remove('active');
    }
}