/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(portal)/templates/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { FilePlus, Trash2, Save, Loader2, AlertTriangle, Image as ImageIcon, ChevronsUpDown, Eye, Edit, Plus } from 'lucide-react';
import TemplateEditor from '@/components/TemplateEditor';
import { Database } from '@/types/supabase';

// Define the type for a letter template
type LetterTemplate = Database['public']['Tables']['user_templates']['Row']

// Define the type for the user's profile data
type UserProfile = Database['public']['Tables']['profiles']['Row']

// Define a working template data structure for the editor
type WorkingTemplate = {
    id?: string;
    user_id?: string;
    title: string;
    html_content: string;
    layout: 'classic' | 'modern';
    logo_url: string | null;
    dynamic_fields_example?: any;
    created_at?: string;
    updated_at?: string;
}

// Define the structure of our pre-made layouts
const LAYOUTS = {
    classic: {
        name: 'Classic Formal',
        structure: (logoUrl: string | null, content: string, profile: UserProfile | null, application: any) => `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; max-width: 21cm; margin: 0 auto; background: white; padding: 2cm;">
        <!-- Letter Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2cm;">
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 5px;">Dear {{ applicant_name }},</div>
            <div style="font-size: 10pt; color: #666; line-height: 1.4;">
              <div>${application?.address?.split(',')[0] || '123 Sample Street'}</div>
              <div>${application?.address?.split(',')[1] || 'Sample Area'}</div>
              <div>${application?.address?.split(',')[2] || 'London'}</div>
              <div>${application?.address?.split(',')[3] || 'SW1A 1AA'}</div>
            </div>
          </div>
          <div style="text-align: right;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 60px; margin-bottom: 10px;"/>` : ''}
            <div style="font-weight: bold; font-size: 14pt; margin-bottom: 5px;">${profile?.company_name || profile?.full_name || 'Your Company Name'}</div>
            <div style="font-size: 10pt; color: #666;">${profile?.address || 'Your Business Address'}</div>
            <div style="font-size: 10pt; color: #666;">${profile?.email || 'your.email@company.com'}</div>
          </div>
        </div>

        <!-- Letter Content -->
        <div style="line-height: 1.6; margin-bottom: 1.5cm;">
          ${content}
        </div>

        <!-- Reference Section -->
        <div style="margin-bottom: 1.5cm; font-size: 10pt; color: #666;">
          <div><strong>Planning Reference:</strong> ${application?.reference || '{{ reference }}'}</div>
          <div><strong>Date:</strong> ${application?.date || '{{ date }}'}</div>
        </div>

        <!-- Letter Footer -->
        <div style="margin-top: 1.5cm;">
          <div style="margin-bottom: 0.5cm;">
            <div style="font-weight: bold;">Yours sincerely,</div>
          </div>
          <div style="font-weight: bold; font-size: 14pt; margin-bottom: 5px;">${profile?.full_name || 'Your Name'}</div>
          <div style="font-size: 10pt; color: #666;">${profile?.company_name || 'Your Company'}</div>
        </div>
      </div>
    `,
    },
    modern: {
        name: 'Modern Clean',
        structure: (logoUrl: string | null, content: string, profile: UserProfile | null, application: any) => `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #333; max-width: 21cm; margin: 0 auto; background: white; padding: 2cm;">
        <!-- Letter Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5cm;">
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">Dear {{ applicant_name }},</div>
            <div style="font-size: 10pt; color: #7f8c8d; line-height: 1.4;">
              <div>${application?.address?.split(',')[0] || '123 Sample Street'}</div>
              <div>${application?.address?.split(',')[1] || 'Sample Area'}</div>
              <div>${application?.address?.split(',')[2] || 'London'}</div>
              <div>${application?.address?.split(',')[3] || 'SW1A 1AA'}</div>
            </div>
          </div>
          <div style="text-align: right;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 50px; margin-bottom: 15px;"/>` : ''}
            <div style="font-weight: bold; font-size: 16pt; color: #2c3e50; margin-bottom: 8px;">${profile?.company_name || profile?.full_name || 'Your Company Name'}</div>
            <div style="font-size: 10pt; color: #7f8c8d; line-height: 1.4;">${profile?.address || 'Your Business Address'}</div>
            <div style="font-size: 10pt; color: #7f8c8d;">${profile?.email || 'your.email@company.com'}</div>
          </div>
        </div>

        <!-- Letter Content -->
        <div style="line-height: 1.8; margin-bottom: 1.5cm; text-align: justify;">
          ${content}
        </div>

        <!-- Reference Section -->
        <div style="margin-bottom: 1.5cm; font-size: 10pt; color: #7f8c8d;">
          <div><strong>Planning Reference:</strong> ${application?.reference || '{{ reference }}'}</div>
          <div><strong>Date:</strong> ${application?.date || '{{ date }}'}</div>
        </div>

        <!-- Letter Footer -->
        <div style="margin-top: 1.5cm;">
          <div style="margin-bottom: 0.5cm;">
            <div style="font-weight: bold; color: #2c3e50;">Yours sincerely,</div>
          </div>
          <div style="font-weight: bold; font-size: 14pt; margin-bottom: 5px; color: #2c3e50;">${profile?.full_name || 'Your Name'}</div>
          <div style="font-size: 10pt; color: #7f8c8d;">${profile?.company_name || 'Your Company'}</div>
        </div>
      </div>
    `,
    }
};

const DEFAULT_TEMPLATE_CONTENT = `<p>We hope this letter finds you well. We are writing regarding your recent planning application for works at <strong>{{ address }}</strong> (Reference: {{ reference }}).</p>

<p>As a local construction company with extensive experience in similar projects, we would be delighted to offer our services for your proposed development. Our team specializes in delivering high-quality construction solutions that meet both your requirements and local planning standards.</p>

<p>We have successfully completed numerous projects in the area and have built a strong reputation for:</p>
<ul style="margin: 20px 0; padding-left: 20px;">
<li>Delivering projects on time and within budget</li>
<li>Maintaining the highest standards of workmanship</li>
<li>Ensuring full compliance with planning conditions</li>
<li>Providing excellent communication throughout the project</li>
</ul>

<p>We would be happy to arrange a no-obligation consultation to discuss your project in detail and provide you with a comprehensive quotation. Our team can visit your site at a time convenient to you to assess the scope of works and answer any questions you may have.</p>

<p>Please feel free to contact us to arrange a meeting or if you would like to see examples of our previous work in the area.</p>

<p>We look forward to the possibility of working with you on this exciting project.</p>`;

export default function TemplatesPageV3() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
    const [activeTemplateData, setActiveTemplateData] = useState<WorkingTemplate | null>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<LetterTemplate | null>(null);
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchInitialData = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const [templatesRes, profileRes] = await Promise.all([
                supabase.from('user_templates').select('*').eq('user_id', currentUser.id).order('updated_at', { ascending: false }),
                supabase.from('profiles').select('*').eq('id', currentUser.id).single()
            ]);

            if (templatesRes.error) throw templatesRes.error;
            if (profileRes.error) throw profileRes.error;

            setProfile(profileRes.data);
            const fetchedTemplates = (templatesRes.data || []) as LetterTemplate[];
            setTemplates(fetchedTemplates);

            if (fetchedTemplates.length > 0) {
                handleSelectTemplate(fetchedTemplates[0]);
            } else {
                setSelectedTemplate(null);
                setActiveTemplateData(null);
            }
        } catch (error) {
            const err = error as { message: string };
            showNotification(`Failed to load data: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                fetchInitialData(user);
            } else {
                router.push('/auth/login');
            }
        };
        init();
    }, [router, fetchInitialData]);

    const handleSelectTemplate = (template: LetterTemplate) => {
        setSelectedTemplate(template);
        setActiveTemplateData({
            id: template.id,
            user_id: template.user_id,
            title: template.title,
            html_content: template.html_content,
            layout: template.layout,
            logo_url: template.logo_url,
            dynamic_fields_example: template.dynamic_fields_example,
            created_at: template.created_at,
            updated_at: template.updated_at,
        });
        setActiveTab('edit');
    };

    const handleNewTemplate = (layout: 'classic' | 'modern') => {
        const newTemplate: WorkingTemplate = {
            title: `New ${LAYOUTS[layout].name} Template`,
            html_content: DEFAULT_TEMPLATE_CONTENT,
            layout: layout,
            logo_url: profile?.logo_url || null,
        };
        setActiveTemplateData(newTemplate);
        setSelectedTemplate(null);
        setActiveTab('edit');
        setShowEditor(true);
        (document.getElementById('layout_modal') as HTMLDialogElement)?.close();
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        setIsSaving(true);
        const filePath = `logos/${user.id}/${Date.now()}_${file.name}`;
        try {
            const { data, error } = await supabase.storage
                .from('user-uploads')
                .upload(filePath, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage
                .from('user-uploads')
                .getPublicUrl(filePath);
            setActiveTemplateData(prev => prev ? { ...prev, logo_url: publicUrl } : null);
            showNotification('Logo uploaded successfully!', 'success');
        } catch (err: any) {
            showNotification(`Upload failed: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (file: File): Promise<string> => {
        if (!user) throw new Error('User not authenticated');
        const filePath = `images/${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('user-uploads')
            .upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
            .from('user-uploads')
            .getPublicUrl(filePath);
        return publicUrl;
    };

    const handleSaveTemplate = async () => {
        if (!user || !activeTemplateData || !activeTemplateData.title.trim()) {
            showNotification('Please provide a template title', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const templateData = {
                ...activeTemplateData,
                user_id: user.id,
            };
            const { data, error } = await supabase
                .from('user_templates')
                .upsert(templateData)
                .select()
                .single();
            if (error) throw error;
            showNotification('Template saved successfully!', 'success');
            setActiveTemplateData(null);
            setShowEditor(false);
            // Refresh templates list
            const { data: updatedTemplates } = await supabase
                .from('user_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });
            if (updatedTemplates) setTemplates(updatedTemplates);
        } catch (err: any) {
            showNotification(`Save failed: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteModal = (template: LetterTemplate) => {
        setTemplateToDelete(template);
        (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
    };

    const handleDeleteTemplate = async () => {
        if (!user || !templateToDelete) return;
        setIsSaving(true);
        try {
            await supabase.from('user_templates').delete().eq('id', templateToDelete.id);
            showNotification(`Template "${templateToDelete.title}" deleted.`, 'success');
            const updatedTemplates = templates.filter(t => t.id !== templateToDelete.id);
            setTemplates(updatedTemplates);
            if (selectedTemplate?.id === templateToDelete.id) {
                if (updatedTemplates.length > 0) {
                    handleSelectTemplate(updatedTemplates[0]);
                } else {
                    setActiveTemplateData(null);
                    setSelectedTemplate(null);
                }
            }
        } catch (error) {
            const err = error as { message: string };
            showNotification(`Delete failed: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
            setTemplateToDelete(null);
        }
    };

    const renderedPreview = useMemo(() => {
        if (!activeTemplateData || !profile) return '';
        const layoutFunction = LAYOUTS[activeTemplateData.layout].structure;
        const previewContent = activeTemplateData.html_content.replace(/{{(.*?)}}/g, `<span class="font-semibold text-primary">[$1]</span>`);
        // Mock application data for preview
        const mockApplication = {
            address: '123 Sample Street, London, SW1A 1AA',
            reference: 'SAMPLE/2024/001',
            date: new Date().toLocaleDateString('en-GB')
        };
        return layoutFunction(activeTemplateData.logo_url, previewContent, profile, mockApplication);
    }, [activeTemplateData, profile]);

    const renderedSelectedTemplatePreview = useMemo(() => {
        if (!selectedTemplate || !profile) return '';
        const layoutFunction = LAYOUTS[selectedTemplate.layout].structure;
        const previewContent = selectedTemplate.html_content.replace(/{{(.*?)}}/g, `<span class="font-semibold text-primary">[$1]</span>`);
        // Mock application data for preview
        const mockApplication = {
            address: '123 Sample Street, London, SW1A 1AA',
            reference: 'SAMPLE/2024/001',
            date: new Date().toLocaleDateString('en-GB')
        };
        return layoutFunction(selectedTemplate.logo_url, previewContent, profile, mockApplication);
    }, [selectedTemplate, profile]);

    return (
        <div className="min-h-screen">
            {/* Notification Toast */}
            {notification && (
                <div className="toast toast-top toast-center z-50">
                    <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="container mx-auto p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Letter Templates</h2>
                                <button
                                    onClick={() => setShowNewTemplateModal(true)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Template
                                </button>
                            </div>

                            {/* Template List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{template.title}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {template.layout === 'classic' ? 'Classic Formal' : 'Modern Clean'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectTemplate(template);
                                                        setActiveTab('edit');
                                                    }}
                                                    className="btn btn-ghost btn-xs"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(template);
                                                    }}
                                                    className="btn btn-ghost btn-xs text-error hover:text-error"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:w-2/3">
                        {showEditor && activeTemplateData ? (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50">
                                {/* Editor Header */}
                                <div className="p-6 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                placeholder="Template Name"
                                                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                                                value={activeTemplateData.title}
                                                onChange={(e) => setActiveTemplateData(prev => prev ? { ...prev, title: e.target.value } : null)}
                                            />
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {activeTemplateData.layout === 'classic' ? 'Classic Formal' : 'Modern Clean'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowEditor(false)}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveTemplate}
                                                disabled={isSaving}
                                                className="btn btn-primary btn-sm"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Template
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Editor Content */}
                                <div className="p-0">
                                    {/* Preview/Edit Toggle */}
                                    <div className="flex items-center justify-center gap-2 p-4 border-b border-gray-200/50">
                                        <button
                                            onClick={() => setActiveTab('edit')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'edit'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Edit className="w-4 h-4 inline mr-2" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('preview')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'preview'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Eye className="w-4 h-4 inline mr-2" />
                                            Preview
                                        </button>
                                    </div>

                                    {activeTab === 'edit' ? (
                                        <TemplateEditor
                                            content={activeTemplateData.html_content}
                                            onUpdate={content => setActiveTemplateData(p => p ? { ...p, html_content: content } : null)}
                                            onImageUpload={handleImageUpload}
                                        />
                                    ) : (
                                        <div className="p-6 bg-gray-50">
                                            <div className="bg-white shadow-2xl rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto border border-gray-200"
                                                style={{
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                                                    background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: renderedPreview }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : selectedTemplate ? (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                                        <p className="text-gray-600">
                                            {selectedTemplate.layout === 'classic' ? 'Classic Formal' : 'Modern Clean'} Layout
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setActiveTemplateData(selectedTemplate as WorkingTemplate);
                                                setShowEditor(true);
                                            }}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Template
                                        </button>
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                {/* Template Preview */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="prose max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: renderedSelectedTemplatePreview }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                                <div className="text-center py-12">
                                    <FilePlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Template Selected</h3>
                                    <p className="text-gray-600 mb-6">
                                        Select a template from the sidebar or create a new one to get started.
                                    </p>
                                    <button
                                        onClick={() => setShowNewTemplateModal(true)}
                                        className="btn btn-primary"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Template
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Modals */}
            {showNewTemplateModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Choose a Layout</h3>
                        <p className="text-gray-600 mb-6">
                            Select a base layout for your new template. You can customize it further in the editor.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div
                                className="card bg-gray-100 hover:shadow-lg cursor-pointer transition-all hover:scale-105 border border-gray-200"
                                onClick={() => handleNewTemplate('classic')}
                            >
                                <div className="card-body items-center text-center">
                                    <div className="text-3xl mb-2">📜</div>
                                    <h4 className="card-title text-base">Classic Formal</h4>
                                    <p className="text-xs text-gray-600">
                                        Traditional, professional letter layout with header and footer
                                    </p>
                                </div>
                            </div>
                            <div
                                className="card bg-gray-100 hover:shadow-lg cursor-pointer transition-all hover:scale-105 border border-gray-200"
                                onClick={() => handleNewTemplate('modern')}
                            >
                                <div className="card-body items-center text-center">
                                    <div className="text-3xl mb-2">📄</div>
                                    <h4 className="card-title text-base">Modern Clean</h4>
                                    <p className="text-xs text-gray-600">
                                        Clean, contemporary design with modern typography
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowNewTemplateModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {templateToDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </h3>
                        <p className="py-4">
                            Are you sure you want to delete <strong>&quot;{templateToDelete.title}&quot;</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost mr-2"
                                onClick={() => setTemplateToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleDeleteTemplate}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Template'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedTemplate && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-4xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Template Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="btn btn-ghost btn-sm"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-[80vh] overflow-y-auto">
                            <div className="bg-white shadow-2xl rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto border border-gray-200"
                                style={{
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                                    background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)'
                                }}
                                dangerouslySetInnerHTML={{ __html: renderedSelectedTemplatePreview }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
