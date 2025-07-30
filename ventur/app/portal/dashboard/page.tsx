/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, FolderPlus, Check, Loader2, Info, Map, List, Grid3X3, Filter, X, Plus, ChevronDown, Calendar, Building2, AlertCircle, TrendingUp, Users, Database, Zap } from 'lucide-react';
import { mockDataService, MockApplication, MockAnalytics } from '@/utils/mockData';
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

export default function DashboardPage() {
    const [applications, setApplications] = useState<MockApplication[]>([]);
    const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
    const [savedApplicationIds, setSavedApplicationIds] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
        if (!userLocation) {
            setUserLocation({ lat: 51.5074, lng: -0.1278 });
        }
    }, [userLocation]);

    // Request location when user switches to map view
    useEffect(() => {
        if (viewMode === 'map' && !geolocationAttempted) {
            requestLocationForMap();
        }
    }, [viewMode, requestLocationForMap]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch applications and analytics in parallel
                const [appData, analyticsData] = await Promise.all([
                    mockDataService.getApplications({
                        page: currentPage,
                        limit: 20,
                        search: searchTerm,
                        source_id: sourceFilter === 'all' ? undefined : sourceFilter
                    }),
                    mockDataService.getAnalyticsOverview()
                ]);

                setApplications(appData.items);
                setTotalPages(appData.pagination.pages);
                setAnalytics(analyticsData);

                // Simulate some saved applications
                const savedIds = new Set<string>();
                for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
                    if (appData.items[i]) {
                        savedIds.add(appData.items[i].id);
                    }
                }
                setSavedApplicationIds(savedIds);

            } catch (error) {
                console.error('Error fetching data:', error);
                setNotification({ message: 'Failed to load data.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, searchTerm, sourceFilter]);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch =
                searchTerm === '' ||
                app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.category?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSource = sourceFilter === 'all' || app.source_id === sourceFilter;

            return matchesSearch && matchesSource;
        });
    }, [applications, searchTerm, sourceFilter]);

    const availableSources = useMemo(() => {
        const sources = new Set(applications.map(app => app.source_id));
        return Array.from(sources).sort();
    }, [applications]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveToBucket = useCallback(async (applicationId: string, bucketId: string) => {
        setSavingId(applicationId);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            showNotification('Application saved to bucket!', 'success');
            setSavedApplicationIds(prev => new Set(prev).add(applicationId));

        } catch (error: any) {
            console.error("Error saving to bucket:", error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            setSavingId(null);
            setShowBucketModal(false);
            setSelectedApplicationForBucket(null);
        }
    }, []);

    const openBucketModal = (applicationId: string) => {
        setSelectedApplicationForBucket(applicationId);
        setShowBucketModal(true);
    };

    const getStatusColor = (qualityScore: number) => {
        if (qualityScore >= 0.9) return 'badge-success';
        if (qualityScore >= 0.8) return 'badge-warning';
        return 'badge-error';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatQualityScore = (score: number) => {
        return `${(score * 100).toFixed(0)}%`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Data Collection Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Monitor and manage your collected data from various sources
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
                            className={`px-3 py-2 rounded-r-xl transition-all duration-200 ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
                            onClick={() => setViewMode('list')}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{analytics.total_records.toLocaleString()}</div>
                                    <div className="text-blue-100">Total Records</div>
                                </div>
                                <Database className="w-8 h-8 text-blue-200" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{analytics.records_today}</div>
                                    <div className="text-green-100">Today&apos;s Records</div>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-200" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{analytics.total_sources}</div>
                                    <div className="text-purple-100">Data Sources</div>
                                </div>
                                <Users className="w-8 h-8 text-purple-200" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{analytics.collection_success_rate}%</div>
                                    <div className="text-orange-100">Success Rate</div>
                                </div>
                                <Zap className="w-8 h-8 text-orange-200" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                placeholder="Search by title, description, or category..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* Source Filter */}
                    <div className="w-full lg:w-auto">
                        <label className="relative block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-gray-400" />
                            </div>
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
                                value={sourceFilter}
                                onChange={e => setSourceFilter(e.target.value)}
                            >
                                <option value="all">All Sources</option>
                                {availableSources.map(source => (
                                    <option key={source} value={source}>
                                        {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        <option value="all">All Categories</option>
                                        <option value="technology">Technology</option>
                                        <option value="business">Business</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Score</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                                        <option value="all">All Scores</option>
                                        <option value="high">High (90%+)</option>
                                        <option value="medium">Medium (80-89%)</option>
                                        <option value="low">Low (&lt;80%)</option>
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
                    Showing {filteredApplications.length} of {analytics?.total_records || 0} records
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
                            <p className="text-base-content/60">Loading data...</p>
                        </div>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Title & Source</th>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Quality & Date</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                            <tr key={app.id} className="hover">
                                                <td>
                                                    <div className="font-bold">{app.title}</div>
                                                    <div className="text-sm opacity-50">{app.source_id}</div>
                                                </td>
                                                <td className="max-w-md whitespace-normal">{app.description}</td>
                                                <td>
                                                    <span className="badge badge-outline badge-sm">
                                                        {app.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-sm ${getStatusColor(app.quality_score)}`}>
                                                        {formatQualityScore(app.quality_score)}
                                                    </span>
                                                    <div className="text-sm opacity-50 mt-1">
                                                        {formatDate(app.collected_at)}
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
                                                    <h3 className="font-bold">No data found</h3>
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
                                                {app.title}
                                            </h3>
                                            <p className="text-sm text-base-content/60 mb-2">
                                                {app.source_id}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`badge badge-sm ${getStatusColor(app.quality_score)}`}>
                                                {formatQualityScore(app.quality_score)}
                                            </span>
                                            <div className="text-xs text-base-content/40">
                                                📊 {app.content_stats.word_count} words
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-4 line-clamp-3">
                                        {app.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-base-content/60 mb-4">
                                        <span className="badge badge-outline badge-xs">
                                            {app.category}
                                        </span>
                                        <span>{formatDate(app.collected_at)}</span>
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
                                <h3 className="font-bold text-lg mb-2">No data found</h3>
                                <p className="text-base-content/60">
                                    Try adjusting your search or filters to find collected data
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="join">
                        <button
                            className="join-item btn"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            className="join-item btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Bucket Selection Modal */}
            {showBucketModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Save to Bucket</h3>
                        <p className="text-sm text-base-content/60 mb-6">
                            Choose which bucket to save this data to:
                        </p>

                        <div className="space-y-3">
                            <button
                                className="btn btn-outline w-full justify-start"
                                onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_1')}
                                disabled={savingId === selectedApplicationForBucket}
                            >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                High Priority Leads
                            </button>
                            <button
                                className="btn btn-outline w-full justify-start"
                                onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_2')}
                                disabled={savingId === selectedApplicationForBucket}
                            >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Follow Up
                            </button>
                            <button
                                className="btn btn-outline w-full justify-start"
                                onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_3')}
                                disabled={savingId === selectedApplicationForBucket}
                            >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                Research
                            </button>
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
