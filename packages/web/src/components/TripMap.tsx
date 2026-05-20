// ============================================================
// TripMap — Interactive Google Map for golf trip routes
// Falls back to SVG Missouri outline in Demo Mode
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────

interface RouteWaypoint {
  order: number;
  type: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  arrivalTime?: string;
  departureTime?: string;
  teeTime?: string;
  urgency: string;
}

interface RouteLeg {
  order: number;
  startName: string;
  endName: string;
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  distanceMiles: number;
  durationMinutes: number;
  urgency: string;
}

interface PlaceOfInterest {
  placeId: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
  type: string;
  rating?: number;
}

interface TripMapProps {
  waypoints: RouteWaypoint[];
  legs: RouteLeg[];
  pois?: PlaceOfInterest[];
  overviewPolyline?: string;
  bounds?: {
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  };
  onWaypointClick?: (waypoint: RouteWaypoint) => void;
  onPoiClick?: (poi: PlaceOfInterest) => void;
  className?: string;
}

// ── Dark Map Style ──────────────────────────────────────────

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a3a1a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3a1a' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e3356' }] },
];

// ── Urgency Colors ──────────────────────────────────────────

const URGENCY_COLORS: Record<string, string> = {
  RELAXED: '#22c55e',
  COMFORTABLE: '#22c55e',
  TIGHT: '#f59e0b',
  CRITICAL: '#ef4444',
};

// ── Google Maps Loader ──────────────────────────────────────

let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve();
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      mapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

// ── Component ───────────────────────────────────────────────

export function TripMap({
  waypoints,
  legs,
  pois = [],
  overviewPolyline: _overviewPolyline,
  bounds,
  onWaypointClick,
  onPoiClick,
  className = '',
}: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const demoMode = !apiKey;

  // Load Google Maps
  useEffect(() => {
    if (demoMode) return;

    loadGoogleMaps(apiKey)
      .then(() => setIsLoaded(true))
      .catch(() => setLoadError(true));
  }, [apiKey, demoMode]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || demoMode) return;

    const google = (window as any).google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 37.9, lng: -92.5 }, // Missouri center
      zoom: 7,
      styles: DARK_MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [isLoaded, demoMode]);

  // Update markers and polylines
  useEffect(() => {
    if (!mapInstanceRef.current || demoMode) return;

    const google = (window as any).google;
    const map = mapInstanceRef.current;

    // Clear existing
    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];

    // Add waypoint markers
    waypoints.forEach(wp => {
      const icon = getMarkerIcon(wp.type, wp.urgency);
      const marker = new google.maps.Marker({
        position: { lat: wp.location.latitude, lng: wp.location.longitude },
        map,
        title: wp.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: wp.type === 'COURSE' ? 12 : 10,
          fillColor: icon.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: icon.label,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        zIndex: wp.type === 'COURSE' ? 10 : 5,
      });

      marker.addListener('click', () => {
        const content = buildInfoWindowContent(wp);
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(map, marker);
        onWaypointClick?.(wp);
      });

      markersRef.current.push(marker);
    });

    // Add POI markers
    pois.forEach(poi => {
      const marker = new google.maps.Marker({
        position: { lat: poi.location.latitude, lng: poi.location.longitude },
        map,
        title: poi.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#f97316',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 1,
        },
        zIndex: 3,
      });

      marker.addListener('click', () => {
        const content = `
          <div style="padding: 8px; max-width: 200px;">
            <strong>${poi.name}</strong>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">${poi.address}</div>
            ${poi.rating ? `<div style="color: #f59e0b; font-size: 12px; margin-top: 2px;">⭐ ${poi.rating}</div>` : ''}
          </div>
        `;
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(map, marker);
        onPoiClick?.(poi);
      });

      markersRef.current.push(marker);
    });

    // Draw route legs with urgency colors
    legs.forEach(leg => {
      const path = [
        { lat: leg.startLocation.latitude, lng: leg.startLocation.longitude },
        { lat: leg.endLocation.latitude, lng: leg.endLocation.longitude },
      ];

      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: URGENCY_COLORS[leg.urgency] || '#22c55e',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });

      polylinesRef.current.push(polyline);
    });

    // Fit bounds
    if (bounds) {
      const mapBounds = new google.maps.LatLngBounds(
        { lat: bounds.southwest.latitude, lng: bounds.southwest.longitude },
        { lat: bounds.northeast.latitude, lng: bounds.northeast.longitude },
      );
      map.fitBounds(mapBounds, 50);
    } else if (waypoints.length > 0) {
      const mapBounds = new google.maps.LatLngBounds();
      waypoints.forEach(wp => {
        mapBounds.extend({ lat: wp.location.latitude, lng: wp.location.longitude });
      });
      map.fitBounds(mapBounds, 50);
    }
  }, [waypoints, legs, pois, bounds, isLoaded, demoMode, onWaypointClick, onPoiClick]);

  // Demo mode fallback
  if (demoMode || loadError) {
    return <DemoModeMap waypoints={waypoints} legs={legs} pois={pois} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
          <div className="text-white text-sm">Loading map...</div>
        </div>
      )}
    </div>
  );
}

// ── Demo Mode SVG Map ───────────────────────────────────────

function DemoModeMap({
  waypoints,
  legs,
  pois,
  className,
}: {
  waypoints: RouteWaypoint[];
  legs: RouteLeg[];
  pois: PlaceOfInterest[];
  className: string;
}) {
  // Missouri bounding box for SVG projection
  const MO_BOUNDS = { minLat: 36.0, maxLat: 40.6, minLng: -95.8, maxLng: -89.1 };
  const SVG_W = 800;
  const SVG_H = 550;

  const project = (lat: number, lng: number) => ({
    x: ((lng - MO_BOUNDS.minLng) / (MO_BOUNDS.maxLng - MO_BOUNDS.minLng)) * SVG_W,
    y: SVG_H - ((lat - MO_BOUNDS.minLat) / (MO_BOUNDS.maxLat - MO_BOUNDS.minLat)) * SVG_H,
  });

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute top-3 left-3 z-10 bg-amber-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Demo Mode
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full min-h-[400px]" preserveAspectRatio="xMidYMid meet">
        {/* Missouri outline (simplified) */}
        <path
          d="M120,50 L680,50 L700,80 L710,150 L700,200 L690,280 L680,350 L660,400 L600,430 L500,450 L400,460 L300,450 L200,440 L150,400 L120,350 L100,280 L90,200 L100,120 Z"
          fill="none"
          stroke="#374151"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Route legs */}
        {legs.map((leg, i) => {
          const start = project(leg.startLocation.latitude, leg.startLocation.longitude);
          const end = project(leg.endLocation.latitude, leg.endLocation.longitude);
          return (
            <line
              key={`leg-${i}`}
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              stroke={URGENCY_COLORS[leg.urgency] || '#22c55e'}
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.7"
            />
          );
        })}

        {/* POI markers */}
        {pois.map((poi, i) => {
          const pos = project(poi.location.latitude, poi.location.longitude);
          return (
            <circle
              key={`poi-${i}`}
              cx={pos.x} cy={pos.y}
              r="4"
              fill="#f97316"
              opacity="0.7"
            />
          );
        })}

        {/* Waypoint markers */}
        {waypoints.map((wp, i) => {
          const pos = project(wp.location.latitude, wp.location.longitude);
          const icon = getMarkerIcon(wp.type, wp.urgency);
          return (
            <g key={`wp-${i}`}>
              <circle
                cx={pos.x} cy={pos.y}
                r={wp.type === 'COURSE' ? 12 : 8}
                fill={icon.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={pos.x} y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {icon.label}
              </text>
              <text
                x={pos.x} y={pos.y - 18}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize="10"
              >
                {wp.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function getMarkerIcon(type: string, _urgency: string): { color: string; label: string } {
  switch (type) {
    case 'COURSE': return { color: '#16a34a', label: '⛳' };
    case 'HOTEL': return { color: '#2563eb', label: '🏨' };
    case 'AIRPORT': return { color: '#7c3aed', label: '✈' };
    case 'FOOD': return { color: '#ea580c', label: '🍖' };
    case 'GAS': return { color: '#dc2626', label: '⛽' };
    case 'START': return { color: '#059669', label: 'A' };
    case 'END': return { color: '#dc2626', label: 'B' };
    default: return { color: '#6b7280', label: '•' };
  }
}

function buildInfoWindowContent(wp: RouteWaypoint): string {
  const urgencyLabel = {
    RELAXED: '🟢 Plenty of time',
    COMFORTABLE: '🟢 On schedule',
    TIGHT: '🟡 Tight schedule',
    CRITICAL: '🔴 Running late!',
  }[wp.urgency] || '';

  return `
    <div style="padding: 8px; max-width: 250px; font-family: sans-serif;">
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${wp.name}</div>
      <div style="color: #666; font-size: 12px;">${wp.address}</div>
      ${wp.teeTime ? `<div style="margin-top: 6px; font-size: 12px;">🏌️ Tee Time: <strong>${wp.teeTime}</strong></div>` : ''}
      ${wp.arrivalTime ? `<div style="font-size: 12px;">📍 Arrive: ${wp.arrivalTime}</div>` : ''}
      ${wp.departureTime ? `<div style="font-size: 12px;">🚗 Depart: ${wp.departureTime}</div>` : ''}
      ${urgencyLabel ? `<div style="font-size: 11px; margin-top: 4px;">${urgencyLabel}</div>` : ''}
    </div>
  `;
}

export default TripMap;
