/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Database } from '@/types/supabase';
import { Filter, MapPin } from 'lucide-react';

type PlanningApplication = Database['public']['Tables']['applications']['Row'];

interface ApplicationsMapProps {
    applications: PlanningApplication[];
    userLocation: { lat: number; lng: number } | null;
    councilFilter: string;
}

// London Boroughs with their colors
const LONDON_BOROUGHS = {
    'barking_and_dagenham': { name: 'Barking and Dagenham', color: '#FF6B6B' },
    'barnet': { name: 'Barnet', color: '#4ECDC4' },
    'bexley': { name: 'Bexley', color: '#45B7D1' },
    'brent': { name: 'Brent', color: '#96CEB4' },
    'bromley': { name: 'Bromley', color: '#FFEAA7' },
    'camden': { name: 'Camden', color: '#DDA0DD' },
    'croydon': { name: 'Croydon', color: '#98D8C8' },
    'ealing': { name: 'Ealing', color: '#F7DC6F' },
    'enfield': { name: 'Enfield', color: '#BB8FCE' },
    'greenwich': { name: 'Greenwich', color: '#85C1E9' },
    'hackney': { name: 'Hackney', color: '#F8C471' },
    'hammersmith_and_fulham': { name: 'Hammersmith and Fulham', color: '#82E0AA' },
    'haringey': { name: 'Haringey', color: '#F1948A' },
    'harrow': { name: 'Harrow', color: '#85C1E9' },
    'havering': { name: 'Havering', color: '#D7BDE2' },
    'hillingdon': { name: 'Hillingdon', color: '#F9E79F' },
    'hounslow': { name: 'Hounslow', color: '#D5A6BD' },
    'islington': { name: 'Islington', color: '#A9CCE3' },
    'kensington_and_chelsea': { name: 'Kensington and Chelsea', color: '#FAD7A0' },
    'kingston_upon_thames': { name: 'Kingston upon Thames', color: '#ABEBC6' },
    'lambeth': { name: 'Lambeth', color: '#F8C471' },
    'lewisham': { name: 'Lewisham', color: '#85C1E9' },
    'merton': { name: 'Merton', color: '#D7BDE2' },
    'newham': { name: 'Newham', color: '#F9E79F' },
    'redbridge': { name: 'Redbridge', color: '#D5A6BD' },
    'richmond_upon_thames': { name: 'Richmond upon Thames', color: '#A9CCE3' },
    'southwark': { name: 'Southwark', color: '#FAD7A0' },
    'sutton': { name: 'Sutton', color: '#ABEBC6' },
    'tower_hamlets': { name: 'Tower Hamlets', color: '#F8C471' },
    'waltham_forest': { name: 'Waltham Forest', color: '#85C1E9' },
    'wandsworth': { name: 'Wandsworth', color: '#D7BDE2' },
    'westminster': { name: 'Westminster', color: '#F9E79F' }
};

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ApplicationsMap({ applications, userLocation, councilFilter }: ApplicationsMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [showMapFilters, setShowMapFilters] = useState(false);
    const [mapInitialized, setMapInitialized] = useState(false);

    // Filter applications based on council filter
    const filteredApplications = applications.filter(app => {
        if (councilFilter === 'all') return true;
        return app.council_id === councilFilter;
    });

    // Get applications with coordinates
    const applicationsWithCoords = filteredApplications.filter(app =>
        app.latitude && app.longitude
    );

    // Initialize map with proper error handling
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Add a small delay to ensure the container is properly rendered
        const initMap = () => {
            try {
                if (!mapRef.current) return;

                // Initialize map
                const map = L.map(mapRef.current).setView(
                    userLocation || [51.5074, -0.1278], // Default to London if no user location
                    10
                );

                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapInstanceRef.current = map;
                setMapInitialized(true);

                // Force a map refresh to ensure proper rendering
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                }, 100);

            } catch (error) {
                console.error('Error initializing map:', error);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(initMap, 100);
        return () => clearTimeout(timer);
    }, [userLocation]);

    // Update markers when applications or filters change
    useEffect(() => {
        if (!mapInstanceRef.current || !mapInitialized) return;

        try {
            const map = mapInstanceRef.current;

            // Clear existing markers
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add markers for applications with coordinates
            applicationsWithCoords.forEach((app) => {
                if (!app.latitude || !app.longitude) return;

                const marker = L.marker([app.latitude, app.longitude])
                    .addTo(map)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <h3 style="font-weight: bold; margin-bottom: 8px;">${app.address || 'Unknown Address'}</h3>
                            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${app.reference}</p>
                            <p style="font-size: 12px; margin-bottom: 8px;">${app.proposal || 'No description available'}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 11px; color: #888;">${app.council_id.replace(/_/g, ' ')}</span>
                                <span style="font-size: 11px; color: #888;">${app.status || 'N/A'}</span>
                            </div>
                        </div>
                    `);

                // Get borough color or use status-based color
                const boroughInfo = LONDON_BOROUGHS[app.council_id as keyof typeof LONDON_BOROUGHS];
                let markerColor = '#6b7280'; // Default gray

                if (boroughInfo) {
                    // Use borough color
                    markerColor = boroughInfo.color;
                } else {
                    // Fallback to status-based color
                    const status = app.status?.toLowerCase() || '';
                    if (status.includes('approved')) {
                        markerColor = '#10b981';
                    } else if (status.includes('rejected') || status.includes('refused')) {
                        markerColor = '#ef4444';
                    } else if (status.includes('pending') || status.includes('under')) {
                        markerColor = '#f59e0b';
                    }
                }

                marker.setIcon(L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                }));
            });

            // Add user location marker if available
            if (userLocation) {
                const userMarker = L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup('Your Location')
                    .setIcon(L.divIcon({
                        className: 'custom-marker user',
                        html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    }));
            }

            // Fit map to show all markers if there are any
            if (applicationsWithCoords.length > 0) {
                const markers = applicationsWithCoords
                    .filter(app => app.latitude && app.longitude)
                    .map(app => [app.latitude!, app.longitude!] as [number, number]);

                if (markers.length > 0) {
                    const group = new L.FeatureGroup(markers.map(coords => L.marker(coords)));
                    const bounds = group.getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds.pad(0.1));
                    }
                }
            }

            // Force map refresh
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            }, 50);

        } catch (error) {
            console.error('Error updating map markers:', error);
        }
    }, [applicationsWithCoords, userLocation, councilFilter, mapInitialized]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (error) {
                    console.error('Error removing map:', error);
                }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const applicationsWithoutCoords = filteredApplications.filter(app => !app.latitude || !app.longitude).length;

    return (
        <div className="relative">
            {/* Map Filter Toggle */}
            <div className="absolute top-4 left-4 z-20">
                <button
                    onClick={() => setShowMapFilters(!showMapFilters)}
                    className="btn btn-sm btn-primary shadow-lg"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Map Filters
                </button>
            </div>

            {/* Map Filters Panel */}
            {showMapFilters && (
                <div className="absolute top-16 left-4 z-20 bg-white p-4 rounded-lg shadow-lg min-w-64">
                    <h4 className="font-semibold mb-3">Map Information</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Applications shown:</span>
                            <span className="font-semibold">{applicationsWithCoords.length}</span>
                        </div>
                        {applicationsWithoutCoords > 0 && (
                            <div className="flex justify-between text-orange-600">
                                <span>Without coordinates:</span>
                                <span className="font-semibold">{applicationsWithoutCoords}</span>
                            </div>
                        )}
                        {councilFilter !== 'all' && (
                            <div className="flex justify-between">
                                <span>Council filter:</span>
                                <span className="font-semibold">{councilFilter.replace(/_/g, ' ')}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t">
                        <p className="text-xs text-gray-600">
                            💡 Coordinates are updated daily at 1am via automated geocoding
                        </p>
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                className="w-full h-96 rounded-lg map-container"
                style={{ zIndex: 1 }}
            />

            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md text-sm max-w-48">
                <h4 className="font-semibold mb-2">Legend</h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Your Location</span>
                    </div>

                    {/* Show borough colors if filtering by a specific council */}
                    {councilFilter !== 'all' && LONDON_BOROUGHS[councilFilter as keyof typeof LONDON_BOROUGHS] && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: LONDON_BOROUGHS[councilFilter as keyof typeof LONDON_BOROUGHS].color }}
                            ></div>
                            <span>{LONDON_BOROUGHS[councilFilter as keyof typeof LONDON_BOROUGHS].name}</span>
                        </div>
                    )}

                    {/* Status-based colors for non-borough councils */}
                    {councilFilter !== 'all' && !LONDON_BOROUGHS[councilFilter as keyof typeof LONDON_BOROUGHS] && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Approved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Rejected</span>
                            </div>
                        </>
                    )}

                    {/* Show all borough colors when no filter */}
                    {councilFilter === 'all' && (
                        <div className="text-xs text-gray-600">
                            <div>🎨 London boroughs have unique colors</div>
                            <div>📊 Other councils use status colors</div>
                        </div>
                    )}
                </div>

                {/* Applications Count */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                        <div>📍 {applicationsWithCoords.length} locations shown</div>
                        {applicationsWithoutCoords > 0 && (
                            <div className="text-orange-600">⚠️ {applicationsWithoutCoords} missing coordinates</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 