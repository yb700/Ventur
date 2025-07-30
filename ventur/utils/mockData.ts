/**
 * Mock Data Service for DataFlow Pro
 * Provides realistic dummy data for demonstration purposes
 */

export interface MockApplication {
    id: string;
    title: string;
    description: string;
    url: string;
    source_id: string;
    category: string;
    tags: string[];
    quality_score: number;
    content_stats: {
        word_count: number;
        sentence_count: number;
        character_count: number;
        average_word_length: number;
    };
    metadata: {
        processing_version: string;
        quality_threshold_met: boolean;
        processing_timestamp: string;
        content_type: string;
        tags_count: number;
    };
    collected_at: string;
    processed_at: string;
    domain?: string;
    content_hash: string;
}

export interface MockUser {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    created_at: string;
    settings: {
        notifications: boolean;
        theme: 'light' | 'dark';
        language: string;
    };
}

export interface MockAnalytics {
    total_records: number;
    total_sources: number;
    records_today: number;
    active_jobs: number;
    collection_success_rate: number;
    average_processing_time: number;
}

export interface MockSourceAnalytics {
    source_id: string;
    total_records: number;
    records_today: number;
    success_rate: number;
    average_processing_time: number;
}

export interface MockTemplate {
    id: string;
    name: string;
    content: string;
    variables: string[];
    created_at: string;
}

// Generate random data
const generateMockApplications = (count: number): MockApplication[] => {
    const sources = ['tech_news', 'business_news', 'finance_daily', 'startup_weekly', 'enterprise_monthly'];
    const categories = ['technology', 'business', 'finance', 'healthcare', 'general'];
    const domains = ['techcrunch.com', 'forbes.com', 'wsj.com', 'startup.com', 'enterprise.com'];

    const applications: MockApplication[] = [];

    for (let i = 0; i < count; i++) {
        const source = sources[Math.floor(Math.random() * sources.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const qualityScore = 0.7 + Math.random() * 0.3; // 0.7 to 1.0

        const wordCount = 50 + Math.floor(Math.random() * 200);
        const sentenceCount = 3 + Math.floor(Math.random() * 10);
        const characterCount = wordCount * 5 + Math.floor(Math.random() * 500);

        applications.push({
            id: `app_${i + 1}`,
            title: `Sample ${category.charAt(0).toUpperCase() + category.slice(1)} Article ${i + 1}`,
            description: `This is a comprehensive article about ${category} trends and developments. It covers various aspects including market analysis, technological advancements, and future predictions. The content provides valuable insights for professionals in the ${category} sector.`,
            url: `https://${domain}/article-${i + 1}`,
            source_id: source,
            category,
            tags: [category, 'trends', 'analysis'],
            quality_score: qualityScore,
            content_stats: {
                word_count: wordCount,
                sentence_count: sentenceCount,
                character_count: characterCount,
                average_word_length: 4.5 + Math.random() * 2
            },
            metadata: {
                processing_version: '1.0.0',
                quality_threshold_met: qualityScore >= 0.8,
                processing_timestamp: new Date().toISOString(),
                content_type: category,
                tags_count: 3
            },
            collected_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            processed_at: new Date().toISOString(),
            domain,
            content_hash: `hash_${Math.random().toString(36).substr(2, 9)}`
        });
    }

    return applications;
};

const generateMockUser = (): MockUser => ({
    id: 'user_123',
    email: 'demo@dataflowpro.com',
    name: 'Demo User',
    role: 'user',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
        notifications: true,
        theme: 'light',
        language: 'en'
    }
});

const generateMockAnalytics = (): MockAnalytics => ({
    total_records: 15420,
    total_sources: 25,
    records_today: 147,
    active_jobs: 3,
    collection_success_rate: 98.5,
    average_processing_time: 2.3
});

const generateMockSourceAnalytics = (): MockSourceAnalytics[] => [
    {
        source_id: 'tech_news',
        total_records: 5230,
        records_today: 45,
        success_rate: 99.2,
        average_processing_time: 1.8
    },
    {
        source_id: 'business_news',
        total_records: 4120,
        records_today: 38,
        success_rate: 98.8,
        average_processing_time: 2.1
    },
    {
        source_id: 'finance_daily',
        total_records: 3890,
        records_today: 32,
        success_rate: 99.5,
        average_processing_time: 1.9
    },
    {
        source_id: 'startup_weekly',
        total_records: 2180,
        records_today: 25,
        success_rate: 97.9,
        average_processing_time: 2.5
    },
    {
        source_id: 'enterprise_monthly',
        total_records: 0,
        records_today: 7,
        success_rate: 100.0,
        average_processing_time: 1.6
    }
];

const generateMockTemplates = (): MockTemplate[] => [
    {
        id: 'template_1',
        name: 'Welcome Template',
        content: 'Hello {{name}}, welcome to our platform! We\'re excited to have you on board.',
        variables: ['name'],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'template_2',
        name: 'Follow-up Template',
        content: 'Hi {{name}}, I wanted to follow up on our previous conversation about {{topic}}.',
        variables: ['name', 'topic'],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'template_3',
        name: 'Newsletter Template',
        content: 'Dear {{name}}, here\'s your weekly update with the latest {{category}} news and insights.',
        variables: ['name', 'category'],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Mock API functions
export const mockDataService = {
    // Applications
    getApplications: async (params?: {
        page?: number;
        limit?: number;
        source_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    }): Promise<{
        items: MockApplication[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> => {
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const search = params?.search || '';

        let applications = generateMockApplications(100);

        // Apply search filter
        if (search) {
            applications = applications.filter(app =>
                app.title.toLowerCase().includes(search.toLowerCase()) ||
                app.description.toLowerCase().includes(search.toLowerCase()) ||
                app.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply source filter
        if (params?.source_id) {
            applications = applications.filter(app => app.source_id === params.source_id);
        }

        // Apply date filters
        if (params?.date_from) {
            const fromDate = new Date(params.date_from);
            applications = applications.filter(app => new Date(app.collected_at) >= fromDate);
        }

        if (params?.date_to) {
            const toDate = new Date(params.date_to);
            applications = applications.filter(app => new Date(app.collected_at) <= toDate);
        }

        const total = applications.length;
        const pages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedApplications = applications.slice(startIndex, endIndex);

        return {
            items: paginatedApplications,
            pagination: {
                page,
                limit,
                total,
                pages
            }
        };
    },

    // User
    getUserProfile: async (): Promise<MockUser> => {
        return generateMockUser();
    },

    updateUserProfile: async (data: Partial<MockUser>): Promise<MockUser> => {
        const user = generateMockUser();
        return { ...user, ...data };
    },

    // Analytics
    getAnalyticsOverview: async (): Promise<MockAnalytics> => {
        return generateMockAnalytics();
    },

    getSourceAnalytics: async (params?: {
        date_from?: string;
        date_to?: string;
    }): Promise<MockSourceAnalytics[]> => {
        return generateMockSourceAnalytics();
    },

    // Templates
    getTemplates: async (): Promise<MockTemplate[]> => {
        return generateMockTemplates();
    },

    createTemplate: async (data: {
        name: string;
        content: string;
        variables: string[];
    }): Promise<MockTemplate> => {
        return {
            id: `template_${Date.now()}`,
            name: data.name,
            content: data.content,
            variables: data.variables,
            created_at: new Date().toISOString()
        };
    },

    // Data Collection
    triggerCollection: async (data: {
        source_id: string;
        urls: string[];
        priority?: 'high' | 'normal' | 'low';
    }): Promise<{
        job_id: string;
        status: string;
        estimated_duration: number;
    }> => {
        return {
            job_id: `job_${Date.now()}`,
            status: 'queued',
            estimated_duration: 300
        };
    },

    getJobStatus: async (jobId: string): Promise<{
        job_id: string;
        status: 'completed' | 'running' | 'failed';
        progress: number;
        total_urls: number;
        processed_urls: number;
        started_at: string;
        completed_at?: string;
    }> => {
        return {
            job_id: jobId,
            status: 'completed',
            progress: 100,
            total_urls: 50,
            processed_urls: 50,
            started_at: new Date(Date.now() - 300000).toISOString(),
            completed_at: new Date().toISOString()
        };
    },

    // Export
    exportData: async (params: {
        format: 'csv' | 'json' | 'xml';
        source_id?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<string> => {
        const applications = generateMockApplications(50);

        if (params.format === 'json') {
            return JSON.stringify(applications, null, 2);
        } else if (params.format === 'csv') {
            const headers = ['id', 'title', 'description', 'url', 'source_id', 'category', 'quality_score'];
            const csvContent = [
                headers.join(','),
                ...applications.map(app => [
                    app.id,
                    `"${app.title}"`,
                    `"${app.description}"`,
                    app.url,
                    app.source_id,
                    app.category,
                    app.quality_score
                ].join(','))
            ].join('\n');

            return csvContent;
        } else {
            return `<xml>${applications.map(app => `<application><id>${app.id}</id><title>${app.title}</title></application>`).join('')}</xml>`;
        }
    }
};

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
    get: async (endpoint: string, params?: any) => {
        await delay(300 + Math.random() * 500); // 300-800ms delay

        switch (endpoint) {
            case '/api/data/collected':
                return mockDataService.getApplications(params);
            case '/api/user/profile':
                return mockDataService.getUserProfile();
            case '/api/analytics/overview':
                return mockDataService.getAnalyticsOverview();
            case '/api/analytics/sources':
                return mockDataService.getSourceAnalytics(params);
            case '/api/templates':
                return mockDataService.getTemplates();
            case '/api/data/jobs':
                return mockDataService.getJobStatus(params?.job_id || 'job_123');
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    },

    post: async (endpoint: string, data?: any) => {
        await delay(400 + Math.random() * 600); // 400-1000ms delay

        switch (endpoint) {
            case '/api/data/collect':
                return mockDataService.triggerCollection(data);
            case '/api/templates':
                return mockDataService.createTemplate(data);
            case '/api/user/profile':
                return mockDataService.updateUserProfile(data);
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    },

    put: async (endpoint: string, data?: any) => {
        await delay(400 + Math.random() * 600);

        switch (endpoint) {
            case '/api/user/profile':
                return mockDataService.updateUserProfile(data);
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    }
}; 