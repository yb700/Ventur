export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
    public: {
        Tables: {
            applications: {
                Row: {
                    id: string;
                    reference: string;
                    application_registered: string | null;
                    application_validated: string | null;
                    address: string | null;
                    proposal: string | null;
                    status: string | null;
                    decision: string | null;
                    decision_issued_date: string | null;
                    applicant_name: string | null;
                    url: string | null;
                    content_hash: string | null;
                    last_scraped_at: string;
                    created_at: string;
                    latitude: number | null;
                    longitude: number | null;
                    council_id: string;
                };
                Insert: {
                    id?: string;
                    reference: string;
                    application_registered?: string | null;
                    application_validated?: string | null;
                    address?: string | null;
                    proposal?: string | null;
                    status?: string | null;
                    decision?: string | null;
                    decision_issued_date?: string | null;
                    applicant_name?: string | null;
                    url?: string | null;
                    content_hash?: string | null;
                    last_scraped_at?: string;
                    created_at?: string;
                    latitude?: number | null;
                    longitude?: number | null;
                    council_id?: string;
                };
                Update: Partial<Database['public']['Tables']['applications']['Insert']>;
            };

            bucket_applications: {
                Row: {
                    bucket_id: string;
                    application_id: string;
                    added_at: string;
                };
                Insert: {
                    bucket_id: string;
                    application_id: string;
                    added_at?: string;
                };
                Update: Partial<Database['public']['Tables']['bucket_applications']['Insert']>;
            };

            buckets: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['buckets']['Insert']>;
            };

            draft_letters: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    template_id: string | null;
                    custom_content: string | null;
                    recipient_data: Json | null;
                    merge_data: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    template_id?: string | null;
                    custom_content?: string | null;
                    recipient_data?: Json | null;
                    merge_data?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['draft_letters']['Insert']>;
            };

            letters: {
                Row: {
                    id: string;
                    user_id: string;
                    stannp_letter_id: string;
                    stannp_pdf_url: string | null;
                    status: string;
                    cost: number | null;
                    format: string | null;
                    country: string | null;
                    tags: string | null;
                    template_id: string | null;
                    sent_at: string;
                    bucket_id: string | null;
                    application_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    stannp_letter_id: string;
                    stannp_pdf_url?: string | null;
                    status: string;
                    cost?: number | null;
                    format?: string | null;
                    country?: string | null;
                    tags?: string | null;
                    template_id?: string | null;
                    sent_at?: string;
                    bucket_id?: string | null;
                    application_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['letters']['Insert']>;
            };

            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    address: string | null;
                    email: string | null;
                    logo_url: string | null;
                    onboarding_complete: boolean;
                    updated_at: string;
                    company_name: string | null;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    address?: string | null;
                    email?: string | null;
                    logo_url?: string | null;
                    onboarding_complete?: boolean;
                    updated_at?: string;
                    company_name?: string | null;
                };
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };

            scraper_metadata: {
                Row: {
                    id: string;
                    user_id: string;
                    council_id: string;
                    last_successful_scrape_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    council_id: string;
                    last_successful_scrape_date?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['scraper_metadata']['Insert']>;
            };

            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    amount: number;
                    status: string;
                    stripechargeid: string | null;
                    letterid: string | null;
                    createdat: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    amount: number;
                    status: string;
                    stripechargeid?: string | null;
                    letterid?: string | null;
                    createdat?: string;
                };
                Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
            };

            user_balances: {
                Row: {
                    user_id: string;
                    balance: number;
                    last_top_up_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    balance?: number;
                    last_top_up_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['user_balances']['Insert']>;
            };

            user_templates: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    html_content: string;
                    dynamic_fields_example: Json | null;
                    created_at: string;
                    updated_at: string;
                    layout: 'classic' | 'modern';
                    logo_url: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    html_content: string;
                    dynamic_fields_example?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                    layout?: 'classic' | 'modern';
                    logo_url?: string | null;
                };
                Update: Partial<Database['public']['Tables']['user_templates']['Insert']>;
            };
        };
    };
}
