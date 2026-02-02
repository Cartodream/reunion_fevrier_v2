// CALENDRIER ULTRA-SIMPLE
let currentDate = new Date();
let selectedStart = null;
let selectedEnd = null;

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function prevMonthSide() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonthSide() {
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
    
    const monthYearEl = document.getElementById('month-year');
    const monthYearSideEl = document.getElementById('month-year-side');
    
    if (monthYearEl) {
        monthYearEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (monthYearSideEl) {
        monthYearSideEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    
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
    if (!selectedStart) {
        selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        selectedEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else if (selectedStart && selectedEnd && selectedStart.getTime() === selectedEnd.getTime()) {
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (newDate.getTime() === selectedStart.getTime()) {
            // Même date
        } else {
            selectedEnd = newDate;
            if (selectedEnd < selectedStart) {
                [selectedStart, selectedEnd] = [selectedEnd, selectedStart];
            }
        }
    } else {
        selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        selectedEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    
    updateCalendar();
}

function searchEvents() {
    if (!selectedStart) {
        showPopup('Aucune période sélectionnée', 'Veuillez sélectionner une période avant de rechercher.');
        return;
    }
    
    const startStr = selectedStart.getFullYear() + '-' + 
                    String(selectedStart.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(selectedStart.getDate()).padStart(2, '0');
    const endStr = selectedEnd.getFullYear() + '-' + 
                  String(selectedEnd.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(selectedEnd.getDate()).padStart(2, '0');
    
    // Trouver événements
    const filteredPOIs = [];
    events.features.forEach(event => {
        const eventStart = new Date(event.properties.debut);
        const eventEnd = new Date(event.properties.fin);
        const filterStart = new Date(startStr);
        const filterEnd = new Date(endStr);
        
        if (eventStart <= filterEnd && eventEnd >= filterStart) {
            filteredPOIs.push(String(event.properties.poi_id));
        }
    });
    
    // Vider carte
    markers.clearLayers();
    if (rivieresLayer && map.hasLayer(rivieresLayer)) {
        map.removeLayer(rivieresLayer);
    }
    
    // Vérifier filtre
    const applyFilterMain = document.getElementById('apply-filter-main');
    const applyFilterSide = document.getElementById('apply-filter-side');
    const shouldApplyFilter = (applyFilterMain && applyFilterMain.checked) || (applyFilterSide && applyFilterSide.checked);
    
    if (shouldApplyFilter) {
        // Avec filtre - lire cases cochées
        const checkedCategories = [];
        document.querySelectorAll('input[type="checkbox"][data-category]:checked').forEach(checkbox => {
            checkedCategories.push({
                category: checkbox.dataset.category,
                subcategory: checkbox.dataset.subcategory
            });
        });
        
        // POI
        for (const category in allMarkers) {
            for (const subcategory in allMarkers[category]) {
                const isChecked = checkedCategories.some(cat => 
                    cat.category === category && cat.subcategory === subcategory
                );
                if (isChecked) {
                    allMarkers[category][subcategory].forEach(function(layer) {
                        if (layer.poiData && layer.poiData.id) {
                            const poiId = String(layer.poiData.id);
                            if (filteredPOIs.includes(poiId)) {
                                markers.addLayer(layer);
                            }
                        }
                    });
                }
            }
        }
        
        // Rivières
        const riverChecked = checkedCategories.some(cat => 
            cat.category === 'patrimoine_naturel' && cat.subcategory === 'etangs_et_rivières'
        );
        if (riverChecked && rivieresLayer) {
            rivieresLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties && layer.feature.properties.ID) {
                    const rivId = String(layer.feature.properties.ID);
                    if (filteredPOIs.includes(rivId)) {
                        const riverMarker = L.geoJSON(layer.feature, {
                            style: { weight: 4, opacity: 1, color: 'blue', fillOpacity: 0 },
                            onEachFeature: function(feature, newLayer) {
                                newLayer.on('click', function() {
                                    if (typeof events !== 'undefined') {
                                        const eventData = events.features.find(e => String(e.properties.poi_id) === String(feature.properties.ID));
                                        if (eventData) {
                                            openEventPanel(eventData);
                                            return;
                                        }
                                    }
                                    showPoiInSidePanel(feature.properties);
                                });
                            }
                        });
                        markers.addLayer(riverMarker);
                    }
                }
            });
        }
    } else {
        // Sans filtre - tous les événements
        for (const category in allMarkers) {
            for (const subcategory in allMarkers[category]) {
                allMarkers[category][subcategory].forEach(function(layer) {
                    if (layer.poiData && layer.poiData.id) {
                        const poiId = String(layer.poiData.id);
                        if (filteredPOIs.includes(poiId)) {
                            markers.addLayer(layer);
                        }
                    }
                });
            }
        }
        
        if (rivieresLayer) {
            rivieresLayer.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties && layer.feature.properties.ID) {
                    const rivId = String(layer.feature.properties.ID);
                    if (filteredPOIs.includes(rivId)) {
                        const riverMarker = L.geoJSON(layer.feature, {
                            style: { weight: 4, opacity: 1, color: 'blue', fillOpacity: 0 },
                            onEachFeature: function(feature, newLayer) {
                                newLayer.on('click', function() {
                                    if (typeof events !== 'undefined') {
                                        const eventData = events.features.find(e => String(e.properties.poi_id) === String(feature.properties.ID));
                                        if (eventData) {
                                            openEventPanel(eventData);
                                            return;
                                        }
                                    }
                                    showPoiInSidePanel(feature.properties);
                                });
                            }
                        });
                        markers.addLayer(riverMarker);
                    }
                }
            });
        }
    }
    
    const explorerPanel = document.getElementById('explorer-panel');
    if (explorerPanel && explorerPanel.classList.contains('active')) {
        explorerPanel.classList.remove('active');
    }
}

function clearEvents() {
    selectedStart = null;
    selectedEnd = null;
    
    if (typeof updateMarkers === 'function') {
        updateMarkers();
    }
    
    updateCalendar();
}

document.addEventListener('DOMContentLoaded', function() {
    updateCalendar();
});

function showPopup(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    overlay.innerHTML = `
        <div class="popup">
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="closePopup()">OK</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function closePopup() {
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}