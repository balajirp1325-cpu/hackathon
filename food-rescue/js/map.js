// ========================================
// MAPPING FUNCTIONALITY
// ========================================

// Map functionality for FoodRescue platform
const MapService = {
  // Map instance
  map: null,

  // Current markers
  markers: [],

  // Current routes
  routes: [],

  // User location
  userLocation: null,

  // Initialize map
  init(containerId = 'map-container', options = {}) {
    // Default options
    const defaultOptions = {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 12,
      zoomControl: true,
      attributionControl: true
    };

    const mapOptions = { ...defaultOptions, ...options };

    // In a real implementation, you would use a mapping library like Leaflet or Google Maps
    // For this demo, we'll create a simple mock map interface

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Map container with id '${containerId}' not found`);
      return;
    }

    // Create mock map element
    this.createMockMap(container, mapOptions);

    // Get user location if available
    this.getUserLocation();

    console.log('Map initialized');
  },

  // Create mock map for demonstration
  createMockMap(container, options) {
    container.innerHTML = `
      <div class="mock-map" style="
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
      ">
        <div class="map-header" style="
          position: absolute;
          top: 10px;
          left: 10px;
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-size: 12px;
          color: #666;
        ">
          🗺️ Interactive Map (Demo)
        </div>

        <div class="map-controls" style="
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        ">
          <button class="map-control zoom-in" onclick="MapService.zoomIn()" style="
            background: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">+</button>
          <button class="map-control zoom-out" onclick="MapService.zoomOut()" style="
            background: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">−</button>
        </div>

        <div class="map-content" style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            text-align: center;
            color: #666;
            font-size: 14px;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <div>Map View</div>
            <div style="font-size: 12px; margin-top: 8px;">Zoom: ${options.zoom}x</div>
          </div>
        </div>

        <div class="map-markers" id="map-markers" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        "></div>
      </div>
    `;

    this.map = {
      container: container,
      options: options,
      zoom: options.zoom,
      center: options.center
    };
  },

  // Get user's current location
  async getUserLocation() {
    try {
      const position = await App.getCurrentLocation();
      this.userLocation = {
        lat: position.lat,
        lng: position.lng
      };

      // Add user location marker
      this.addMarker(this.userLocation.lat, this.userLocation.lng, {
        title: 'Your Location',
        icon: '👤',
        type: 'user'
      });

      // Center map on user location
      this.setCenter(this.userLocation.lat, this.userLocation.lng);

      console.log('User location obtained:', this.userLocation);
    } catch (error) {
      console.warn('Could not get user location:', error.message);
      // Show default location
      this.addMarker(40.7128, -74.0060, {
        title: 'Default Location',
        icon: '📍',
        type: 'default'
      });
    }
  },

  // Add marker to map
  addMarker(lat, lng, options = {}) {
    const markerId = App.generateId();
    const marker = {
      id: markerId,
      lat: lat,
      lng: lng,
      title: options.title || 'Marker',
      icon: options.icon || '📍',
      type: options.type || 'default',
      popup: options.popup || null
    };

    this.markers.push(marker);
    this.renderMarker(marker);

    return markerId;
  },

  // Render marker on mock map
  renderMarker(marker) {
    const markersContainer = document.getElementById('map-markers');
    if (!markersContainer) return;

    const markerElement = document.createElement('div');
    markerElement.className = `map-marker marker-${marker.type}`;
    markerElement.id = `marker-${marker.id}`;
    markerElement.style = `
      position: absolute;
      left: ${50 + (marker.lng - this.map.center[1]) * 100}px;
      top: ${50 + (marker.lat - this.map.center[0]) * -100}px;
      transform: translate(-50%, -100%);
      font-size: 24px;
      cursor: pointer;
      z-index: 1000;
    `;

    markerElement.innerHTML = marker.icon;
    markerElement.title = marker.title;

    // Add click handler
    markerElement.addEventListener('click', () => {
      this.showMarkerPopup(marker);
    });

    markersContainer.appendChild(markerElement);
  },

  // Show marker popup
  showMarkerPopup(marker) {
    // Remove existing popups
    document.querySelectorAll('.map-popup').forEach(popup => popup.remove());

    const markerElement = document.getElementById(`marker-${marker.id}`);
    if (!markerElement) return;

    const popup = document.createElement('div');
    popup.className = 'map-popup';
    popup.style = `
      position: absolute;
      left: ${markerElement.offsetLeft}px;
      top: ${markerElement.offsetTop - 80}px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px;
      min-width: 200px;
      z-index: 1001;
      pointer-events: auto;
    `;

    popup.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${marker.title}</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
        ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
      </div>
      ${marker.popup || '<div style="font-size: 12px;">Click for more info</div>'}
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
      ">×</button>
    `;

    document.getElementById('map-markers').appendChild(popup);
  },

  // Remove marker
  removeMarker(markerId) {
    this.markers = this.markers.filter(marker => marker.id !== markerId);

    const markerElement = document.getElementById(`marker-${markerId}`);
    if (markerElement) {
      markerElement.remove();
    }
  },

  // Clear all markers
  clearMarkers() {
    this.markers.forEach(marker => {
      const markerElement = document.getElementById(`marker-${marker.id}`);
      if (markerElement) {
        markerElement.remove();
      }
    });
    this.markers = [];
  },

  // Set map center
  setCenter(lat, lng) {
    this.map.center = [lat, lng];
    this.refreshMarkers();
  },

  // Zoom functions
  zoomIn() {
    this.map.zoom = Math.min(this.map.zoom + 1, 20);
    this.updateZoomDisplay();
  },

  zoomOut() {
    this.map.zoom = Math.max(this.map.zoom - 1, 1);
    this.updateZoomDisplay();
  },

  updateZoomDisplay() {
    const zoomDisplay = this.map.container.querySelector('.map-content div:last-child');
    if (zoomDisplay) {
      zoomDisplay.textContent = `Zoom: ${this.map.zoom}x`;
    }
    this.refreshMarkers();
  },

  // Refresh marker positions after map changes
  refreshMarkers() {
    this.markers.forEach(marker => {
      const markerElement = document.getElementById(`marker-${marker.id}`);
      if (markerElement) {
        markerElement.style.left = `${50 + (marker.lng - this.map.center[1]) * 100}px`;
        markerElement.style.top = `${50 + (marker.lat - this.map.center[0]) * -100}px`;
      }
    });
  },

  // Calculate route between two points
  async calculateRoute(startLat, startLng, endLat, endLng, options = {}) {
    // In a real implementation, this would call a routing service
    // For demo purposes, we'll simulate a route

    const route = {
      id: App.generateId(),
      start: { lat: startLat, lng: startLng },
      end: { lat: endLat, lng: endLng },
      waypoints: this.generateWaypoints(startLat, startLng, endLat, endLng),
      distance: this.calculateDistance(startLat, startLng, endLat, endLng),
      duration: this.estimateDuration(this.calculateDistance(startLat, startLng, endLat, endLng)),
      instructions: this.generateInstructions(startLat, startLng, endLat, endLng)
    };

    this.routes.push(route);
    this.renderRoute(route);

    return route;
  },

  // Generate waypoints for route (simplified)
  generateWaypoints(startLat, startLng, endLat, endLng) {
    const waypoints = [];
    const steps = 5;

    for (let i = 1; i < steps; i++) {
      const ratio = i / steps;
      const lat = startLat + (endLat - startLat) * ratio;
      const lng = startLng + (endLng - startLng) * ratio;

      // Add some randomness to make it look more realistic
      const randomLat = lat + (Math.random() - 0.5) * 0.01;
      const randomLng = lng + (Math.random() - 0.5) * 0.01;

      waypoints.push({
        lat: randomLat,
        lng: randomLng,
        instruction: `Continue on route (${i}/${steps - 1})`
      });
    }

    return waypoints;
  },

  // Calculate distance between points
  calculateDistance(lat1, lng1, lat2, lng2) {
    return App.calculateDistance(lat1, lng1, lat2, lng2);
  },

  // Estimate travel duration
  estimateDuration(distanceKm) {
    // Assume average speed of 30 km/h in city
    const speedKmh = 30;
    const hours = distanceKm / speedKmh;
    return Math.round(hours * 60); // Return minutes
  },

  // Generate turn-by-turn instructions
  generateInstructions(startLat, startLng, endLat, endLng) {
    return [
      'Head north on Main Street',
      'Turn right onto Oak Avenue',
      'Continue straight for 2 km',
      'Turn left onto Pine Street',
      'Your destination will be on the right'
    ];
  },

  // Render route on map
  renderRoute(route) {
    const markersContainer = document.getElementById('map-markers');
    if (!markersContainer) return;

    // Create route line
    const routeElement = document.createElement('svg');
    routeElement.className = 'map-route';
    routeElement.style = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    `;

    // Create path from waypoints
    const points = [route.start, ...route.waypoints, route.end];
    const pathData = points.map(point => {
      const x = 50 + (point.lng - this.map.center[1]) * 100;
      const y = 50 + (point.lat - this.map.center[0]) * -100;
      return `${x},${y}`;
    }).join(' ');

    routeElement.innerHTML = `
      <polyline
        points="${pathData}"
        stroke="#007bff"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `;

    markersContainer.appendChild(routeElement);
  },

  // Clear routes
  clearRoutes() {
    document.querySelectorAll('.map-route').forEach(route => route.remove());
    this.routes = [];
  },

  // Search for places
  async searchPlaces(query, options = {}) {
    // In a real implementation, this would call a geocoding service
    // For demo, return mock results

    const mockResults = [
      {
        name: 'Riverside Bakery',
        address: '123 Main St, Downtown',
        lat: 40.7128,
        lng: -74.0060,
        type: 'bakery'
      },
      {
        name: 'Green Valley Restaurant',
        address: '789 Pine St, Midtown',
        lat: 40.7228,
        lng: -74.0160,
        type: 'restaurant'
      },
      {
        name: 'Community Center',
        address: '456 Oak Ave, Downtown',
        lat: 40.7028,
        lng: -73.9960,
        type: 'community'
      }
    ];

    // Filter by query
    const filtered = mockResults.filter(place =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase())
    );

    return filtered;
  },

  // Add search results to map
  showSearchResults(results) {
    this.clearMarkers();

    results.forEach(result => {
      this.addMarker(result.lat, result.lng, {
        title: result.name,
        icon: this.getPlaceIcon(result.type),
        type: result.type,
        popup: `<div>${result.address}</div>`
      });
    });

    // Fit bounds to show all results
    if (results.length > 0) {
      this.fitBounds(results);
    }
  },

  // Get icon for place type
  getPlaceIcon(type) {
    const icons = {
      bakery: '🥖',
      restaurant: '🍽️',
      community: '🏢',
      supermarket: '🏪',
      default: '📍'
    };

    return icons[type] || icons.default;
  },

  // Fit map bounds to show all markers
  fitBounds(points) {
    if (points.length === 0) return;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    this.setCenter(centerLat, centerLng);
  },

  // Get directions between two points
  async getDirections(start, end, profile = 'driving') {
    const route = await this.calculateRoute(
      start.lat, start.lng,
      end.lat, end.lng
    );

    return {
      route: route,
      instructions: route.instructions,
      distance: App.formatDistance(route.distance * 1000),
      duration: this.formatDuration(route.duration)
    };
  },

  // Format duration in minutes to readable string
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  },

  // Geocode address to coordinates
  async geocodeAddress(address) {
    // In a real implementation, this would call a geocoding service
    // For demo, return mock coordinates

    const mockLocations = {
      '123 Main St': { lat: 40.7128, lng: -74.0060 },
      '789 Pine St': { lat: 40.7228, lng: -74.0160 },
      '456 Oak Ave': { lat: 40.7028, lng: -73.9960 }
    };

    // Simple mock geocoding
    for (const [addr, coords] of Object.entries(mockLocations)) {
      if (address.includes(addr.split(' ')[1])) {
        return coords;
      }
    }

    // Return default location
    return { lat: 40.7128, lng: -74.0060 };
  },

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    // In a real implementation, this would call a reverse geocoding service
    // For demo, return mock address

    return `${lat.toFixed(4)}, ${lng.toFixed(4)} (Mock Address)`;
  },

  // Export map data
  exportMapData() {
    const data = {
      markers: this.markers,
      routes: this.routes,
      center: this.map.center,
      zoom: this.map.zoom,
      userLocation: this.userLocation
    };

    App.downloadFile(JSON.stringify(data, null, 2), 'map-data.json', 'application/json');
  }
};

// Initialize map service when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Auto-initialize if map container exists
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    MapService.init();
  }
});

// Export for global use
window.MapService = MapService;