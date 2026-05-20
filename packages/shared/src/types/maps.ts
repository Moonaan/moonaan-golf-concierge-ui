// ============================================================
// Maps Types — Google Maps Integration + Route Optimization
// ============================================================

import { UUID, ISODateString, GeoLocation } from './common';

// ── Trip Planning ───────────────────────────────────────────

export interface TripPlanRequest {
  startLocation: LocationInput;
  courses: TripCourse[];
  hotel?: LocationInput;
  returnLocation?: LocationInput;
  travelMode?: TravelMode;
  optimizeOrder?: boolean;
}

export interface TripCourse {
  name: string;
  address: string;
  courseId?: string;
  teeTime: string;       // ISO datetime or HH:MM
  teeDate?: ISODateString;
  location?: GeoLocation;
}

export interface LocationInput {
  address?: string;
  placeId?: string;
  location?: GeoLocation;
  name?: string;
}

export enum TravelMode {
  DRIVING = 'driving',
  WALKING = 'walking',
  BICYCLING = 'bicycling',
  TRANSIT = 'transit',
}

// ── Optimized Route Result ──────────────────────────────────

export interface OptimizedRoute {
  tripId: UUID;
  orderedWaypoints: RouteWaypoint[];
  legs: RouteLeg[];
  totalDistanceMeters: number;
  totalDistanceMiles: number;
  totalDurationSeconds: number;
  totalDurationMinutes: number;
  suggestedDepartureTime: string;  // HH:MM
  overviewPolyline: string;        // encoded polyline
  warnings: string[];
  copyrights: string;
  bounds: {
    northeast: GeoLocation;
    southwest: GeoLocation;
  };
}

export interface RouteWaypoint {
  order: number;
  type: WaypointType;
  name: string;
  address: string;
  location: GeoLocation;
  arrivalTime?: string;     // HH:MM
  departureTime?: string;   // HH:MM
  teeTime?: string;         // HH:MM (courses only)
  bufferMinutes?: number;   // time buffer before tee time
  urgency: RouteUrgency;
}

export enum WaypointType {
  START = 'START',
  COURSE = 'COURSE',
  HOTEL = 'HOTEL',
  AIRPORT = 'AIRPORT',
  FOOD = 'FOOD',
  GAS = 'GAS',
  ATTRACTION = 'ATTRACTION',
  END = 'END',
}

export enum RouteUrgency {
  RELAXED = 'RELAXED',     // > 30 min buffer
  COMFORTABLE = 'COMFORTABLE', // 15-30 min buffer
  TIGHT = 'TIGHT',         // 5-15 min buffer
  CRITICAL = 'CRITICAL',   // < 5 min buffer or late
}

export interface RouteLeg {
  order: number;
  startName: string;
  endName: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  distanceMeters: number;
  distanceMiles: number;
  durationSeconds: number;
  durationMinutes: number;
  durationInTraffic?: number;  // seconds
  polyline: string;            // encoded polyline
  steps: RouteStep[];
  urgency: RouteUrgency;
  interestingStops?: PlaceOfInterest[];
}

export interface RouteStep {
  instruction: string;        // HTML directions
  distanceMeters: number;
  durationSeconds: number;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  travelMode: string;
  maneuver?: string;
}

// ── Places / POI ────────────────────────────────────────────

export interface PlaceOfInterest {
  placeId: string;
  name: string;
  address: string;
  location: GeoLocation;
  type: POIType;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;        // 0-4
  isOpen?: boolean;
  photoReference?: string;
  photoUrl?: string;
  detourTimeMinutes?: number;
  distanceFromRouteMeters?: number;
  website?: string;
  phone?: string;
}

export enum POIType {
  RESTAURANT = 'restaurant',
  BBQ = 'bbq_joint',
  BREWERY = 'brewery',
  WINERY = 'winery',
  GAS_STATION = 'gas_station',
  GOLF_COURSE = 'golf_course',
  TOURIST_ATTRACTION = 'tourist_attraction',
  STATE_PARK = 'state_park',
  SCENIC_OVERLOOK = 'scenic_overlook',
  HOTEL = 'lodging',
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  formattedPhone?: string;
  website?: string;
  location: GeoLocation;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types: string[];
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    relativeTimeDescription: string;
  }>;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
}

// ── Directions API Types ────────────────────────────────────

export interface DirectionsRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
  mode?: TravelMode;
  optimizeWaypoints?: boolean;
  departureTime?: string;    // ISO datetime
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

export interface DirectionsResult {
  routes: DirectionsRoute[];
  status: string;
  geocodedWaypoints: Array<{
    geocoderStatus: string;
    placeId: string;
    types: string[];
  }>;
}

export interface DirectionsRoute {
  summary: string;
  legs: DirectionsLeg[];
  waypointOrder: number[];
  overviewPolyline: { points: string };
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  copyrights: string;
  warnings: string[];
}

export interface DirectionsLeg {
  startAddress: string;
  endAddress: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  durationInTraffic?: { text: string; value: number };
  steps: Array<{
    htmlInstructions: string;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    startLocation: { lat: number; lng: number };
    endLocation: { lat: number; lng: number };
    travelMode: string;
    maneuver?: string;
  }>;
}

// ── Distance Matrix API Types ───────────────────────────────

export interface DistanceMatrixResult {
  originAddresses: string[];
  destinationAddresses: string[];
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: { text: string; value: number };
      duration?: { text: string; value: number };
      durationInTraffic?: { text: string; value: number };
    }>;
  }>;
  status: string;
}

// ── Geocoding API Types ─────────────────────────────────────

export interface GeocodingResult {
  results: Array<{
    placeId: string;
    formattedAddress: string;
    geometry: {
      location: { lat: number; lng: number };
      locationType: string;
    };
    types: string[];
    addressComponents: Array<{
      longName: string;
      shortName: string;
      types: string[];
    }>;
  }>;
  status: string;
}

// ── Nearby Search API Types ─────────────────────────────────

export interface NearbySearchResult {
  results: Array<{
    placeId: string;
    name: string;
    vicinity: string;
    geometry: { location: { lat: number; lng: number } };
    rating?: number;
    userRatingsTotal?: number;
    priceLevel?: number;
    types: string[];
    openingHours?: { openNow: boolean };
    photos?: Array<{ photoReference: string; width: number; height: number }>;
    businessStatus?: string;
  }>;
  status: string;
  nextPageToken?: string;
}

// ── API Request/Response Types ──────────────────────────────

export interface RouteOptimizeRequest {
  tripPlan: TripPlanRequest;
}

export interface RouteOptimizeResponse {
  route: OptimizedRoute;
  interestingStops: PlaceOfInterest[];
}

export interface NearbySearchRequest {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
  keyword?: string;
}

export interface DirectionsApiRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
  mode?: TravelMode;
  optimizeWaypoints?: boolean;
}
