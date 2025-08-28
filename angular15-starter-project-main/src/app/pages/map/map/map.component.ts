 import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy {
  map: maplibregl.Map | undefined;
  geoJsonUrl = 'assets/AFH_Location.geojson'; // URL de votre fichier GeoJSON

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }



  initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map', // ID du conteneur
      style: 'https://api.maptiler.com/maps/streets/style.json?key=wOw22jVN6ldQqKYiuOOF', // Style de la carte
      center: [10.190344788882612,36.846753585254845], // Centre initial [longitude, latitude]
      zoom: 15, // Niveau de zoom initial
      minZoom: 3, // Niveau de zoom minimum
      maxZoom: 20 // Niveau de zoom maximum
    });

    this.map.on('load', () => {
      // Charger l'image du marqueur
      this.map?.loadImage('assets/google-maps-svgrepo-com.png', (error, image) => {
        if (error || !image) {
          console.error('Error loading marker image:', error);
          return;
        }

        // Ajouter l'image au style de la carte
        this.map?.addImage('custom-marker', image);

        // Charger et filtrer les données GeoJSON
        fetch(this.geoJsonUrl)
          .then(response => response.json())
          .then(data => {
            // Filtrer les données pour exclure le texte en arabe
            const filteredData = {
              ...data,
              features: data.features.filter(feature => feature.properties.language === 'fr')
            };

            // Ajouter la source de données GeoJSON filtrée
            this.map?.addSource('my-data', {
              type: 'geojson',
              data: filteredData
            });

            // Ajouter une couche pour afficher les marqueurs
            this.map?.addLayer({
              id: 'my-data-markers',
              type: 'symbol', // Type de la couche pour les symboles (marqueurs)
              source: 'my-data',
              layout: {
                'icon-image': 'custom-marker', // Nom de l'icône ajoutée
                'icon-size': 0.2, // Taille de l'icône
                'icon-allow-overlap': true // Permet aux icônes de se superposer
              }
            });

            // Ajouter une couche pour les labels
            this.map?.addLayer({
              id: 'my-data-labels',
              type: 'symbol',
              source: 'my-data',
              layout: {
                'text-field': '{name}', // Nom du champ contenant le texte
                'text-size': 17, // Taille du texte
                'text-offset': [0, 2], // Décalage du texte par rapport au marqueur
                'text-anchor': 'top', // Position du texte au-dessus du marqueur
                'text-font': ['Noto Sans Arabic Regular', 'Arial Unicode MS'],
                'text-rotation-alignment': 'viewport' // Aligne la rotation du texte avec la vue
              },
              paint: {
                'text-color': '#000000' // Couleur du texte
              }
            });
          })
          .catch(error => console.error('Error loading GeoJSON data:', error));
      });
    });
  }

/*   adjustMapContainerSize(): void {
    const mapContainer = document.querySelector('.map-container') as HTMLElement;
    if (mapContainer) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Ajuster la taille de la carte en fonction de la fenêtre
      mapContainer.style.height = `${windowHeight * 0.56}px`; // 56% de la hauteur de la fenêtre
      mapContainer.style.width = `${windowWidth}px`; // 100% de la largeur de la fenêtre
    }
  } */
  
}
 