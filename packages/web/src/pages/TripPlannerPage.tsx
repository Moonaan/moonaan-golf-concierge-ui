// ============================================================
// TripPlannerPage — Full trip planning with templates, history,
// interactive maps, and route optimization
// ============================================================

import { useState, useCallback } from 'react';
import { Map, Calendar, Sparkles, ArrowRight, Route, Clock, MapPinned, Loader2 } from 'lucide-react';
import { TripPlanner } from '@/components/TripPlanner';
import { TripMap } from '@/components/TripMap';
import { RouteTimeline } from '@/components/RouteTimeline';
import { InterestingStops } from '@/components/InterestingStops';
import { REGIONS } from '@/lib/constants';
import { DEMO_MODE, mockOptimizeRoute } from '@/lib/mock-api';
import { MOCK_TRIP_PLANS } from '@/lib/mock-data';
import type { RoutePlanInput } from '@/lib/mock-data';

const API_BASE = import.meta.env.VITE_API_ENDPOINT || '/api';

const TRIP_TEMPLATES = MOCK_TRIP_PLANS.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  region: t.region,
  courses: t.courses.length,
  nights: t.hotel?.nights || 0,
  fromPrice: `$${t.totalCostPerPerson}`,
  emoji: t.emoji,
  tripPlan: t,
}));

const PAST_TRIPS = [
  {
    id: 'trip-1',
    name: 'Branson Golf Weekend',
    date: 'Feb 14–16, 2026',
    courses: ["Payne's Valley", 'Buffalo Ridge Springs'],
    status: 'completed',
    total: '$1,245',
  },
];

// ── Route View Types ──────────────────────────────────────

interface LatLng {
  latitude: number;
  longitude: number;
}

interface RouteWaypoint {
  order: number;
  type: string;
  name: string;
  address: string;
  location: LatLng;
  arrivalTime?: string;
  departureTime?: string;
  teeTime?: string;
  bufferMinutes?: number;
  urgency: string;
}

interface RouteLeg {
  order: number;
  startName: string;
  endName: string;
  startLocation: LatLng;
  endLocation: LatLng;
  distanceMiles: number;
  durationMinutes: number;
  urgency: string;
}

interface InterestingStop {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  type: string;
  types: string[];
  rating?: number;
}

interface RouteData {
  route: {
    tripId: string;
    orderedWaypoints: RouteWaypoint[];
    legs: RouteLeg[];
    totalDistanceMeters: number;
    totalDistanceMiles: number;
    totalDurationMinutes: number;
    suggestedDepartureTime: string;
    overviewPolyline: string;
    bounds: { northeast: LatLng; southwest: LatLng };
    warnings: string[];
  };
  interestingStops: InterestingStop[];
  demoMode: boolean;
}

export function TripPlannerPage() {
  const [showPlanner, setShowPlanner] = useState(false);
  const [showRouteView, setShowRouteView] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [showStopsPanel, setShowStopsPanel] = useState(false);

  const handleOptimizeRoute = useCallback(async (tripPlan: RoutePlanInput) => {
    setIsOptimizing(true);
    setOptimizeError(null);

    try {
      let data: unknown;
      if (DEMO_MODE) {
        data = await mockOptimizeRoute(tripPlan);
      } else {
        const response = await fetch(`${API_BASE}/maps/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripPlan }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error?.message || 'Failed to optimize route');
        }

        const json = (await response.json()) as { data?: unknown };
        data = json.data ?? json;
      }
      setRouteData(data as RouteData);
      setShowRouteView(true);
    } catch (err: unknown) {
      setOptimizeError(err instanceof Error ? err.message : 'Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const handleSuggestStop = useCallback((_legIndex: number) => {
    setShowStopsPanel(true);
  }, []);

  const handleAddStopToTrip = useCallback((stop: InterestingStop) => {
    // In a full implementation this would re-optimize the route with the new waypoint
    console.log('Adding stop to trip:', stop.name);
    setShowStopsPanel(false);
  }, []);

  // Route View
  if (showRouteView && routeData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Route Header */}
        <div className="bg-gray-900 text-white py-3 px-4">
          <div className="page-container flex items-center justify-between">
            <button
              onClick={() => setShowRouteView(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to planner
            </button>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-golf-gold-400" />
                {routeData.route.totalDurationMinutes} min drive
              </span>
              <span className="flex items-center gap-1">
                <Route className="w-4 h-4 text-golf-gold-400" />
                {routeData.route.totalDistanceMiles} mi
              </span>
              <span className="flex items-center gap-1">
                <MapPinned className="w-4 h-4 text-golf-gold-400" />
                {routeData.interestingStops.length} stops nearby
              </span>
              {routeData.demoMode && (
                <span className="text-xs bg-amber-600/80 px-2 py-0.5 rounded">Demo Mode</span>
              )}
            </div>
          </div>
        </div>

        {/* Map + Timeline Layout */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-52px)]">
          {/* Timeline (left side) */}
          <div className="lg:w-[400px] overflow-y-auto border-r border-gray-200 bg-white flex-shrink-0">
            <RouteTimeline
              waypoints={routeData.route.orderedWaypoints}
              legs={routeData.route.legs}
              suggestedDepartureTime={routeData.route.suggestedDepartureTime}
              totalDurationMinutes={routeData.route.totalDurationMinutes}
              totalDistanceMiles={routeData.route.totalDistanceMiles}
              onSuggestStop={handleSuggestStop}
            />

            {/* View Interesting Stops Button */}
            {routeData.interestingStops.length > 0 && (
              <div className="p-4">
                <button
                  onClick={() => setShowStopsPanel(!showStopsPanel)}
                  className="w-full btn-secondary text-sm"
                >
                  <MapPinned className="w-4 h-4 mr-2" />
                  {showStopsPanel ? 'Hide' : 'Show'} {routeData.interestingStops.length} Points of Interest
                </button>
              </div>
            )}
          </div>

          {/* Map (right side) */}
          <div className="flex-1 relative">
            <TripMap
              waypoints={routeData.route.orderedWaypoints}
              legs={routeData.route.legs}
              pois={routeData.interestingStops}
              overviewPolyline={routeData.route.overviewPolyline}
              bounds={routeData.route.bounds}
              className="w-full h-full"
            />

            {/* Interesting Stops Panel */}
            {showStopsPanel && (
              <div className="absolute top-4 right-4 w-80 z-10">
                <InterestingStops
                  stops={routeData.interestingStops}
                  isOpen={showStopsPanel}
                  onClose={() => setShowStopsPanel(false)}
                  onAddToTrip={handleAddStopToTrip}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showPlanner) {
    return (
      <div className="py-8 md:py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowPlanner(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to trips
            </button>
            <button
              onClick={() => {
                // Demo: optimize with sample data
                handleOptimizeRoute({
                  startLocation: { address: 'Springfield, MO', name: 'Springfield' },
                  courses: [
                    { name: "Payne's Valley", address: '601 Devil\'s Pool Rd, Ridgedale, MO 65739', teeTime: '09:30', location: { latitude: 36.52, longitude: -93.31 } },
                    { name: 'Buffalo Ridge Springs', address: '612 Devil\'s Pool Rd, Ridgedale, MO 65739', teeTime: '14:00', location: { latitude: 36.5163, longitude: -93.3044 } },
                  ],
                  hotel: { address: 'Big Cedar Lodge, Ridgedale, MO', name: 'Big Cedar Lodge' },
                });
              }}
              disabled={isOptimizing}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  Optimize Route
                </>
              )}
            </button>
          </div>
          {optimizeError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              ⚠️ {optimizeError}
            </div>
          )}
          <TripPlanner />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-golf-green-700 to-golf-green-950 text-white py-16">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Plan Your <span className="text-golf-gold-400">Golf Trip</span>
          </h1>
          <p className="mt-4 text-green-200 max-w-xl mx-auto">
            From tee times to hotels — build the perfect Missouri golf getaway in minutes.
          </p>
          <button
            onClick={() => setShowPlanner(true)}
            className="btn-secondary mt-8 text-lg px-8 py-3"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Planning
          </button>
        </div>
      </section>

      {/* Trip Templates */}
      <section className="py-12 md:py-16">
        <div className="page-container">
          <h2 className="section-heading mb-2">Quick Start Templates</h2>
          <p className="text-gray-500 mb-8">Pre-built trip packages — customize to your taste</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRIP_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="card p-6 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => {
                  handleOptimizeRoute({
                    startLocation: { address: 'Springfield, MO', name: 'Springfield' },
                    courses: tmpl.tripPlan.courses.map((c) => ({
                      name: c.name,
                      address: `${c.name}, Missouri`,
                      teeTime: c.teeTime,
                    })),
                    hotel: tmpl.tripPlan.hotel ? { address: tmpl.tripPlan.hotel.name, name: tmpl.tripPlan.hotel.name } : undefined,
                  });
                }}
              >
                <span className="text-4xl">{tmpl.emoji}</span>
                <h3 className="font-display font-bold text-gray-900 text-lg mt-3">
                  {tmpl.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{tmpl.description}</p>

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    {REGIONS[tmpl.region as keyof typeof REGIONS].label}
                  </span>
                  <span>{tmpl.courses} rounds</span>
                  {tmpl.nights > 0 && <span>{tmpl.nights} nights</span>}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm">
                    From <span className="text-lg font-bold text-golf-green-700">{tmpl.fromPrice}</span>
                    <span className="text-gray-400">/person</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-golf-green-700 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Trips */}
      <section className="py-12 md:py-16 bg-golf-sand">
        <div className="page-container">
          <h2 className="section-heading mb-6">My Trips</h2>

          {PAST_TRIPS.length > 0 ? (
            <div className="space-y-4">
              {PAST_TRIPS.map((trip) => (
                <div key={trip.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{trip.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.date}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {trip.courses.join(' • ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge-available">Completed</span>
                    <span className="font-semibold text-gray-900">{trip.total}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No trips yet</p>
              <p className="text-sm mt-1">Plan your first golf trip above!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
