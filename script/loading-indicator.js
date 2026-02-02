// Script pour afficher un indicateur de chargement

document.addEventListener('DOMContentLoaded', function() {
    // Créer l'élément de l'indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Chargement de la carte...</div>
    `;
    document.body.appendChild(loadingIndicator);
    
    // Ajouter les styles pour l'indicateur
    const style = document.createElement('style');
    style.textContent = `
        #loading-indicator {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            transition: opacity 0.5s ease;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #9f5cc0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        .loading-text {
            font-family: 'Raleway', sans-serif;
            font-size: 18px;
            color: #333;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Masquer l'indicateur une fois que la carte est chargée
    function hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.remove();
            }, 500);
        }
    }
    
    // Vérifier si la carte est chargée
    if (typeof map !== 'undefined') {
        map.on('load', hideLoadingIndicator);
    }
    
    // Fallback au cas où l'événement de chargement de la carte ne se déclenche pas
    setTimeout(hideLoadingIndicator, 5000);
});