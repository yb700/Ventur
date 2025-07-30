/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Search, MapPin, FolderPlus, Check, Loader2, Info, Map, List, Grid3X3, Filter, X, Plus, ChevronDown, Calendar, Building2, AlertCircle } from 'lucide-react';
import { Database } from '@/types/supabase';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/ApplicationsMap'), {
    ssr: false,
    loading: () => (
        <div className="h-96 bg-base-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-base-content/60">Loading map...</p>
            </div>
        </div>
    )
});

type PlanningApplication = Database['public']['Tables']['applications']['Row'];
type Bucket = Database['public']['Tables']['buckets']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [applications, setApplications] = useState<PlanningApplication[]>([]);
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [savedApplicationIds, setSavedApplicationIds] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [councilFilter, setCouncilFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showBucketModal, setShowBucketModal] = useState(false);
    const [selectedApplicationForBucket, setSelectedApplicationForBucket] = useState<string | null>(null);
    const [geolocationBlocked, setGeolocationBlocked] = useState(false);
    const [geolocationAttempted, setGeolocationAttempted] = useState(false);

    // Function to request location when user switches to map view
    const requestLocationForMap = useCallback(() => {
        if (geolocationAttempted || !navigator.geolocation) return;

        setGeolocationAttempted(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                console.log('Location obtained successfully for map view');
            },
            (error) => {
                console.log('Geolocation error for map view:', error);

                if (error.code === error.PERMISSION_DENIED) {
                    setGeolocationBlocked(true);
                    showNotification('Location access blocked. Map will show London area.', 'error');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000 // 10 minutes
            }
        );
    }, [geolocationAttempted]);

    // Get user location on component mount - only set default location
    useEffect(() => {
        if (profile && !userLocation) {
            setUserLocation({ lat: 51.5074, lng: -0.1278 });
        }
    }, [profile, userLocation]);

    // Request location when user switches to map view
    useEffect(() => {
        if (viewMode === 'map' && !geolocationAttempted) {
            requestLocationForMap();
        }
    }, [viewMode, requestLocationForMap]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                window.location.href = '/auth/login';
                return;
            }

            setUser(currentUser);

            // Fetch all data in parallel
            const [appData, bucketData, profileData] = await Promise.all([
                supabase
                    .from('applications')
                    .select('*')
                    .order('application_validated', { ascending: false, nullsFirst: false })
                    .limit(100),
                supabase
                    .from('buckets')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single()
            ]);

            if (appData.error) {
                console.error('Error fetching applications:', appData.error);
                setNotification({ message: 'Failed to load applications.', type: 'error' });
            } else {
                setApplications(appData.data ?? []);
            }

            if (bucketData.data) {
                setBuckets(bucketData.data);
            }

            if (profileData.data) {
                setProfile(profileData.data);
            }

            // Fetch saved application IDs from all buckets
            if (bucketData.data && bucketData.data.length > 0) {
                const bucketIds = bucketData.data.map(bucket => bucket.id);
                const { data: savedItems } = await supabase
                    .from('bucket_applications')
                    .select('application_id')
                    .in('bucket_id', bucketIds);

                if (savedItems) {
                    setSavedApplicationIds(new Set(savedItems.map(item => item.application_id)));
                }
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch =
                searchTerm === '' ||
                app.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.proposal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.reference?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCouncil = councilFilter === 'all' || app.council_id === councilFilter;

            return matchesSearch && matchesCouncil;
        });
    }, [applications, searchTerm, councilFilter]);

    const availableCouncils = useMemo(() => {
        const councils = new Set(applications.map(app => app.council_id));
        return Array.from(councils).sort();
    }, [applications]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveToBucket = useCallback(async (applicationId: string, bucketId: string) => {
        if (!user) return;
        setSavingId(applicationId);

        try {
            const { error: insertError } = await supabase
                .from('bucket_applications')
                .insert({
                    bucket_id: bucketId,
                    application_id: applicationId,
                });

            if (insertError) {
                if (insertError.code === '23505') {
                    showNotification('This application is already in this bucket.', 'error');
                } else {
                    throw insertError;
                }
            } else {
                showNotification('Application saved to bucket!', 'success');
                setSavedApplicationIds(prev => new Set(prev).add(applicationId));
            }

        } catch (error: any) {
            console.error("Error saving to bucket:", error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setSavingId(null);
            setShowBucketModal(false);
            setSelectedApplicationForBucket(null);
        }
    }, [user]);

    const openBucketModal = (applicationId: string) => {
        setSelectedApplicationForBucket(applicationId);
        setShowBucketModal(true);
    };

    const getStatusColor = (status: string | null) => {
        if (!status) return 'badge-ghost';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approved')) return 'badge-success';
        if (statusLower.includes('rejected') || statusLower.includes('refused')) return 'badge-error';
        if (statusLower.includes('pending') || statusLower.includes('under')) return 'badge-warning';
        return 'badge-info';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Planning Applications</h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Browse and save planning applications from your area
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <div className="join bg-white rounded-xl shadow-sm border border-gray-200">
                        <button
                            className={`px-3 py-2 rounded-l-xl transition-all duration-200 ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            className={`px-3 py-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setViewMode('list')}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            className={`px-3 py-2 rounded-r-xl transition-all duration-200 ${viewMode === 'map' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setViewMode('map')}
                            title="Map view"
                        >
                            <Map className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`toast toast-top toast-center z-50`}>
                    <div className={`alert alert-${notification.type}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search */}
                    <div className="flex-grow">
                        <label className="relative block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                placeholder="Search by address, proposal, or reference..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Council Filter */}
                    <div className="w-full lg:w-auto">
                        <label className="relative block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-gray-400" />
                            </div>
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
                                value={councilFilter}
                                onChange={e => setCouncilFilter(e.target.value)}
                            >
                                <option value="all">All Councils</option>
                                {availableCouncils.map(council => (
                                    <option key={council} value={council}>
                                        {council.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </label>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        className="px-4 py-3 border border-gray-300 rounded-xl hover:border-purple-300 hover:text-purple-600 transition-all duration-200 flex items-center gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {showFilters && <X className="w-4 h-4" />}
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <>
                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        <option value="all">All Time</option>
                                        <option value="week">Last Week</option>
                                        <option value="month">Last Month</option>
                                        <option value="quarter">Last 3 Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-base-content/60">
                    Showing {filteredApplications.length} of {applications.length} applications
                </p>
                {viewMode === 'map' && (
                    <div className="flex items-center gap-2">
                        {geolocationBlocked && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                📍 Location blocked - showing London area
                            </div>
                        )}
                        {userLocation && !geolocationBlocked && (
                            <p className="text-sm text-base-content/60">
                                Map centered on your location
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                            <p className="text-base-content/60">Loading applications...</p>
                        </div>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body p-0">
                            <MapComponent
                                applications={filteredApplications}
                                userLocation={userLocation}
                                councilFilter={councilFilter}
                            />
                        </div>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Address & Reference</th>
                                            <th>Proposal</th>
                                            <th>Council</th>
                                            <th>Status & Date</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                            <tr key={app.id} className="hover">
                                                <td>
                                                    <div className="font-bold">{app.address}</div>
                                                    <div className="text-sm opacity-50">{app.reference}</div>
                                                </td>
                                                <td className="max-w-md whitespace-normal">{app.proposal}</td>
                                                <td>
                                                    <span className="badge badge-outline badge-sm">
                                                        {app.council_id.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-sm ${getStatusColor(app.status)}`}>
                                                        {app.status || 'N/A'}
                                                    </span>
                                                    <div className="text-sm opacity-50 mt-1">
                                                        {formatDate(app.application_validated)}
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => openBucketModal(app.id)}
                                                        disabled={savingId === app.id}
                                                    >
                                                        {savingId === app.id ? (
                                                            <Loader2 className="animate-spin w-4 h-4" />
                                                        ) : savedApplicationIds.has(app.id) ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <FolderPlus className="w-4 h-4" />
                                                        )}
                                                        {savedApplicationIds.has(app.id) ? 'Saved' : 'Save'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center p-8">
                                                    <Info className="w-8 h-8 mx-auto text-base-content/30 mb-2" />
                                                    <h3 className="font-bold">No applications found</h3>
                                                    <p className="text-sm text-base-content/60">
                                                        Try adjusting your search or filters
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApplications.length > 0 ? filteredApplications.map(app => (
                            <div key={app.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow card-hover border border-base-300">
                                <div className="card-body">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1 line-clamp-2">
                                                {app.address}
                                            </h3>
                                            <p className="text-sm text-base-content/60 mb-2">
                                                {app.reference}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`badge badge-sm ${getStatusColor(app.status)}`}>
                                                {app.status || 'N/A'}
                                            </span>
                                            {app.latitude && app.longitude && (
                                                <div className="text-xs text-base-content/40">
                                                    📍 Has location
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm mb-4 line-clamp-3">
                                        {app.proposal || 'No proposal description available'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-base-content/60 mb-4">
                                        <span className="badge badge-outline badge-xs">
                                            {app.council_id.replace(/_/g, ' ')}
                                        </span>
                                        <span>{formatDate(app.application_validated)}</span>
                                    </div>

                                    <div className="card-actions justify-end">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => openBucketModal(app.id)}
                                            disabled={savingId === app.id}
                                        >
                                            {savingId === app.id ? (
                                                <Loader2 className="animate-spin w-4 h-4" />
                                            ) : savedApplicationIds.has(app.id) ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <FolderPlus className="w-4 h-4" />
                                            )}
                                            {savedApplicationIds.has(app.id) ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-12">
                                <Info className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                                <h3 className="font-bold text-lg mb-2">No applications found</h3>
                                <p className="text-base-content/60">
                                    Try adjusting your search or filters to find planning applications
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </>

            {/* Bucket Selection Modal */}
            {showBucketModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Save to Bucket</h3>
                        <p className="text-sm text-base-content/60 mb-6">
                            Choose which bucket to save this application to:
                        </p>

                        <div className="space-y-3">
                            {buckets.length > 0 ? buckets.map(bucket => (
                                <button
                                    key={bucket.id}
                                    className="btn btn-outline w-full justify-start"
                                    onClick={() => handleSaveToBucket(selectedApplicationForBucket!, bucket.id)}
                                    disabled={savingId === selectedApplicationForBucket}
                                >
                                    <FolderPlus className="w-4 h-4 mr-2" />
                                    {bucket.title}
                                </button>
                            )) : (
                                <div className="text-center py-4">
                                    <p className="text-base-content/60 mb-4">No buckets found</p>
                                    <button className="btn btn-primary btn-sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Bucket
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setShowBucketModal(false);
                                    setSelectedApplicationForBucket(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
