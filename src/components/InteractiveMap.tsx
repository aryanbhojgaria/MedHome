import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DbHospital } from '../lib/db';

interface InteractiveMapProps {
  facilities: DbHospital[];
  selectedFacility: DbHospital | null;
  onSelectFacility: (facility: DbHospital) => void;
  userLocation: [number, number] | null;
  onBookClick: () => void;
}

export default function InteractiveMap({
  facilities,
  selectedFacility,
  onSelectFacility,
  userLocation,
  onBookClick,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Custom icon creator
  const createHospitalIcon = (type: string, isSelected: boolean, isEmergency: boolean) => {
    const color = isEmergency ? '#ef4444' : (type === 'Hospital' ? '#3b82f6' : '#10b981');
    const size = isSelected ? 'w-8 h-8' : 'w-6 h-6';
    const border = isSelected ? 'border-brand-teal ring-2 ring-brand-teal ring-offset-1 dark:ring-offset-slate-950' : 'border-white';
    const html = `
      <div class="relative ${size} flex items-center justify-center">
        ${isEmergency ? '<div class="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping"></div>' : ''}
        <div class="w-full h-full rounded-full border-2 ${border} shadow-lg flex items-center justify-center" style="background-color: ${color}">
          <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
          </svg>
        </div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'custom-hospital-marker-icon',
      iconSize: isSelected ? [32, 32] : [24, 24],
      iconAnchor: isSelected ? [16, 16] : [12, 12],
      popupAnchor: [0, -14]
    });
  };

  // 1. Initialize map on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Listen to pan/zoom to update markers (pruning offscreen markers)
    map.on('moveend', () => {
      drawMarkers();
    });

    // Invalidate size after layout completes to ensure correct bounds calculation
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // 2. Draw markers (optimized with bounds check viewport pruning)
  const drawMarkers = () => {
    if (!mapRef.current || !markersGroupRef.current) return;

    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    const bounds = map.getBounds();

    markersGroup.clearLayers();

    console.log('InteractiveMap: drawMarkers called. Total facilities:', facilities.length);
    console.log('InteractiveMap: Current Map Bounds:', bounds.toString());

    // Filter to only draw visible items to prevent thousands of DOM nodes from lagging
    const visibleFacilities = facilities.filter(f => {
      if (!f.latitude || !f.longitude) return false;
      try {
        const isContained = bounds.contains(L.latLng(f.latitude, f.longitude));
        return isContained;
      } catch (err) {
        return false;
      }
    });

    console.log('InteractiveMap: Visible facilities within bounds:', visibleFacilities.length);

    // Limit absolute max concurrent markers to 300 to protect rendering budget
    const markersToRender = visibleFacilities.slice(0, 300);
    console.log('InteractiveMap: Rendering markers count:', markersToRender.length);

    markersToRender.forEach(f => {
      const isSelected = selectedFacility?.id === f.id;
      const marker = L.marker([f.latitude!, f.longitude!], {
        icon: createHospitalIcon(f.type, isSelected, f.emergencyBeds > 0)
      });

      // HTML template matching dashboard glassmorphism aesthetic
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 font-sans min-w-[210px] text-slate-800 dark:text-slate-200';
      popupContent.innerHTML = `
        <div class="space-y-1.5 text-left">
          <h4 class="text-xs font-bold text-slate-900 leading-snug">${f.name}</h4>
          <p class="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            ${f.address}
          </p>
          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">${f.district}, ${f.state}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] font-extrabold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">★ ${f.rating}</span>
            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              f.emergencyBeds > 0 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-450'
            }">
              ${f.emergencyBeds > 0 ? `ICU beds: ${f.emergencyBeds}` : 'General Care'}
            </span>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button id="map-pop-det-${f.id}" class="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase transition-colors cursor-pointer text-center">
              View Info
            </button>
            <button id="map-pop-book-${f.id}" class="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase transition-colors cursor-pointer text-center">
              Book
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const detailsBtn = document.getElementById(`map-pop-det-${f.id}`);
        const bookBtn = document.getElementById(`map-pop-book-${f.id}`);

        if (detailsBtn) {
          detailsBtn.onclick = () => {
            onSelectFacility(f);
          };
        }
        if (bookBtn) {
          bookBtn.onclick = () => {
            onBookClick();
          };
        }
      });

      marker.on('click', () => {
        onSelectFacility(f);
      });

      markersGroup.addLayer(marker);
    });
  };

  // 3. Trigger redraw on facilities change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
    drawMarkers();
  }, [facilities, selectedFacility]);

  // 4. Center map on selected facility when it changes
  useEffect(() => {
    if (selectedFacility && selectedFacility.latitude && selectedFacility.longitude && mapRef.current) {
      mapRef.current.setView([selectedFacility.latitude, selectedFacility.longitude], 14);
    }
  }, [selectedFacility]);

  // 5. Fit map bounds to encompass visible search results
  useEffect(() => {
    if (mapRef.current && facilities.length > 0) {
      const validPoints = facilities.filter(f => f.latitude && f.longitude);
      if (validPoints.length > 0) {
        const latLngs = validPoints.map(f => [f.latitude!, f.longitude!] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [facilities]);

  // 6. Draw / update User Location Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation) {
      const icon = L.divIcon({
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
              <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
          </div>
        `,
        className: 'user-gps-location-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        userMarkerRef.current = L.marker(userLocation, { icon })
          .bindPopup('<div class="p-1 text-center font-bold text-xs text-slate-800">Your Current Position</div>')
          .addTo(mapRef.current);
      }

      // Pan to user location initially
      mapRef.current.setView(userLocation, 12);
    } else {
      if (userMarkerRef.current && mapRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }
  }, [userLocation]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border dark:border-slate-800 border-slate-200 shadow-lg">
      <div ref={containerRef} className="w-full h-full min-h-[400px] md:min-h-[500px]" style={{ zIndex: 1 }} />
      
      {/* Custom Styles Injection */}
      <style>{`
        .leaflet-container {
          background-color: #030712 !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(8px);
          border-radius: 16px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: none !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: rgba(15, 23, 42, 0.9) !important;
          color: #94a3b8 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.2s;
        }
        .leaflet-bar a:hover {
          background-color: #1e293b !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
