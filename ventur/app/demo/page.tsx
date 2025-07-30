"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, FolderPlus, Check, Loader2, Info, List, Grid3X3, Filter, X, TrendingUp, Users, Database, Zap } from 'lucide-react';
import { mockDataService, MockApplication, MockAnalytics } from '@/utils/mockData';

export default function DemoPage() {
    const [applications, setApplications] = useState<MockApplication[]>([]);
    const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
    const [savedApplicationIds, setSavedApplicationIds] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showBucketModal, setShowBucketModal] = useState(false);
    const [selectedApplicationForBucket, setSelectedApplicationForBucket] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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
            await new Promise(resolve => setTimeout(resolve, 1000));

            showNotification('Data saved to bucket!', 'success');
            setSavedApplicationIds(prev => new Set(prev).add(applicationId));

        } catch (error: unknown) {
            console.error("Error saving to bucket:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showNotification(`Error: ${errorMessage}`, 'error');
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
        <div className="min-h-screen bg-gray-50">
            {/* Demo Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">DataFlow Pro - Demo</h1>
                            <p className="text-purple-100">Intelligent Data Aggregation Platform</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-purple-200">Demo Mode</div>
                            <div className="text-xs text-purple-300">Using mock data</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Data Collection Dashboard</h2>
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
                        <div className="toast toast-top toast-center z-50">
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
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredApplications.length} of {analytics?.total_records || 0} records
                        </p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-purple-600" />
                                <p className="text-gray-600">Loading data...</p>
                            </div>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality & Date</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{app.title}</div>
                                                    <div className="text-sm text-gray-500">{app.source_id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-md truncate">{app.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        {app.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${app.quality_score >= 0.9 ? 'bg-green-100 text-green-800' :
                                                            app.quality_score >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {formatQualityScore(app.quality_score)}
                                                    </span>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {formatDate(app.collected_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                        onClick={() => openBucketModal(app.id)}
                                                        disabled={savingId === app.id}
                                                    >
                                                        {savingId === app.id ? (
                                                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                        ) : savedApplicationIds.has(app.id) ? (
                                                            <Check className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <FolderPlus className="w-4 h-4 mr-2" />
                                                        )}
                                                        {savedApplicationIds.has(app.id) ? 'Saved' : 'Save'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                                                    <p className="text-gray-500">
                                                        Try adjusting your search or filters
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // Grid View
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                <div key={app.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                                                    {app.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {app.source_id}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${app.quality_score >= 0.9 ? 'bg-green-100 text-green-800' :
                                                        app.quality_score >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {formatQualityScore(app.quality_score)}
                                                </span>
                                                <div className="text-xs text-gray-400">
                                                    📊 {app.content_stats.word_count} words
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                            {app.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {app.category}
                                            </span>
                                            <span>{formatDate(app.collected_at)}</span>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                onClick={() => openBucketModal(app.id)}
                                                disabled={savingId === app.id}
                                            >
                                                {savingId === app.id ? (
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                ) : savedApplicationIds.has(app.id) ? (
                                                    <Check className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <FolderPlus className="w-4 h-4 mr-2" />
                                                )}
                                                {savedApplicationIds.has(app.id) ? 'Saved' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-12">
                                    <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                                    <p className="text-gray-500">
                                        Try adjusting your search or filters to find collected data
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-2">
                                <button
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            className={`px-3 py-2 border rounded-md text-sm font-medium ${currentPage === page
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bucket Selection Modal */}
                    {showBucketModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Save to Bucket</h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Choose which bucket to save this data to:
                                    </p>

                                    <div className="space-y-3">
                                        <button
                                            className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                            onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_1')}
                                            disabled={savingId === selectedApplicationForBucket}
                                        >
                                            <FolderPlus className="w-4 h-4 inline mr-2" />
                                            High Priority Leads
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                            onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_2')}
                                            disabled={savingId === selectedApplicationForBucket}
                                        >
                                            <FolderPlus className="w-4 h-4 inline mr-2" />
                                            Follow Up
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                            onClick={() => handleSaveToBucket(selectedApplicationForBucket!, 'bucket_3')}
                                            disabled={savingId === selectedApplicationForBucket}
                                        >
                                            <FolderPlus className="w-4 h-4 inline mr-2" />
                                            Research
                                        </button>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                            onClick={() => {
                                                setShowBucketModal(false);
                                                setSelectedApplicationForBucket(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 